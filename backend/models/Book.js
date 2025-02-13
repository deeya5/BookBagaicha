// models/Book.js
const mongoose = require('mongoose');

// Define the schema for the Book model
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },  // The name of the book
  author: { type: String, required: true },  // The author of the book
  genre: { 
    type: String, 
    required: true, 
    enum: ['romance', 'fiction', 'fantasy'],  // Define allowed genres
  },
  picture: { type: String, required: true },  // The URL or path to the book picture
});

// Create the Book model using the schema
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
