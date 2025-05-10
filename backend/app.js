const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const path = require('path');


const jwt = require("jsonwebtoken");

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  jwt.verify(token, "bookbagaicha5", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

// Load environment variables
dotenv.config();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Database connection
require("./conn/conn");

// Routes
const userRoutes = require("./routes/user");
const bookRoutes = require("./routes/book");
const favouriteRoutes = require("./routes/favourite");
const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
const genreRoutes = require("./routes/genre");
const activityRoutes = require("./routes/activityLog"); 
const libraryRoutes = require("./routes/library");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/admin.routes");


// Use routes
app.use("/api/v1", userRoutes);
app.use("/api/v1", bookRoutes);
app.use("/api/v1", favouriteRoutes);
app.use("/api/auth", authRoutes);
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use("/api/v1", uploadRoutes);
app.use("/api/v1", genreRoutes);
app.use("/api/v1", activityRoutes);
app.use("/api/v1/library", libraryRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/admin", adminRoutes);


// Debugging Log to check if user routes are loaded
console.log("User routes loaded successfully!");

// Handle invalid routes (404 error)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(" Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start the server
const PORT = process.env.PORT || 1000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});