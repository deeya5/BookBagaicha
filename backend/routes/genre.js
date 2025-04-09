const router = require("express").Router();
const Genre = require("../models/genre");
const { authenticateToken } = require("./userAuth");

// Get all genres
router.get("/get-all-genres", authenticateToken, async (req, res) => {
  try {
    const genres = await Genre.find().sort({ name: 1 });
    res.status(200).json({ genres });
  } catch (error) {
    res.status(500).json({ message: "Error fetching genres" });
  }
});

// Get all book count
router.get("/get-total-genres", async (req, res) => {
  try {
    const genreCount = await Genre.countDocuments();
    res.status(200).json({ totalGenres: genreCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching genres" });
  }
});

module.exports = router;

