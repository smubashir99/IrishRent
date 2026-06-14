const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
// Load environment variables from .env file
dotenv.config();
// Note: We use dotenv to manage environment variables, allowing us to easily configure our application for different environments 
// (development, production, etc.) without hardcoding sensitive information in our codebase. Make sure to create a .env file in 
// the root of your project with the necessary variables (e.g., PORT, MONGO_URI, JWT_SECRET, CLIENT_URL).
const path = require('path');

// Initialize database
require('./config/db');

const app = express();

// ════════════════════════════════
// SECURITY MIDDLEWARE
// ════════════════════════════════

// Helmet — HTTP security headers
// Ref: https://helmetjs.github.io/
app.use(helmet());

// CORS configuration
// Ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Rate limiting — prevent brute force
// Ref: https://www.npmjs.com/package/express-rate-limit
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Too many requests — try again after 15 minutes'
    }
});
app.use('/api/', limiter);

// Stricter limit for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Too many login attempts — try again after 15 minutes'
    }
});
app.use('/api/auth/', authLimiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ════════════════════════════════
// ROUTES
// ════════════════════════════════
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/reviews',    require('./routes/reviewRoutes'));
app.use('/api/bookmarks',  require('./routes/bookmarkRoutes'));

// Health check
app.get('/api/ping', (req, res) => {
    res.json({
        success: true,
        message: 'IrishRent API running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// ════════════════════════════════
// ERROR HANDLING
// ════════════════════════════════
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`IrishRent server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;