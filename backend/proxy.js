// proxy.js (Backend file)
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/api/external/proxy-book', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).send('No URL provided.');
  }

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer', // Use arraybuffer for binary content (PDF, text, etc.)
    });

    res.set('Content-Type', 'application/octet-stream');  // Adjust if needed for the file type (e.g., 'text/plain' for text files)
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching book content:', error);
    res.status(500).send('Failed to fetch book content.');
  }
});

module.exports = router;  // Export the router
