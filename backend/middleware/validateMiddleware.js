//
const { validationResult } = require('express-validator');

// Input validation middleware — prevents XSS and injection
// Ref: https://express-validator.github.io/docs/
// Ref: OWASP Input Validation Cheat Sheet
// This middleware checks the results of validation checks defined in route handlers and returns a standardized error response if validation fails.
const validate = (req, res, next) => {
    const errors = validationResult(req);
    // If validation errors exist, return 400 Bad Request with details about the failed validations
    if (!errors.isEmpty()) {
        // Map validation errors to a more user-friendly format
        return res.status(400).json({
            // Standardized error response structure
            success: false,
            message: 'Validation failed',
            // Include an array of validation errors with field names and messages
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    // If validation passed, proceed to the next middleware or route handler
    next();
};
// Note: In a production application, you may want to implement additional security measures such as sanitization of input data, rate limiting, and logging of validation failures for monitoring and alerting purposes.
module.exports = validate;