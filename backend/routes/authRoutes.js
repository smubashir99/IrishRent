const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// Protected routes
// GET /api/auth/me
router.get('/me', protect, getMe);

// PUT /api/auth/profile
router.put('/profile', protect, updateProfile);

// Future routes to implement:
// - POST /api/auth/logout
// - POST /api/auth/refresh-token
module.exports = router;