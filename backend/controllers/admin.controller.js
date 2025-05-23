//admincontroller
const User = require("../models/user");
const Book = require("../models/book"); 
const Genre = require("../models/genre"); 
const Review = require("../models/review"); 

const mongoose = require("mongoose");

// Approve a book
exports.approveBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    book.approved = true;
    await book.save();
    res.json({ message: "Book approved successfully", book });
  } catch (error) {
    console.error("Error approving book:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};



exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  // Check if the ID is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    // Attempt to find and delete the user
    const user = await User.findByIdAndDelete(id);
    
    // If the user is not found, return a 404 error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ["user", "author"] } });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const newUser = new User({ username, email, password, role });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to create user" });
  }
};



exports.updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update user" });
  }
};

// exports.deleteUser = async (req, res) => {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid user ID" });
//     }
//     try {
//       const user = await User.findByIdAndDelete(id);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
//       res.status(200).json({ message: "User deleted" });
//     } catch (error) {
//       res.status(500).json({ message: "Failed to delete user" });
//     }
//   };
  

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch books" });
  }
};

exports.createBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: "Failed to create book" });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update book" });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Book deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete book" });
  }
};

exports.getAllGenres = async (req, res) => {
  try {
    const genres = await Genre.find();
    res.status(200).json(genres);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch genres" });
  }
};

exports.createGenre = async (req, res) => {
  try {
    const genre = await Genre.create(req.body);
    res.status(201).json(genre);
  } catch (error) {
    res.status(500).json({ message: "Failed to create genre" });
  }
};

exports.updateGenre = async (req, res) => {
  try {
    const updated = await Genre.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update genre" });
  }
};

exports.deleteGenre = async (req, res) => {
  try {
    await Genre.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Genre deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete genre" });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find();
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review" });
  }
};
