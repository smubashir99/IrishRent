// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();

// Review routes — to be implemented
router.get('/test', (req, res) => {
    // This is just a test route to verify that the review routes are working
    res.json({ success: true, message: 'Review route working' });
});

module.exports = router;