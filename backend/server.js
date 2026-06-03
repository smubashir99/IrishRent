// server.js — main entry point for the Express server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();
// Create Express app
const app = express();

// SECURITY MIDDLEWARE


// Helmet — sets secure HTTP headers
// Ref: https://helmetjs.github.io/
app.use(helmet());

// CORS — cross origin resource sharing
// Ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
app.use(cors({
    // Allow requests from the frontend application URL specified in environment variables, with a fallback to localhost for development
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Rate limiting — prevents brute force attacks
// Ref: https://www.npmjs.com/package/express-rate-limit
// Ref: OWASP Blocking Brute Force Attacks
// This middleware limits the number of requests from a single IP address to 100 requests per 15 minutes for all API routes, and applies a stricter limit of 10 requests per 15 minutes for authentication routes to mitigate brute force login attempts.
const limiter = rateLimit({
    // General limit for all API routes
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Too many requests — please try again after 15 minutes'
    }
});
//
app.use('/api/', limiter);

// Stricter limit for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Too many login attempts — please try again after 15 minutes'
    }
});
app.use('/api/auth/', authLimiter);

// Body parser — limit payload size
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// API ROUTES

app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/reviews',    require('./routes/reviewRoutes'));
app.use('/api/bookmarks',  require('./routes/bookmarkRoutes'));

// Health check route
app.get('/api/ping', (req, res) => {
    res.json({
        success: true,
        message: 'IrishRent API running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});


// ERROR HANDLING
// Global error handler — catches unhandled errors and returns a standardized JSON response
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// 404 handler — catches undefined routes and returns a standardized JSON response
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start the server on the specified port, with a default of 5000 if not defined in environment variables
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`IrishRent server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Export the Express app for testing purposes
module.exports = app;