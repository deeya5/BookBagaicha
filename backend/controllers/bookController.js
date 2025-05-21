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
const fetchBookContent = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || !url.startsWith("http")) {
      return res.status(400).json({ message: "Invalid or missing URL." });
    }

    // Reject URLs that point to Gutenberg landing pages and EPUB files
    if (url.includes("/ebooks/") && 
        !url.includes(".txt") && 
        !url.includes(".html") && 
        url.includes(".epub")) {
      return res.status(400).json({ 
        message: "EPUB format not supported for direct reading. Please download the file instead."
      });
    }

    // For text files, fetch as text
    const response = await axios.get(url, {
      responseType: "text",
      headers: {
        // User agent to avoid being blocked by some servers
        'User-Agent': 'Mozilla/5.0 (compatible; BookReaderBot/1.0)'
      }
    });

    res.setHeader("Content-Type", "text/plain");
    res.send(response.data);
  } catch (error) {
    console.error("Failed to fetch external book content:", error.message);
    res.status(500).json({ message: "Failed to fetch external book content." });
  }
};

module.exports = {
  fetchBooksFromGutendex,
  getBookById,
  fetchBookContent,
};
