const express = require("express");
const mongoose = require("mongoose");
const Review = require("../models/review");
const Book = require("../models/book");
const User = require("../models/user");
const { authenticateToken } = require("./userAuth");
const router = express.Router();

// GET all reviews (for admin) — must come BEFORE /:bookId
router.get("/get-all-reviews", async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "username")
      .populate("book", "title");

    res.status(200).json({ status: "Success", reviews: reviews });
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({ message: "Error fetching all reviews" });
  }
});



router.put("/:reviewId", authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    // Validate reviewId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    // At least rating or comment must be provided
    if (rating === undefined && comment === undefined) {
      return res.status(400).json({ message: "Please provide rating or comment to update" });
    }

    // Find the review by ID
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only allow review owner to update
    if (review.user.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to update this review" });
    }

    // Update fields if provided
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    res.status(200).json({ message: "Review updated successfully", review });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Server error while updating review" });
  }
});


//  POST a review for a book
router.post("/:bookId", authenticateToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { bookId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const bookExists = await Book.findById(bookId);
    if (!bookExists) {
      return res.status(404).json({ message: "Book not found" });
    }

    const newReview = new Review({ user: userId, book: bookId, rating, comment });
    await newReview.save();

    res.status(201).json({ message: "Review submitted successfully", review: newReview });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ message: "Server error while submitting review" });
  }
});

// GET all reviews for a specific book
router.get("/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    // Fetch reviews with populated user and book info
    const reviews = await Review.find({ book: bookId })
      .populate("user", "username")  // Populate 'user' field with 'username' field only
      .populate("book", "title");    // Populate 'book' field with 'title' only

    if (reviews.length === 0) {
      return res.status(404).json({ message: "No reviews found for this book" });
    }

    res.status(200).json({ status: "Success", data: reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Error fetching reviews" });
  }
});


module.exports = router;
