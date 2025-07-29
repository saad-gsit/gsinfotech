// server/routes/blog.js
const express = require('express');
const router = express.Router();
const BlogController = require('../controllers/blogController');
const { validationSchemas, handleValidationErrors } = require('../middleware/validation');
const { optimizeBlogImages } = require('../middleware/imageOptimizer');
const { autoGenerateBlogSEO } = require('../middleware/seoEnhancer');
const { cacheMiddleware, cacheInvalidationMiddleware } = require('../middleware/cache');
const { param, query } = require('express-validator');

// Custom validation for blog query parameters
const blogQueryValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
    query('status').optional().isIn(['all', 'published', 'draft', 'archived']).withMessage('Invalid status'),
    query('category').optional().isString().trim(),
    query('tag').optional().isString().trim(),
    query('author').optional().isString().trim(),
    query('featured').optional().isIn(['true', 'false']),
    query('sort').optional().isIn(['published_at', 'created_at', 'updated_at', 'title', 'view_count', 'latest']).withMessage('Invalid sort field'),
    query('order').optional().isIn(['ASC', 'DESC', 'asc', 'desc']).withMessage('Order must be ASC or DESC'),
    query('search').optional().isString().trim(),
    handleValidationErrors
];

// Custom validation for ID or slug parameter
const idOrSlugParam = [
    param('id').custom((value) => {
        const isNumeric = /^\d+$/.test(value);
        const isValidSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

        if (!isNumeric && !isValidSlug) {
            throw new Error('Invalid post identifier. Must be a numeric ID or valid slug.');
        }
        return true;
    }),
    handleValidationErrors
];

// Public routes
router.get('/',
    blogQueryValidation,  // Use blog-specific validation
    cacheMiddleware.blog,
    BlogController.getAllPosts
);

router.get('/stats',
    cacheMiddleware.long,
    BlogController.getBlogStats
);

// Categories endpoint (if needed)
router.get('/categories',
    cacheMiddleware.long,
    async (req, res) => {
        try {
            // You can implement a proper categories method or use this
            const { BlogPost } = require('../models');
            const categories = await BlogPost.findAll({
                attributes: [
                    ['category', 'name'],
                    [BlogPost.sequelize.fn('COUNT', '*'), 'count']
                ],
                where: { status: 'published' },
                group: ['category'],
                order: [[BlogPost.sequelize.literal('count'), 'DESC']]
            });

            res.json(categories.map(cat => ({
                id: cat.get('name'),
                name: cat.get('name'),
                slug: cat.get('name'),
                count: parseInt(cat.get('count'))
            })));
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch categories' });
        }
    }
);

router.get('/category/:category',
    param('category').isString().trim(),
    handleValidationErrors,
    cacheMiddleware.blog,
    BlogController.getPostsByCategory
);

router.get('/tag/:tag',
    param('tag').isString().trim(),
    handleValidationErrors,
    cacheMiddleware.blog,
    BlogController.getPostsByTag
);

// Add a separate route for slug access (for your getPostBySlug API method)
router.get('/slug/:slug',
    validationSchemas.slugParam,
    cacheMiddleware.blog,
    BlogController.getPostById
);

// ID or slug route (handles both)
router.get('/:id',
    idOrSlugParam,  // Use custom validation for ID/slug
    cacheMiddleware.blog,
    BlogController.getPostById
);

// Admin routes
router.post('/',
    optimizeBlogImages,
    autoGenerateBlogSEO,
    validationSchemas.blogPost,
    cacheInvalidationMiddleware(['blog']),
    BlogController.createPost
);

router.put('/:id',
    validationSchemas.idParam,
    optimizeBlogImages,
    autoGenerateBlogSEO,
    validationSchemas.blogPost,
    cacheInvalidationMiddleware(['blog']),
    BlogController.updatePost
);

router.delete('/:id',
    validationSchemas.idParam,
    cacheInvalidationMiddleware(['blog']),
    BlogController.deletePost
);

module.exports = router;