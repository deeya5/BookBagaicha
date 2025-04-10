const mongoose = require("mongoose");

const user = new mongoose.Schema({
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
        default: "user", // Default role is "user"
        enum: ["user", "admin_user", "admin_book", "super_admin", "author"], // Added admin roles
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

module.exports = mongoose.model("user", user);
