// Authentication and authorization middleware for Express routes
const jwt = require('jsonwebtoken');
// Ref: https://www.npmjs.com/package/jsonwebtoken
const User = require('../models/User');

// JWT Authentication middleware
// Ref: https://jwt.io/introduction
// This middleware checks for a valid JWT token in the Authorization header of incoming requests.
const protect = async (req, res, next) => {
    let token;
// Check for Bearer token in Authorization header
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from header
            token = req.headers.authorization.split(' ')[1];
            // Verify token and decode payload
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Attach user information to request object, excluding password
            req.user = await User.findById(decoded.id).select('-password');
            // If user is not found, return 401 Unauthorized
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }
            // Proceed to the next middleware or route handler
            next();
            // Note: In a production application, you may want to implement token blacklisting or expiration handling for enhanced security.
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized — invalid token'
            });
        }
    }
    // If no token is provided, return 401 Unauthorized
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized — no token provided'
        });
    }
};

// Role-based authorization middleware
// Ref: OWASP Access Control Cheat Sheet
// This middleware checks if the authenticated user has one of the specified roles to access a route.
const authorize = (...roles) => {
    // The 'roles' parameter is an array of allowed roles (e.g., ['admin', 'user'])
    return (req, res, next) => {
        // Check if the user's role is included in the allowed roles
        if (!roles.includes(req.user.role)) {
            // If the user's role is not authorized, return 403 Forbidden
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

// Export the middleware functions for use in route definitions
module.exports = { protect, authorize };