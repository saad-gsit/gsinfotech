// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const { AdminUser } = require('../models');
const { logger } = require('../utils/logger');

// Main authentication middleware
const authenticateAdmin = async (req, res, next) => {
    try {
        let token;

        // Get token from header or cookie
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.adminToken) {
            token = req.cookies.adminToken;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Get admin user
        const admin = await AdminUser.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
        });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Admin not found.'
            });
        }

        if (!admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Account is deactivated.'
            });
        }

        // Add admin to request
        req.admin = admin;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Token expired.'
            });
        }

        logger.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Role-based authorization middleware
const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Authentication required.'
            });
        }

        if (!roles.includes(req.admin.role)) {
            logger.security('Unauthorized role access attempt', {
                adminId: req.admin.id,
                email: req.admin.email,
                role: req.admin.role,
                requiredRoles: roles,
                path: req.path
            });

            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

// Permission-based authorization middleware
const authorizePermission = (resource, action = 'read') => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Authentication required.'
            });
        }

        const permissions = req.admin.permissions || {};
        const resourcePermissions = permissions[resource];

        if (!resourcePermissions || !resourcePermissions[action]) {
            logger.security('Unauthorized permission access attempt', {
                adminId: req.admin.id,
                email: req.admin.email,
                role: req.admin.role,
                resource,
                action,
                path: req.path
            });

            return res.status(403).json({
                success: false,
                message: `Access denied. No ${action} permission for ${resource}.`
            });
        }

        next();
    };
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.adminToken) {
            token = req.cookies.adminToken;
        }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const admin = await AdminUser.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            if (admin && admin.isActive) {
                req.admin = admin;
            }
        }

        next();
    } catch (error) {
        // Continue without admin if token is invalid
        next();
    }
};

// Rate limiting for login attempts
const loginRateLimit = (req, res, next) => {
    // This will be handled by the existing rate limiting middleware
    // but we can add additional login-specific logic here
    next();
};

// Validation middleware for auth routes
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required',
            errors: {
                email: !email ? 'Email is required' : null,
                password: !password ? 'Password is required' : null
            }
        });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address'
        });
    }

    next();
};

const validatePasswordChange = (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Current password and new password are required'
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'New password must be at least 6 characters long'
        });
    }

    if (currentPassword === newPassword) {
        return res.status(400).json({
            success: false,
            message: 'New password must be different from current password'
        });
    }

    next();
};

// Security headers for admin routes
const adminSecurityHeaders = (req, res, next) => {
    res.setHeader('X-Admin-Route', 'true');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
};

module.exports = {
    authenticateAdmin,
    authorizeRole,
    authorizePermission,
    optionalAuth,
    loginRateLimit,
    validateLogin,
    validatePasswordChange,
    adminSecurityHeaders
};