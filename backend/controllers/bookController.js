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

// controller to use detectGenre
const fetchBooksFromGutendex = async (req, res) => {
  try {
    const response = await axios.get("https://gutendex.com/books/");
    const booksData = response.data.results;

    const savedBooks = [];

    for (const book of booksData) {
      const formats = book.formats;
      const contentUrl =
        formats["text/plain; charset=utf-8"] ||
        formats["text/plain"] ||
        formats["application/epub+zip"] ||
        formats["application/x-mobipocket-ebook"] ||
        formats["text/html; charset=utf-8"] ||
        formats["text/html"] ||
        null;

      if (!contentUrl) {
        console.log(`No content URL for book: ${book.title}`);
        continue;
      }

      const genreName = detectGenre(book.subjects || []);
      let genre = await Genre.findOne({ name: genreName });

      // If genre doesn't exist, create it
      if (!genre) {
        genre = await Genre.create({ name: genreName });
      }

      const newBook = new Book({
        title: book.title,
        author: book.authors.length ? book.authors[0].name : "Unknown",
        url: contentUrl,
        coverImage: formats["image/jpeg"] || "",
        genre: genre._id,
        desc: book.subjects.join(", ") || "No description available",
      });

      const savedBook = await newBook.save();
      savedBooks.push(savedBook);
    }

    res.json({ success: true, data: savedBooks });
  } catch (error) {
    console.error("Error fetching or saving books:", error);
    res.status(500).json({ success: false, message: "Failed to fetch/save books" });
  }
};


module.exports = { fetchBooksFromGutendex };
