const express = require('express');
const Book = require('../models/Book'); // Import the Book model

const router = express.Router();

// POST route to add a new book
router.post('/api/books', async (req, res) => {
  const { title, author, genre, picture } = req.body;

  try {
    // Create a new book using the Book model
    const newBook = new Book({
      title,
      author,
      genre,
      picture,
    });

    // Save the new book to the database
    await newBook.save();
    res.status(201).json({ message: 'Book added successfully', book: newBook });
  } catch (err) {
    res.status(500).json({ message: 'Error adding book', error: err });
  }
});

module.exports = router;
