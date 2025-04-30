const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/128/3177/3177440.png",
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "author", "admin_user", "admin_book", "super_admin"],
  },
  permissions: {
    type: [String], // e.g., ['manageUsers', 'manageBooks']
    default: [],
  },
  favourites: {
    type: mongoose.Types.ObjectId,
    ref: "books",
  },
  library: {
    type: mongoose.Types.ObjectId,
    ref: "books",
  },
});

module.exports = mongoose.model("User", userSchema);
