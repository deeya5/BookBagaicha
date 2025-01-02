const express = require('express');
const router = express.Router();

// Example API route
router.get('/books', (req, res) => {
  // You can replace this with actual data fetching logic
  res.json({ message: 'Fetching books...' });
});

module.exports = router;
