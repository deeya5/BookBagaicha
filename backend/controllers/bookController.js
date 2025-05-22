const axios = require("axios");
const Book = require("../models/book");
const Genre = require("../models/genre");

const detectGenre = (subjects) => {
  const genreMap = {
    Fiction: ["fiction", "novel", "story"],
    Philosophy: ["philosophy"],
    Science: ["science", "scientific"],
    History: ["history", "historical"],
    Religion: ["religion", "theology"],
    Biography: ["biography"],
    Poetry: ["poetry", "poems"],
    Drama: ["drama", "plays"],
    Adventure: ["adventure"],
    Children: ["children", "juvenile"],
  };

  for (const subject of subjects) {
    for (const [genre, keywords] of Object.entries(genreMap)) {
      if (keywords.some((kw) => subject.toLowerCase().includes(kw))) {
        return genre;
      }
    }
  }

  return "Miscellaneous";
};

// Assuming this is part of your bookController.js file

const fetchBooksFromGutendex = async (req, res) => {
  try {
    const userId = req.user._id; // Get the current user's ID from the request
    
    // Fetch books from Gutendex API
    const response = await axios.get("https://gutendex.com/books/");
    const gutendexBooks = response.data.results;
    
    // Transform and save the books with the required uploadedBy field
    const booksToSave = gutendexBooks.map(book => ({
      title: book.title,
      author: book.authors?.length > 0 ? book.authors[0].name : "Unknown",
      description: `A classic work from Gutendex library.`,
      coverImage: book.formats["image/jpeg"] || null,
      language: book.languages?.[0] || "en",
      genre: "Classic", // You may want to determine genre more specifically
      uploadedBy: userId, // Set the current user as the uploader
      isFromGutendex: true, // Add a flag to identify Gutendex books
      // Add other necessary fields
    }));
    
    // Use insertMany with ordered: false to continue even if some documents fail
    // and use mongoose's bulkSave option to validate each document
    const savedBooks = await Book.insertMany(booksToSave, {
      ordered: false,
      // To avoid duplicate books if you run this multiple times
      // You might want to add more fields to this check
      skipDuplicates: true 
    });
    
    // Get user uploaded books as well
    const userBooks = await Book.find({ isFromGutendex: { $ne: true } });
    
    // Combine both sources of books
    const allBooks = [...savedBooks, ...userBooks];
    
    return res.status(200).json({
      success: true,
      data: allBooks
    });
  } catch (error) {
    console.warn("Error fetching or saving books:", error);
    
    // Even if there was an error saving some books, try to return any books we can find
    try {
      const existingBooks = await Book.find({});
      
      if (existingBooks.length > 0) {
        return res.status(200).json({
          success: true,
          data: existingBooks,
          warning: "Some new books could not be saved, but returning existing books."
        });
      }
    } catch (fallbackError) {
      console.error("Fallback error:", fallbackError);
    }
    
    return res.status(500).json({
      success: false,
      message: "Error fetching books. Please try again later.",
      error: error.message
    });
  }
};

// Add this function to get all books regardless of source
const getAllBooks = async (req, res) => {
  try {
    // Fetch all books, both from Gutendex and user-uploaded
    const allBooks = await Book.find({})
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate('uploadedBy', 'name'); // Get uploader's name if needed
    
    return res.status(200).json({
      success: true,
      count: allBooks.length,
      data: allBooks
    });
  } catch (error) {
    console.error("Error fetching all books:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching books. Please try again later.",
      error: error.message
    });
  }
};

// controller to get a single book by ID
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('genre');
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    console.error("Error fetching book by ID:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// controller to fetch book content by URL
const fetchContent = async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ success: false, message: "URL is required" });
  }

  try {
    // Configure axios with better timeout and retry options
    const response = await axios.get(url, {
      timeout: 20000, // 20 seconds timeout
      responseType: 'text',
      headers: {
        'Accept': 'text/plain,text/html,application/xhtml+xml',
        'User-Agent': 'BookBagaicha/1.0'
      },
      // Use a proxy if you have one configured (optional)
      // proxy: {
      //   host: 'your-proxy-host',
      //   port: your-proxy-port
      // },
      maxContentLength: 20 * 1024 * 1024, // 20MB max size
      maxRedirects: 5
    });
    
    return res.status(200).send(response.data);
  } catch (error) {
    console.error("Error fetching content:", error);
    
    // Check if the error is from Project Gutenberg
    if (url.includes('gutenberg.org')) {
      return res.status(503).json({
        success: false,
        message: "Unable to connect to Project Gutenberg. The server might be temporarily unavailable.",
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Failed to fetch content",
      error: error.message
    });
  }
};

// If you want to implement a more robust solution with retries and mirrors
const fetchContentRobust = async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ success: false, message: "URL is required" });
  }

  const MAX_RETRIES = 3;
  let currentRetry = 0;
  let lastError = null;

  // Function to try fetching with exponential backoff
  const tryFetch = async (fetchUrl) => {
    try {
      const response = await axios.get(fetchUrl, {
        timeout: 15000 + (currentRetry * 5000), // Increase timeout with each retry
        responseType: 'text',
        headers: {
          'Accept': 'text/plain,text/html,application/xhtml+xml',
          'User-Agent': 'BookBagaicha/1.0'
        },
        maxContentLength: 20 * 1024 * 1024,
        maxRedirects: 5
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${currentRetry + 1} failed for ${fetchUrl}:`, error.message);
      return { success: false, error };
    }
  };

  // Generate alternative URLs for Project Gutenberg
  const getAlternativeUrls = (originalUrl) => {
    if (!originalUrl.includes('gutenberg.org')) return [];
    
    return [
      // Mirror sites
      originalUrl.replace('www.gutenberg.org', 'gutenberg.pglaf.org'),
      originalUrl.replace('www.gutenberg.org', 'gutenberg.readingroo.ms'),
      
      // Alternative file formats
      originalUrl.replace(/(\d+)-0.txt$/, '$1.txt'),
      originalUrl.replace(/(\d+).txt$/, '$1-0.txt'),
      originalUrl.replace(/(\d+).txt$/, '$1-8.txt'),
      
      // Try archive.org as last resort
      `https://web.archive.org/web/2023/${originalUrl}`
    ];
  };

  // Try original URL with retries
  while (currentRetry < MAX_RETRIES) {
    const result = await tryFetch(url);
    if (result.success) {
      return res.status(200).send(result.data);
    }
    
    currentRetry++;
    
    if (currentRetry < MAX_RETRIES) {
      // Wait with exponential backoff before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, currentRetry)));
    }
  }

  // If original URL failed, try alternatives
  const alternativeUrls = getAlternativeUrls(url);
  
  for (const altUrl of alternativeUrls) {
    const result = await tryFetch(altUrl);
    if (result.success) {
      return res.status(200).send(result.data);
    }
  }

  // If all attempts failed
  return res.status(503).json({
    success: false,
    message: "Unable to fetch content after multiple attempts",
    error: lastError?.message || "Unknown error"
  });
};


module.exports = {
  fetchBooksFromGutendex,
  getBookById,
  fetchContent,
  fetchContentRobust
};
