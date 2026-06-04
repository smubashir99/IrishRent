// backend/controllers/reviewController.js
const { body } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validateMiddleware');
// Validation rules for adding a review
const reviewValidation = [
    body('rating').isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('comment').trim().notEmpty()
        .withMessage('Comment is required')
        .isLength({ max: 500 }).withMessage('Comment max 500 characters')
        .escape(),
];

// @desc    Get reviews for property
// @route   GET /api/reviews/:propertyId
// @access  Public
// The getReviews function retrieves all reviews for a specific property based on the property ID provided in the request 
// parameters. It performs a database query to fetch the reviews along with the reviewer's name by joining the reviews and 
// users tables. The reviews are ordered by creation date in descending order. Additionally, it calculates the average rating 
// for the property using an aggregate query. Finally, it returns a JSON response containing the success status, count of reviews, 
// average rating, and the list of reviews. If any server error occurs during this process, it returns a 500 Internal Server Error
//  response.
const getReviews = (req, res) => {
    try {
        const reviews = db.prepare(`
            SELECT r.*, u.name as reviewer_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.property_id = ?
            ORDER BY r.created_at DESC
        `).all(req.params.propertyId);
  // The average rating is calculated using a separate query that computes the average of the rating column for all reviews
        const avg = db.prepare(
            'SELECT AVG(rating) as avg_rating FROM reviews WHERE property_id = ?'
        ).get(req.params.propertyId);

        res.json({
            success: true,
            count: reviews.length,
            avg_rating: avg?.avg_rating?.toFixed(1) || 0,
            reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Add review
// @route   POST /api/reviews/:propertyId
// @access  Private (tenant only)
// The addReview function allows authenticated tenants to add a review for a specific property. It first validates the input data
const addReview = [
    ...reviewValidation,
    validate,
    // The function then checks if the property exists and if the user has already reviewed it. If the property is found and the 
    // user has not reviewed it yet, it inserts the new review into the database and retrieves the newly created review along 
    // with the reviewer's name to return in the response. If any of these checks fail or if any server error occurs during this
    //  process, it returns an appropriate error response.
    (req, res) => {
        try {
            const { rating, comment } = req.body;
            const propertyId = req.params.propertyId;

            // Check property exists
            const property = db.prepare(
                'SELECT id FROM properties WHERE id = ?'
            ).get(propertyId);

            if (!property) {
                return res.status(404).json({
                    success: false,
                    message: 'Property not found'
                });
            }

            // Check already reviewed
            const existing = db.prepare(
                'SELECT id FROM reviews WHERE property_id = ? AND user_id = ?'
            ).get(propertyId, req.user.id);

            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already reviewed this property'
                });
            }

            const result = db.prepare(`
                INSERT INTO reviews (rating, comment, property_id, user_id)
                VALUES (?, ?, ?, ?)
            `).run(parseInt(rating), comment, propertyId, req.user.id);

            const review = db.prepare(`
                SELECT r.*, u.name as reviewer_name
                FROM reviews r JOIN users u ON r.user_id = u.id
                WHERE r.id = ?
            `).get(result.lastInsertRowid);

            res.status(201).json({
                success: true,
                message: 'Review added',
                review
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
];

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
// The deleteReview function allows authenticated users (tenants or admins) to delete a review based on the review ID.
const deleteReview = (req, res) => {
    try {
        const review = db.prepare(
            'SELECT * FROM reviews WHERE id = ?'
        ).get(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        // The function checks if the authenticated user is either the author of the review or has an admin role. If the user is not

        if (review.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this review'
            });
        }
        // If the user is authorized, it deletes the review from the database and returns a success response. 
        // If any server error occurs

        db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
        // After successfully deleting the review from the database, we return a JSON response indicating that the review has been 
        // deleted. If any server error occurs during this process, we return a 500 Internal Server Error response.

        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
// The getReviews, addReview, and deleteReview functions are exported as part of the module so that they can be used in the review 
// routes to handle the respective API endpoints for managing reviews in the application.
module.exports = { getReviews, addReview, deleteReview };