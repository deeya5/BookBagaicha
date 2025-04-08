const axios = require("axios");

const fetchBooksFromGutendex = async (req, res) => {
  try {
    const response = await axios.get("https://gutendex.com/books/");
    const books = response.data.results.map((book) => ({
      title: book.title,
      author: book.authors.length ? book.authors[0].name : "Unknown",
      url: book.formats["text/html"] || book.formats["text/plain"],
      coverImage: book.formats["image/jpeg"] || "", // Extract book cover
      genre: "Unknown",
      desc: book.subjects.join(", ") || "No description available",
    }));

    res.json({ success: true, data: books });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ success: false, message: "Failed to fetch books" });
  }
};

module.exports = { fetchBooksFromGutendex };
