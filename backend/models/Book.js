const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    genre: {
      type: mongoose.Schema.Types.ObjectId, // Reference to Genre Model
      ref: "Genre",
      required: true,
    },
    coverImage: {  
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
