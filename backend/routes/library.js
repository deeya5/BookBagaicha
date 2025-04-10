const express = require("express");
const router = express.Router();
const Library = require("../models/library");
const { authenticateToken } = require("./userAuth");

// Add book to user's library
router.post("/add", authenticateToken, async (req, res) => {
  const { bookId, currentlyReading = false } = req.body;
  console.log("Received body:", req.body);

  try {
    const userId = req.user.id;
    console.log("Authenticated user ID:", userId);

    if (!userId) {
      console.log("Error: No user ID found in token");
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    const existingEntry = await Library.findOne({ user: userId, book: bookId });
    console.log("Existing entry:", existingEntry);

    if (existingEntry) {
      if (existingEntry.currentlyReading !== currentlyReading) {
        existingEntry.currentlyReading = currentlyReading;
        await existingEntry.save();
        return res.status(200).json({ message: "Book reading status updated" });
      }

      return res.status(400).json({ message: "Book already in library" });
    }

    const newLibraryEntry = new Library({
      user: userId,
      book: bookId,
      currentlyReading,
    });

    console.log("New library entry to save:", newLibraryEntry);
    await newLibraryEntry.save();
    return res.status(201).json({ message: "Book added to library" });
  } catch (error) {
    console.error("Library add error:", error);
    res.status(500).json({ message: "Server error while adding to library", error });
  }
});


router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from token
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }
    // Fetch user's books
    const libraryBooks = await Library.find({ user: userId }).populate("book");
    if (!libraryBooks) {
      return res.status(404).json({ message: "No books found in library" });
    }
    res.status(200).json(libraryBooks);
  } catch (error) {
    console.error("Library fetch error:", error);
    res.status(500).json({ message: "Server error while fetching library" });
  }
});


// Fetch library books for authenticated user
router.get("/library", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from the token

    // Query the database for the user's library
    const books = await Library.find({ user: userId });
    res.json(books); // Return the books to the frontend
  } catch (error) {
    console.error("Error fetching library books:", error);
    res.status(500).json({ message: "Server error while fetching library." });
  }
});



module.exports = router;
