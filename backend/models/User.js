const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
    required: function () {
      return !this.googleId; // only require password if not using Google login
    },
  },
  googleId: {
    type: String,
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
    type: [String],
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
