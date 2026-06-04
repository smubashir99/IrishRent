// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validateMiddleware');

// Generate JWT Token
// Ref: https://jwt.io/introduction
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Validation rules
// Ref: https://express-validator.github.io/docs/
// These validation rules ensure that the input data is clean and meets our requirements, preventing common attacks like XSS and ensuring data integrity.
const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters')
        .escape(), // XSS prevention
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/\d/).withMessage('Password must contain a number'),
    body('role')
        .optional()
        .isIn(['tenant', 'landlord']).withMessage('Role must be tenant or landlord'),
];
// Login validation is simpler since we just need to check for the presence of email and password, but we still validate the email format.
const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
];

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
// The registration process includes validation, password hashing, and token generation. We also check for existing users to prevent duplicate accounts. The use of parameterized queries ensures that we are protected against SQL injection attacks.
const register = [
    ...registerValidation,
    validate,
    async (req, res) => {
        try {
            const { name, email, password, role = 'tenant', phone } = req.body;

            // Check if user exists
            const existingUser = db.prepare(
                'SELECT id FROM users WHERE email = ?'
            ).get(email);
            // If a user with the same email already exists, we return a 400 Bad Request response to inform the client that the email is already in use. This prevents duplicate accounts and ensures that each email is unique in our system.
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists with this email'
                });
            }

            // Hash password — bcrypt prevents brute force
            // Ref: https://auth0.com/blog/hashing-in-action-understanding-bcrypt/
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Insert user — parameterized query prevents SQL injection
            // Ref: OWASP SQL Injection Prevention Cheat Sheet
            const result = db.prepare(`
                INSERT INTO users (name, email, password, role, phone)
                VALUES (?, ?, ?, ?, ?)
            `).run(name, email, hashedPassword, role, phone || null);

            const token = generateToken(result.lastInsertRowid, role);
            // Return user data without password
            res.status(201).json({
                success: true,
                message: 'Registration successful',
                token,
                user: {
                    id: result.lastInsertRowid,
                    name,
                    email,
                    role
                }
            });
            // Note: In a production environment, you would also want to implement email verification and possibly CAPTCHA to prevent bot registrations.
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during registration'
            });
        }
    }
];

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// The login process includes validation, user lookup, password comparison, and token generation. We also implement rate limiting on the auth routes to prevent brute force attacks.
const login = [
    ...loginValidation,
    validate,
    // The login function is responsible for authenticating the user. It first validates the input, then checks if a user with the provided email exists. If the user exists, it compares the provided password with the hashed password stored in the database using bcrypt. If the passwords match, it generates a JWT token and returns it along with the user information (excluding the password). If any step fails, it returns an appropriate error message.
    async (req, res) => {
        try {
            const { email, password } = req.body;

            // Get user — parameterized query
            const user = db.prepare(
                'SELECT * FROM users WHERE email = ?'
            ).get(email);
            // If no user is found with the provided email, we return a 401 Unauthorized response to indicate that the login attempt was unsuccessful due to invalid credentials. This helps prevent unauthorized access and informs the client that the email or password is incorrect.
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Compare password
            const isMatch = await bcrypt.compare(password, user.password);
            // If the provided password does not match the hashed password stored in the database, we return a 401 Unauthorized response to indicate that the login attempt was unsuccessful due to invalid credentials. This helps prevent unauthorized access and informs the client that the email or password is incorrect.
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }
           // Generate token
            const token = generateToken(user.id, user.role);
           // Return user data without password
            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone
                }
            });
     // Note: In a production environment, you would also want to implement account lockout after multiple failed login attempts and consider using refresh tokens for better security.
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during login'
            });
        }
    }
];

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
// This route retrieves the current user's information based on the JWT token provided in the request. The auth middleware will have already verified the token and attached the user information to the request object.
const getMe = async (req, res) => {
    // The getMe function retrieves the current user's information based on the JWT token provided in the request. The auth middleware will have already verified the token and attached the user information to the request object. We then query the database for the user's details (excluding the password) and return it in the response. If any error occurs during this process, we return a 500 Internal Server Error response.
    try {
        const user = db.prepare(
            'SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?'
        ).get(req.user.id);

        res.json({
            success: true,
            user
        });
        // Note: In a production environment, you would also want to implement token refresh and possibly include additional user information or permissions in the response.
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
// This route allows the user to update their profile information. We validate the input and then update the database accordingly. The use of parameterized queries ensures that we are protected against SQL injection attacks.
const updateProfile = [
    body('name').optional().trim().isLength({ min: 2, max: 50 }).escape(),
    body('phone').optional().trim().escape(),
    validate,
    async (req, res) => {
        try {
            const { name, phone } = req.body;

            db.prepare(`
                UPDATE users SET name = ?, phone = ? WHERE id = ?
            `).run(
                name || req.user.name,
                phone || req.user.phone,
                req.user.id
            );
            // Return updated user data without password
            const updated = db.prepare(
                'SELECT id, name, email, role, phone FROM users WHERE id = ?'
            ).get(req.user.id);

            res.json({
                success: true,
                message: 'Profile updated',
                user: updated
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
];

// Future features to implement:
// - Password reset via email
// - Email verification during registration
// - Account lockout after multiple failed login attempts
module.exports = { register, login, getMe, updateProfile };