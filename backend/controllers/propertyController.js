// controllers/propertyController.js
const { body } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validateMiddleware');

// Validation rules
// The propertyValidation array defines the validation rules for creating and updating properties. It checks that the title, 
// description, type, price, bedrooms, bathrooms, area, and address fields are provided and meet certain criteria 
// (e.g., title max length, price must be positive). This helps ensure that the data being submitted to the server is valid 
// and prevents invalid data from being stored in the database.
const propertyValidation = [
    body('title').trim().notEmpty().withMessage('Title is required')
        .isLength({ max: 100 }).withMessage('Title max 100 characters').escape(),
    body('description').trim().notEmpty().withMessage('Description is required')
        .isLength({ max: 1000 }).escape(),
    body('type').isIn(['apartment', 'house', 'studio', 'room', 'shared'])
        .withMessage('Invalid property type'),
    body('price').isFloat({ min: 1 }).withMessage('Price must be positive number'),
    body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be 0 or more'),
    body('bathrooms').isInt({ min: 1 }).withMessage('Bathrooms must be 1 or more'),
    body('area').trim().notEmpty().withMessage('Area is required').escape(),
    body('address').trim().notEmpty().withMessage('Address is required').escape(),
];

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
// The getProperties function retrieves a list of properties from the database based on various query parameters for filtering, 
// searching, and pagination. It constructs a SQL query dynamically based on the provided filters (area, type, price range, 
// bedrooms, availability, search term) and executes it to fetch the matching properties. It also calculates the average rating 
// and review count for each property using subqueries. Finally, it returns the results in a paginated format along with metadata 
// about the total count and number of pages.
const getProperties = (req, res) => {
    try {
        const {
            area, type, minPrice, maxPrice,
            bedrooms, available, search,
            page = 1, limit = 10
        } = req.query;
// The query is built dynamically based on the provided filters. We start with a base query that selects properties and joins 
// with the users table to get landlord information. We then append conditions to the query for each filter that is provided in 
// the request. This allows us to retrieve only the properties that match the specified criteria. Finally, we add pagination 
// parameters to limit the number of results returned and calculate the total count for pagination metadata.
        let query = `
            SELECT p.*, u.name as landlord_name, u.phone as landlord_phone,
            (SELECT AVG(rating) FROM reviews WHERE property_id = p.id) as avg_rating,
            (SELECT COUNT(*) FROM reviews WHERE property_id = p.id) as review_count
            FROM properties p
            JOIN users u ON p.landlord_id = u.id
            WHERE 1=1
        `;
        const params = [];

        // Filters — parameterized to prevent SQL injection
        if (area) {
            query += ' AND LOWER(p.area) LIKE LOWER(?)';
            params.push(`%${area}%`);
        }
        // Note: The type filter checks if the provided type is one of the allowed property types (apartment, house, studio, room, shared).
        if (type) {
            query += ' AND p.type = ?';
            params.push(type);
        }
        // The price filters (minPrice and maxPrice) allow users to specify a price range for the properties they are interested in. If minPrice is provided, we add a condition to the query to only include properties with a price greater than or equal to minPrice. If maxPrice is provided, we add a condition to only include properties with a price less than or equal to maxPrice. This helps users find properties that fit their budget.
        if (minPrice) {
            query += ' AND p.price >= ?';
            params.push(parseFloat(minPrice));
        }
        // The bedrooms filter allows users to specify the number of bedrooms they want in a property. If the bedrooms parameter is provided, we add a condition to the query to only include properties that have the specified number of bedrooms. This helps users find properties that meet their space requirements.
        if (maxPrice) {
            query += ' AND p.price <= ?';
            params.push(parseFloat(maxPrice));
        }
        if (bedrooms) {
            query += ' AND p.bedrooms = ?';
            params.push(parseInt(bedrooms));
        }
        // The available filter allows users to specify whether they want to see properties that are currently available for rent. If the available parameter is provided, we add a condition to the query to only include properties that match the specified availability status. This helps users find properties that meet their availability requirements.
        if (available !== undefined) {
            query += ' AND p.available = ?';
            params.push(available === 'true' ? 1 : 0);
        }
        // The search filter allows users to search for properties based on keywords in the title, description, or area. 
        // If the search parameter is provided, we add a condition to the query to include properties where the title, description, or area contains the search term (case-insensitive). This helps users find properties that match their specific interests or criteria.
        if (search) {
            query += ' AND (LOWER(p.title) LIKE LOWER(?) OR LOWER(p.description) LIKE LOWER(?) OR LOWER(p.area) LIKE LOWER(?))';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);
        // Execute query
        const properties = db.prepare(query).all(...params);

        // Total count
        let countQuery = 'SELECT COUNT(*) as total FROM properties p WHERE 1=1';
        const countParams = params.slice(0, -2);
        const total = db.prepare(countQuery).get(...countParams);
        // The total count query is executed separately to get the total number of properties that match the filters 
        // (without pagination). This allows us to calculate the total number of pages and provide accurate pagination metadata 
        // in the response. We slice the params array to exclude the pagination parameters (limit and offset) when executing 
        // the count query, as they are not needed for counting the total results.
        res.json({
            success: true,
            count: properties.length,
            total: total?.total || 0,
            page: parseInt(page),
            pages: Math.ceil((total?.total || 0) / parseInt(limit)),
            properties
        });
    } catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
const getProperty = (req, res) => {
    // The getProperty function retrieves the details of a single property based on the provided property ID in the request 
    // parameters. It performs a database query to fetch the property information along with the landlord's name, phone, and email. If the property is found, it also retrieves all reviews associated with that property, including the reviewer's name. Finally, it returns the property details along with its reviews in the response. If the property is not found, it returns a 404 Not Found response, and if any server error occurs during this process, it returns a 500 Internal Server Error response.
    try {
        const property = db.prepare(`
            SELECT p.*, u.name as landlord_name, u.phone as landlord_phone, u.email as landlord_email
            FROM properties p
            JOIN users u ON p.landlord_id = u.id
            WHERE p.id = ?
        `).get(req.params.id);
// If no property is found with the provided ID, we return a 404 Not Found response to indicate that the requested resource 
// does not exist. This helps inform the client that the property they are trying to access cannot be found in the database.
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Get reviews
        const reviews = db.prepare(`
            SELECT r.*, u.name as reviewer_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.property_id = ?
            ORDER BY r.created_at DESC
        `).all(req.params.id);

        res.json({
            success: true,
            property: { ...property, reviews }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create property
// @route   POST /api/properties
// @access  Private (landlord only)
// The createProperty function allows landlords to create a new property listing. It first validates the input data using the 
// defined validation rules. If the validation passes, it inserts the new property into the database with the provided details 
// and associates it with the landlord's user ID (retrieved from the authenticated request). After successfully creating the 
// property, it retrieves the newly created property from the database and returns it in the response. If any error occurs during 
// this process, it returns a 500 Internal Server Error response.
const createProperty = [
    ...propertyValidation,
    validate,
    (req, res) => {
        try {
            const {
                title, description, type, price,
                bedrooms, bathrooms, area, address,
                images, amenities
            } = req.body;

            const result = db.prepare(`
                INSERT INTO properties
                (title, description, type, price, bedrooms, bathrooms,
                area, address, images, amenities, landlord_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                title, description, type,
                parseFloat(price), parseInt(bedrooms),
                parseInt(bathrooms), area, address,
                JSON.stringify(images || []),
                JSON.stringify(amenities || []),
                req.user.id
            );

            const property = db.prepare(
                'SELECT * FROM properties WHERE id = ?'
            ).get(result.lastInsertRowid);

            res.status(201).json({
                success: true,
                message: 'Property listed successfully',
                property
            });
        } catch (error) {
            console.error('Create property error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
];

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (landlord — own property)
const updateProperty = [
    ...propertyValidation,
    validate,
    (req, res) => {
        try {
            const property = db.prepare(
                'SELECT * FROM properties WHERE id = ?'
            ).get(req.params.id);

            if (!property) {
                return res.status(404).json({
                    success: false,
                    message: 'Property not found'
                });
            }

            // Authorization check
            if (property.landlord_id !== req.user.id &&
                req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to update this property'
                });
            }

            const {
                title, description, type, price,
                bedrooms, bathrooms, area, address,
                available, images, amenities
            } = req.body;

            db.prepare(`
                UPDATE properties SET
                title=?, description=?, type=?, price=?,
                bedrooms=?, bathrooms=?, area=?, address=?,
                available=?, images=?, amenities=?
                WHERE id=?
            `).run(
                title, description, type,
                parseFloat(price), parseInt(bedrooms),
                parseInt(bathrooms), area, address,
                available !== undefined ? (available ? 1 : 0) : property.available,
                JSON.stringify(images || []),
                JSON.stringify(amenities || []),
                req.params.id
            );

            const updated = db.prepare(
                'SELECT * FROM properties WHERE id = ?'
            ).get(req.params.id);

            res.json({
                success: true,
                message: 'Property updated',
                property: updated
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
];

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (landlord — own property)
const deleteProperty = (req, res) => {
    try {
        const property = db.prepare(
            'SELECT * FROM properties WHERE id = ?'
        ).get(req.params.id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        if (property.landlord_id !== req.user.id &&
            req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this property'
            });
        }

        // Delete related data first
        db.prepare('DELETE FROM reviews WHERE property_id = ?').run(req.params.id);
        db.prepare('DELETE FROM bookmarks WHERE property_id = ?').run(req.params.id);
        db.prepare('DELETE FROM properties WHERE id = ?').run(req.params.id);
// After successfully deleting the property and its related data (reviews and bookmarks), we return a success response indicating that the property has been deleted. If any error occurs during this process, we return a 500 Internal Server Error response.
        res.json({
            success: true,
            message: 'Property deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get landlord properties
// @route   GET /api/properties/my-listings
// @access  Private
// The getMyProperties function retrieves a list of properties that belong to the authenticated landlord. It performs a database 
// query to fetch all properties where the landlord_id matches the ID of the currently authenticated user. For each property, 
// it also calculates the average rating and review count using subqueries. Finally, it returns the list of properties along with 
// metadata about the count in the response. If any server error occurs during this process, it returns a 500 Internal Server Error response.
const getMyProperties = (req, res) => {
    try {
        const properties = db.prepare(`
            SELECT p.*,
            (SELECT AVG(rating) FROM reviews WHERE property_id = p.id) as avg_rating,
            (SELECT COUNT(*) FROM reviews WHERE property_id = p.id) as review_count
            FROM properties p
            WHERE p.landlord_id = ?
            ORDER BY p.created_at DESC
        `).all(req.user.id);

        res.json({
            success: true,
            count: properties.length,
            properties
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    getMyProperties
};