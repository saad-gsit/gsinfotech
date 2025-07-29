// server/routes/projects.js
const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/projectController');
const { validationSchemas, handleValidationErrors } = require('../middleware/validation');
const { optimizeProjectImages } = require('../middleware/imageOptimizer');
const { cacheMiddleware, cacheInvalidationMiddleware } = require('../middleware/cache');
const { param, query } = require('express-validator');

// Custom validation for ID or slug parameter
const idOrSlugParam = [
    param('id').custom((value) => {
        // Allow either numeric ID or slug format
        const isNumeric = /^\d+$/.test(value);
        const isValidSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

        if (!isNumeric && !isValidSlug) {
            throw new Error('Invalid project identifier. Must be a numeric ID or valid slug.');
        }
        return true;
    }),
    handleValidationErrors
];

// Project query validation
const projectQueryValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
    query('status').optional().isIn(['all', 'published', 'draft', 'archived']).withMessage('Invalid status'),
    query('category').optional(),
    query('technology').optional(),
    query('featured').optional().isIn(['true', 'false']),
    query('sort').optional().isIn(['created_at', 'updated_at', 'title', 'view_count']),
    query('order').optional().isIn(['ASC', 'DESC', 'asc', 'desc']),
    query('search').optional().isString().trim(),
    handleValidationErrors
];

// Public routes
router.get('/',
    projectQueryValidation,
    cacheMiddleware.projects,
    ProjectController.getAllProjects
);

router.get('/stats',
    cacheMiddleware.long,
    ProjectController.getProjectStats
);

// Use custom validation for ID/slug parameter
router.get('/:id',
    idOrSlugParam,  // Changed from validationSchemas.idParam
    cacheMiddleware.projects,
    ProjectController.getProjectById
);

// Admin routes
router.post('/',
    optimizeProjectImages,
    validationSchemas.project,
    cacheInvalidationMiddleware(['projects']),
    ProjectController.createProject
);

router.put('/:id',
    validationSchemas.idParam,  // Keep numeric validation for updates
    optimizeProjectImages,
    validationSchemas.project,
    cacheInvalidationMiddleware(['projects']),
    ProjectController.updateProject
);

router.delete('/:id',
    validationSchemas.idParam,  // Keep numeric validation for deletes
    cacheInvalidationMiddleware(['projects']),
    ProjectController.deleteProject
);

module.exports = router;