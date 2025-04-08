const mongoose = require("mongoose");

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate genres
  },
  bookCount: {
    type: Number,
    default: 0, // Keeps track of how many books belong to this genre
  },
});

module.exports = mongoose.model("Genre", genreSchema);
