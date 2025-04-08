const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");

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

// Use routes
app.use("/api/v1", userRoutes);
app.use("/api/v1", bookRoutes);
app.use("/api/v1", favouriteRoutes);
app.use("/api/auth", authRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/v1", uploadRoutes);
app.use("/api/v1", genreRoutes);

// Debugging Log to check if user routes are loaded
console.log("✅ User routes loaded successfully!");

// Handle invalid routes (404 error)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start the server
const PORT = process.env.PORT || 1000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
