const express = require("express");
const app = express();
const cors = require('cors'); // Import CORS
const passport = require("passport");
const dotenv = require("dotenv");
const session = require("express-session");

// Load environment variables from the .env file
dotenv.config();

// Middleware to parse incoming requests as JSON
app.use(express.json());

// Enable CORS for all routes
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"], // Allow auth header
  }));

// Database connection
require("./conn/conn"); // Ensure this contains your database connection logic

// Routes
const user = require("./routes/user");
const books = require("./routes/book");
const favourite = require("./routes/favourite");
const authRoutes = require("./routes/auth");

// Use routes
app.use("/api/v1", user);
app.use("/api/v1", books);
app.use("/api/v1", favourite);
app.use("/api/auth", authRoutes); 

// Handle invalid routes (404 error)
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});

// Start the server
app.listen(process.env.PORT || 1000, () => {
    console.log(`Server started on port ${process.env.PORT || 1000}`);
});