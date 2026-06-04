const express = require('express');
const router = express.Router();
// Import controller functions and middleware
const { getBookmarks, addBookmark, removeBookmark } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');
// Public route to get user bookmarks, and private routes for authenticated users to add or remove bookmarks for specific 
// properties. The protect middleware ensures that only authenticated users can access these routes, allowing them to manage 
// their bookmarks securely. Future routes to implement could include features like bulk bookmark management or sharing bookmarks 
// with other users.
router.get('/', protect, getBookmarks);
router.post('/:propertyId', protect, addBookmark);
router.delete('/:propertyId', protect, removeBookmark);

module.exports = router;