const axios = require("axios");

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

// controller to use detectGenre
const fetchBooksFromGutendex = async (req, res) => {
  try {
    const response = await axios.get("https://gutendex.com/books/");
    const books = response.data.results.map((book) => {
      // Get the book content URL, prefer text/plain (if available)
      const contentUrl = book.formats["text/plain"] ||
                         book.formats["text/html"] ||
                         null;

      // If no valid content URL exists, skip this book or handle accordingly
      if (!contentUrl) {
        console.log(`No content URL available for book: ${book.title}`);
        return null;
      }

      return {
        title: book.title,
        author: book.authors.length ? book.authors[0].name : "Unknown",
        url: contentUrl, // ✅ The content URL
        coverImage: book.formats["image/jpeg"] || "",
        genre: detectGenre(book.subjects || []), // 🔍 Use the helper here
        desc: book.subjects.join(", ") || "No description available",
      };
    }).filter(book => book !== null); // Filter out books with no valid content URL

    res.json({ success: true, data: books });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ success: false, message: "Failed to fetch books" });
  }
};

module.exports = { fetchBooksFromGutendex };
