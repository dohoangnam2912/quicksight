// routes/quickSightRoutes.js
const express = require('express');
const { generateEmbedUrl, rewriteQuery } = require('../controllers/quickSightController');
const router = express.Router();

// Route to generate the QuickSight Embed URL
router.get('/get-embed-url', generateEmbedUrl);

// Route to rewrite the query based on the context from MongoDB
router.post('/rewrite-query', rewriteQuery);

module.exports = router;