// The authMiddleware.js file contains middleware functions for protecting routes and authorizing users based on their roles.
const jwt = require('jsonwebtoken');
const db = require('../config/db');
// The protect middleware function checks for a valid JWT token in the Authorization header of incoming requests. 
// If a token is present and valid, it decodes the token to retrieve the user ID, then queries the database to get the user's 
// information (id, name, email, role, phone) and attaches it to the req.user object for use in subsequent middleware or route 
// handlers. If the token is missing, invalid, or if the user cannot be found in the database, it returns a 401 Unauthorized 
// response with an appropriate error message.
const protect = async (req, res, next) => {
    let token;
    // The function first checks if the Authorization header is present and starts with 'Bearer'.
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
            // If the token is present, it extracts the token from the header and verifies it using the JWT secret. 
           
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from SQLite — no mongoose model needed
            const user = db.prepare(
                'SELECT id, name, email, role, phone FROM users WHERE id = ?'
            ).get(decoded.id);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }
            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized — invalid token'
            });
        }
    }
    // If the Authorization header is missing or does not start with 'Bearer', it returns a 401 Unauthorized response indicating
    //  that no token was provided.
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized — no token'
        });
    }
};
// The authorize middleware function takes a list of allowed roles as arguments and checks if the authenticated user's role 
// (available in req.user.role) is included in the allowed roles. If the user's role is not authorized, it returns a 403 
// Forbidden response with an appropriate error message. If the user is authorized, it calls next() to proceed to the next 
// middleware or route handler.
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' not authorized`
            });
        }
        next();
    };
};
// The protect and authorize functions are exported as part of the module so that they can be used in the route definitions to protect

module.exports = { protect, authorize };