const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const authenticateToken = require("../routes/userAuth").authenticateToken;
const authorizePermissions = require("../middleware/authorizePermissions");

// User / Author routes
router.get("/users", authenticateToken, authorizePermissions("read"), adminController.getAllUsers);
router.post("/users", authenticateToken, authorizePermissions("create"), adminController.createUser);
router.put("/users/:id", authenticateToken, authorizePermissions("update"), adminController.updateUser);
router.delete("/users/:id", authenticateToken, authorizePermissions("delete"), adminController.deleteUser);

// Books
router.get("/books", authenticateToken, authorizePermissions("read"), adminController.getAllBooks);
router.post("/books", authenticateToken, authorizePermissions("create"), adminController.createBook);
router.put("/books/:id", authenticateToken, authorizePermissions("update"), adminController.updateBook);
router.delete("/books/:id", authenticateToken, authorizePermissions("delete"), adminController.deleteBook);

// Genres
router.get("/genres", authenticateToken, authorizePermissions("read"), adminController.getAllGenres);
router.post("/genres", authenticateToken, authorizePermissions("create"), adminController.createGenre);
router.put("/genres/:id", authenticateToken, authorizePermissions("update"), adminController.updateGenre);
router.delete("/genres/:id", authenticateToken, authorizePermissions("delete"), adminController.deleteGenre);

// Reviews
router.get("/reviews", authenticateToken, authorizePermissions("read"), adminController.getAllReviews);
router.delete("/reviews/:id", authenticateToken, authorizePermissions("delete"), adminController.deleteReview);

module.exports = router;
