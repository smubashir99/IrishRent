// routes/bookmarkRoutes.js
const express = require('express');
const router = express.Router();

// Bookmark routes — to be implemented
router.get('/test', (req, res) => {
    // This is just a test route to verify that the bookmark routes are working
    res.json({ success: true, message: 'Bookmark route working' });
});

// 
module.exports = router;