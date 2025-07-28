// server/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AdminUser } = require('../models');
const { logger } = require('../utils/logger');

class AuthController {
    // Admin Login
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            // Find admin user
            const admin = await AdminUser.findByEmail(email);

            if (!admin) {
                logger.security('Failed login attempt', { email, ip: req.ip, userAgent: req.get('User-Agent') });
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check if account is locked
            if (admin.isLocked()) {
                logger.security('Login attempt on locked account', { email, ip: req.ip });
                return res.status(423).json({
                    success: false,
                    message: 'Account is temporarily locked due to too many failed attempts'
                });
            }

            // Check if account is active
            if (!admin.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated'
                });
            }

            // Validate password
            const isValidPassword = await admin.validatePassword(password);

            if (!isValidPassword) {
                await admin.incrementLoginAttempts();
                logger.security('Failed login attempt', { email, ip: req.ip, userAgent: req.get('User-Agent') });

                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Reset login attempts on successful login
            await admin.resetLoginAttempts();

            // Generate JWT token
            const token = admin.generateToken();

            // Log successful login
            logger.info('Admin login successful', {
                adminId: admin.id,
                email: admin.email,
                ip: req.ip
            });

            // Set HTTP-only cookie
            res.cookie('adminToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    admin: admin.toJSON(),
                    token
                }
            });

        } catch (error) {
            logger.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Get current admin info
    static async me(req, res) {
        try {
            const admin = await AdminUser.findByPk(req.admin.id, {
                attributes: { exclude: ['password'] }
            });

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            res.json({
                success: true,
                data: { admin }
            });

        } catch (error) {
            logger.error('Get admin info error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Logout
    static async logout(req, res) {
        try {
            // Clear cookie
            res.clearCookie('adminToken');

            // Log logout
            logger.info('Admin logout', {
                adminId: req.admin?.id,
                email: req.admin?.email
            });

            res.json({
                success: true,
                message: 'Logout successful'
            });

        } catch (error) {
            logger.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Change password
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;

            // Validation
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

            // Get admin with password
            const admin = await AdminUser.findByPk(req.admin.id);

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            // Validate current password
            const isValidPassword = await admin.validatePassword(currentPassword);

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Update password
            await admin.update({ password: newPassword });

            // Log password change
            logger.info('Admin password changed', {
                adminId: admin.id,
                email: admin.email
            });

            res.json({
                success: true,
                message: 'Password changed successfully'
            });

        } catch (error) {
            logger.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Update profile
    static async updateProfile(req, res) {
        try {
            const { firstName, lastName } = req.body;
            const updates = {};

            if (firstName) updates.firstName = firstName;
            if (lastName) updates.lastName = lastName;

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No valid fields to update'
                });
            }

            const admin = await AdminUser.findByPk(req.admin.id);

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            await admin.update(updates);

            logger.info('Admin profile updated', {
                adminId: admin.id,
                email: admin.email,
                updates: Object.keys(updates)
            });

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: { admin: admin.toJSON() }
            });

        } catch (error) {
            logger.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Verify token (for frontend)
    static async verifyToken(req, res) {
        try {
            const token = req.body.token || req.cookies.adminToken;

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'No token provided'
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const admin = await AdminUser.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            if (!admin || !admin.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token or inactive account'
                });
            }

            res.json({
                success: true,
                message: 'Token is valid',
                data: { admin }
            });

        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    }
}

module.exports = AuthController;