const express = require('express');
const router = express.Router();
// Import controller functions and middleware
const { getReviews, addReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
// Public route to get reviews for a specific property by its ID, and a private route for authenticated tenants to add a review 
// for a property.
router.get('/:propertyId', getReviews);
router.post('/:propertyId', protect, addReview);
router.delete('/:id', protect, deleteReview);
// Future routes to implement:
module.exports = router;