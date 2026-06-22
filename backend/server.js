const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Initialize database
const db = require('./config/db');

// AUTO-SEED ON FIRST START
// Render resets SQLite on redeploy — auto seed fixes this
//const checkUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
//if (checkUsers.count === 0) {
  //  console.log('No data found — running auto seed...');
   // require('./seed-data');
//}
// END AUTO-SEED

const checkUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
//const checkOldImages = db.prepare("SELECT COUNT(*) as count FROM properties WHERE images LIKE '%unsplash%'").get();
// If no users or old placeholder images, seed with updated images
const checkOldImages = db.prepare("SELECT COUNT(*) as count FROM properties WHERE images LIKE '%unsplash%' OR images LIKE '%pexels%' OR images LIKE '%placehold%'").get();
if (checkUsers.count === 0 || checkOldImages.count > 0) {
    console.log('Seeding/Re-seeding database with updated images...');
    require('./seed-data');
}
const app = express();


// SECURITY MIDDLEWARE
//app.use(helmet());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "https:", "data:"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

// CORS configuration
app.use(cors({
    // Allow requests from frontend URL (set in .env or default to localhost:3000)
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// RATE LIMITING — prevent brute-force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests — try again after 15 minutes' }
});
// Apply rate limiting to all requests
app.use('/api/', limiter);

// RATE LIMITING — stricter for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many login attempts — try again after 15 minutes' }
});
// Apply stricter rate limiting to auth routes
app.use('/api/auth/', authLimiter);

// BODY PARSING
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));


// ROUTES

app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/reviews',    require('./routes/reviewRoutes'));
app.use('/api/bookmarks',  require('./routes/bookmarkRoutes'));

// HEALTH CHECK
app.get('/api/ping', (req, res) => {
    res.json({
        success: true,
        message: 'IrishRent API running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// API 404 — only for unmatched /api routes
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found'
    });
});


// SERVE REACT FRONTEND (PRODUCTION)

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));

    // Serve index.html for any route that doesn't match /api
    app.get(/^(?!\/api).*/, (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
    });
}


// ERROR HANDLING — must be LAST

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`IrishRent server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Export app for testing or further use
module.exports = app;