const express = require("express");
const multer = require("multer");
const router = express.Router();

// Configure Multer
const upload = multer({ dest: "uploads/" });

router.post("/upload-avatar", upload.single("avatar"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({ message: "Avatar uploaded", filePath: `/uploads/${req.file.filename}` });
});

module.exports = router;
