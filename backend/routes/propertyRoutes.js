// routes/propertyRoutes.js
const express = require('express');
const router = express.Router();

// Property routes — to be implemented
// This is just a test route to verify that the property routes are working
router.get('/test', (req, res) => {
    // This is just a test route to verify that the property routes are working
    res.json({ success: true, message: 'Property route working' });
});

//
module.exports = router;