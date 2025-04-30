const router = require("express").Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const Book = require("../models/book");
const { authenticateToken } = require("./userAuth");
const Genre = require("../models/genre");
const { fetchBooksFromGutendex } = require("../controllers/bookController"); // Import function properly

// Add book by admin
router.post("/add-book", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const user = await User.findById(id);
    if (user.role !== "admin") {
      return res.status(400).json({ message: "Only accessible by Admin." });
    }

    let genre = await Genre.findOne({ name: req.body.genre });
    if (!genre) {
      genre = new Genre({ name: req.body.genre, bookCount: 0 });
      await genre.save();
    }

    const book = new Book({
      url: req.body.url,
      title: req.body.title,
      author: req.body.author,
      genre: genre._id,
      desc: req.body.desc,
    });

    await book.save();
    genre.bookCount += 1;
    await genre.save();

    res.status(200).json({ message: "Book added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update book
router.put("/update-book", authenticateToken, async (req, res) => {
  try {
    const { bookid } = req.headers;
    await Book.findByIdAndUpdate(bookid, {
      url: req.body.url,
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      desc: req.body.desc,
    });
    return res.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
});

// Delete book
router.delete("/delete-book", authenticateToken, async (req, res) => {
  try {
    const { bookid } = req.headers;
    const book = await Book.findById(bookid);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    await Genre.findByIdAndUpdate(book.genre, { $inc: { bookCount: -1 } });
    await Book.findByIdAndDelete(bookid);

    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
});

// Get all books
router.get("/get-all-books", authenticateToken, async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }).populate("genre");
    return res.json({ status: "Success", data: books });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
});

// Get recently added books
router.get("/get-recent-books", authenticateToken, async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }).limit(4);
    return res.json({ status: "Success", data: books });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
});

// Get book by ID
router.get("/get-book-by-id/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Requested book ID:", id);
    const book = await Book.findById(id);
    if (!book) {
      console.log("Book not found in DB.");
      return res.status(404).json({ message: "Book not found" });
    }

    return res.json({ status: "Success", data: book });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
});

// Get books from Gutendex API
router.get("/get-books-from-gutendex", fetchBooksFromGutendex);

// Search for books by title
router.get("/search-books", async (req, res) => {
  try {
    const { title } = req.query; // Get search query from URL parameter
    if (!title) {
      return res.status(400).json({ message: "Title query parameter is required" });
    }

    // Find books with titles that contain the search query (case-insensitive)
    const books = await Book.find({
      title: { $regex: title, $options: "i" } // Case-insensitive regex search
    }).populate("genre");

    if (books.length === 0) {
      return res.status(404).json({ message: "No books found matching the search query" });
    }

    return res.status(200).json({
      status: "Success",
      data: books,
    });
  } catch (error) {
    console.error("Error searching books:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;
