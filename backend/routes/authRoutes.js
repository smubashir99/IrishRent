// routes/authRoutes.js
const express = require('express');
const router = express.Router();

// Auth routes — to be implemented
router.get('/test', (req, res) => {
    // This is just a test route to verify that the auth routes are working
    res.json({ success: true, message: 'Auth route working' });
});

// Future routes to implement:
module.exports = router;