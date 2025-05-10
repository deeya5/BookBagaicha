const router = require("express").Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const multer = require("multer");
const path = require("path");
const Book = require("../models/book");
const { authenticateToken } = require("./userAuth");
const Genre = require("../models/genre");
const { fetchBooksFromGutendex } = require("../controllers/bookController"); // importing function
const fs = require('fs');


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
      approved: false,
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
      approved: false,
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

router.get("/fetch-book-content", authenticateToken, async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ message: "URL is required" });

    const response = await axios.get(url);
    res.send(response.data);
  } catch (error) {
    console.error("Failed to fetch external book content:", error);
    res.status(500).json({ message: "Failed to fetch book content" });
  }
});

// Get books uploaded by the logged-in user
router.get("/my-books", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const books = await Book.find({ uploader: id }).populate("genre");
    return res.status(200).json({ status: "Success", data: books });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user's books" });
  }
});


// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/pdfs/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });
router.post("/upload", upload.fields([
  { name: "pdf", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
]), async (req, res) => {
  try {
    console.log("REQ FILES:", req.files);
    console.log("REQ BODY:", req.body);

   // Find genre by name (case-insensitive)
   let genreDoc = await Genre.findOne({ name: new RegExp(`^${req.body.genre}$`, 'i') });

   if (!genreDoc) {
     genreDoc = new Genre({ name: req.body.genre });
     await genreDoc.save();
   }
   
   const newBook = new Book({
     title: req.body.title,
     author: req.body.author,
     genre: genreDoc._id,
     desc: req.body.desc,
     url: `/uploads/pdfs/${req.files.pdf[0].filename}`,
     coverImage: `/uploads/pdfs/${req.files.coverImage[0].filename}`,
   });
   

    await newBook.save();
    res.status(201).json({ message: "Book uploaded successfully" });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/get-pending-books", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const user = await User.findById(id);
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const pendingBooks = await Book.find({ approved: false }).populate("genre");
    return res.status(200).json({ status: "Success", data: pendingBooks });
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending books" });
  }
});

router.put("/approve-book/:id", authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.headers;
    const user = await User.findById(userId);
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can approve books" });
    }

    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    book.approved = true;
    await book.save();

    res.status(200).json({ message: "Book approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve book" });
  }
});

// GET /api/books/download/:bookId
router.get('/download/:bookId', async (req, res) => {
  const { bookId } = req.params;

  const downloadUrl = `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`; // Plain text version

  try {
    const response = await axios.get(downloadUrl, { responseType: 'stream' });

    const filePath = path.join(__dirname, `../downloads/${bookId}.txt`);

    // Save to local file system
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      res.json({ success: true, message: 'Book saved for offline reading.' });
    });

    writer.on('error', () => {
      res.status(500).json({ error: 'Failed to save the book.' });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch book content.' });
  }
});

// GET /api/books/content/:bookId
router.get('/content/:bookId', async (req, res) => {
  const { bookId } = req.params;
  const downloadUrl = `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`; // fallback format

  try {
    const response = await axios.get(downloadUrl);
    res.send(response.data); // Send plain text content
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch book content.' });
  }
});


module.exports = router;
