const db = require('../config/db');

// @desc    Get user bookmarks
// @route   GET /api/bookmarks
// @access  Private
// The getBookmarks function retrieves the list of properties that the authenticated user has bookmarked. 
// It performs a SQL query that joins the bookmarks table with the properties table to get the details of each bookmarked property,
//  and returns this information in the response.
const getBookmarks = (req, res) => {
    try {
        // The SQL query selects all bookmarks for the authenticated user and includes details about each bookmarked property 
        // such as title, type, price, area, bedrooms, bathrooms, availability, and images. The results are ordered by the 
        // creation date of the bookmark in descending order.
        const bookmarks = db.prepare(`
            SELECT b.*, p.title, p.type, p.price, p.area,
            p.bedrooms, p.bathrooms, p.available, p.images
            FROM bookmarks b
            JOIN properties p ON b.property_id = p.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `).all(req.user.id);

        res.json({
            success: true,
            count: bookmarks.length,
            bookmarks
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Add bookmark
// @route   POST /api/bookmarks/:propertyId
// @access  Private
// The addBookmark function allows authenticated users to bookmark a specific property by its ID. 
// It first checks if the property exists and if the user has already bookmarked it. If the property is valid and not already 
// bookmarked, it inserts a new record into the bookmarks table linking the user and the property. Finally, it returns a success
//  response. If any of these checks fail or if any server error occurs during this process, it returns an appropriate error 
// response.
const addBookmark = (req, res) => {
    try {
        const property = db.prepare(
            'SELECT id FROM properties WHERE id = ?'
        ).get(req.params.propertyId);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        const existing = db.prepare(
            'SELECT id FROM bookmarks WHERE user_id = ? AND property_id = ?'
        ).get(req.user.id, req.params.propertyId);
// The function checks if the authenticated user has already bookmarked the specified property. If a bookmark already exists for the
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Property already bookmarked'
            });
        }
// If the property is valid and not already bookmarked, it inserts a new record into the bookmarks table linking the user and the property. Finally, it returns a success
        db.prepare(
            'INSERT INTO bookmarks (user_id, property_id) VALUES (?, ?)'
        ).run(req.user.id, req.params.propertyId);
// After successfully adding the bookmark to the database, we return a JSON response indicating that the property has been bookmarked. If any server error occurs during this process, we return a 500 Internal Server Error response.
        res.status(201).json({
            success: true,
            message: 'Property bookmarked'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Remove bookmark
// @route   DELETE /api/bookmarks/:propertyId
// @access  Private
const removeBookmark = (req, res) => {
    try {
        const result = db.prepare(
            'DELETE FROM bookmarks WHERE user_id = ? AND property_id = ?'
        ).run(req.user.id, req.params.propertyId);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bookmark not found'
            });
        }

        res.json({ success: true, message: 'Bookmark removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
// The getBookmarks, addBookmark, and removeBookmark functions are exported as part of the module so that they can be used in the 
// bookmark routes to handle the respective API endpoints for managing bookmarks in the application.
module.exports = { getBookmarks, addBookmark, removeBookmark };