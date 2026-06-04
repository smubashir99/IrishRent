// backend/routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
// Import controller functions and middleware
const {
    getProperties, getProperty, createProperty,
    updateProperty, deleteProperty, getMyProperties
} = require('../controllers/propertyController');
// Import authentication and authorization middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
// The getProperties function retrieves a list of properties based on various filters and pagination parameters provided in the query string.
router.get('/', getProperties);
router.get('/my-listings', protect, getMyProperties);
router.get('/:id', getProperty);

// Private routes — landlord only
// The createProperty, updateProperty, and deleteProperty functions are protected routes that require the user to be authenticated and have the role of 'landlord' or 'admin'. These routes allow landlords to create new property listings, update existing listings, and delete listings they own. The protect middleware ensures that only authenticated users can access these routes, while the authorize middleware checks that the user has the appropriate role to perform these actions.
router.post('/', protect, authorize('landlord', 'admin'), createProperty);
router.put('/:id', protect, authorize('landlord', 'admin'), updateProperty);
router.delete('/:id', protect, deleteProperty);
// Future routes to implement:
// - GET /api/properties/featured — to get featured properties for the homepage
module.exports = router;