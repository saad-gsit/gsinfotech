// server/routes/services.js - Updated without pricing validation
const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const validation = require('../middleware/validation');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/services/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'service-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
        }
    }
});

// Validation middleware - Updated without pricing fields
const validateService = [
    body('name')
        .trim()
        .isLength({ min: 3, max: 255 })
        .withMessage('Service name must be between 3 and 255 characters'),

    body('short_description')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Short description must be between 10 and 500 characters'),

    body('description')
        .trim()
        .isLength({ min: 50 })
        .withMessage('Description must be at least 50 characters'),

    body('category')
        .isIn(['web_development', 'mobile_development', 'custom_software', 'ui_ux_design', 'enterprise_solutions'])
        .withMessage('Invalid service category'),

    body('features')
        .optional()
        .isArray({ min: 0 })
        .withMessage('Features must be an array'),

    body('technologies')
        .optional()
        .isArray({ min: 0 })
        .withMessage('Technologies must be an array'),

    body('estimated_timeline')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Timeline must be less than 100 characters'),

    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active must be a boolean'),

    body('show_in_homepage')
        .optional()
        .isBoolean()
        .withMessage('show_in_homepage must be a boolean'),

    body('display_order')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Display order must be a positive integer'),

    body('process_steps')
        .optional()
        .isArray({ min: 0 })
        .withMessage('Process steps must be an array'),

    body('seo_title')
        .optional()
        .trim()
        .isLength({ max: 60 })
        .withMessage('SEO title must be less than 60 characters'),

    body('seo_description')
        .optional()
        .trim()
        .isLength({ max: 160 })
        .withMessage('SEO description must be less than 160 characters'),

    body('seo_keywords')
        .optional()
        .isArray({ min: 0 })
        .withMessage('SEO keywords must be an array'),

    validation.handleValidationErrors
];

const validateServiceUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 255 })
        .withMessage('Service name must be between 3 and 255 characters'),

    body('short_description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Short description must be between 10 and 500 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ min: 50 })
        .withMessage('Description must be at least 50 characters'),

    body('category')
        .optional()
        .isIn(['web_development', 'mobile_development', 'custom_software', 'ui_ux_design', 'enterprise_solutions'])
        .withMessage('Invalid service category'),

    body('estimated_timeline')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Timeline must be less than 100 characters'),

    body('features')
        .optional()
        .isArray({ min: 0 })
        .withMessage('Features must be an array'),

    body('technologies')
        .optional()
        .isArray({ min: 0 })
        .withMessage('Technologies must be an array'),

    body('process_steps')
        .optional()
        .isArray({ min: 0 })
        .withMessage('Process steps must be an array'),

    validation.handleValidationErrors
];

const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    validation.handleValidationErrors
];

const validateServiceId = [
    param('id')
        .custom((value) => {
            // Allow both numeric IDs and string slugs
            return !isNaN(value) || typeof value === 'string';
        })
        .withMessage('Invalid service ID or slug'),

    validation.handleValidationErrors
];

// Public Routes

// GET /api/services - Get all services with filtering and pagination
router.get('/',
    validatePagination,
    serviceController.getAllServices
);

// GET /api/services/stats - Get service statistics (for dashboard)
router.get('/stats', serviceController.getServiceStats);

// GET /api/services/category/:category - Get services by category
router.get('/category/:category',
    [
        param('category')
            .isIn(['web_development', 'mobile_development', 'custom_software', 'ui_ux_design', 'enterprise_solutions'])
            .withMessage('Invalid service category'),
        validation.handleValidationErrors
    ],
    serviceController.getServicesByCategory
);

// GET /api/services/test-db - Test database connection
router.get('/test-db', serviceController.testDatabaseConnection);

// GET /api/services/:id - Get single service by ID or slug
router.get('/:id',
    validateServiceId,
    serviceController.getServiceById
);

// Admin Routes (Authentication required)
// Using your existing auth system: authenticateAdmin, authorizeRole, authorizePermission

// POST /api/services - Create new service
router.post('/',
    auth.authenticateAdmin, // Use your existing auth method
    auth.authorizePermission('services', 'write'), // Use your existing permission method
    upload.single('featured_image'),
    validateService,
    serviceController.createService
);

// PUT /api/services/:id - Update service
router.put('/:id',
    auth.authenticateAdmin,
    auth.authorizePermission('services', 'write'),
    upload.single('featured_image'),
    validateServiceId,
    validateServiceUpdate,
    serviceController.updateService
);

// DELETE /api/services/:id - Delete service
router.delete('/:id',
    auth.authenticateAdmin,
    auth.authorizePermission('services', 'delete'),
    validateServiceId,
    serviceController.deleteService
);

// PATCH /api/services/bulk - Bulk update services
router.patch('/bulk',
    auth.authenticateAdmin,
    auth.authorizePermission('services', 'write'),
    [
        body('updates')
            .isArray({ min: 1 })
            .withMessage('Updates array is required and must contain at least one item'),
        body('updates.*.id')
            .isInt({ min: 1 })
            .withMessage('Each update must have a valid service ID'),
        validation.handleValidationErrors
    ],
    serviceController.bulkUpdateServices
);

// DELETE /api/services/bulk - Bulk delete services
router.delete('/bulk',
    auth.authenticateAdmin,
    auth.authorizePermission('services', 'delete'),
    [
        body('ids')
            .isArray({ min: 1 })
            .withMessage('Service IDs array is required and must contain at least one ID'),
        body('ids.*')
            .isInt({ min: 1 })
            .withMessage('All service IDs must be valid integers'),
        validation.handleValidationErrors
    ],
    serviceController.bulkDeleteServices
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB.'
            });
        }
    }

    if (error.message.includes('Only image files are allowed')) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    next(error);
});

module.exports = router;