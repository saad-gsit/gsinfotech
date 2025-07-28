// server/routes/auth.js
const express = require('express');
const router = express.Router();

// Controllers and Middleware
const AuthController = require('../controllers/authController');
const {
    authenticateAdmin,
    validateLogin,
    validatePasswordChange,
    adminSecurityHeaders
} = require('../middleware/auth');

// Apply security headers to all admin auth routes
router.use(adminSecurityHeaders);

// Public routes (no authentication required)
router.post('/login', validateLogin, AuthController.login);
router.post('/verify-token', AuthController.verifyToken);

// Protected routes (authentication required)
router.use(authenticateAdmin); // All routes below require authentication

router.get('/me', AuthController.me);
router.post('/logout', AuthController.logout);
router.put('/change-password', validatePasswordChange, AuthController.changePassword);
router.put('/profile', AuthController.updateProfile);

// Admin health check (authenticated)
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Admin authentication is working',
        admin: {
            id: req.admin.id,
            email: req.admin.email,
            role: req.admin.role,
            lastLogin: req.admin.lastLogin
        },
        timestamp: new Date().toISOString()
    });
});

module.exports = router;