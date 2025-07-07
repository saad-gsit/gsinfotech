const express = require('express');
const router = express.Router();
const BlogController = require('../controllers/blogController');
const { validationSchemas } = require('../middleware/validation');
const { optimizeBlogImages } = require('../middleware/imageOptimizer');
const { autoGenerateBlogSEO } = require('../middleware/seoEnhancer');
const { cacheMiddleware, cacheInvalidationMiddleware } = require('../middleware/cache');

// Public routes
router.get('/',
    validationSchemas.queryParams,
    cacheMiddleware.blog,
    BlogController.getAllPosts
);

router.get('/stats',
    cacheMiddleware.long,
    BlogController.getBlogStats
);

router.get('/category/:category',
    cacheMiddleware.blog,
    BlogController.getPostsByCategory
);

router.get('/tag/:tag',
    cacheMiddleware.blog,
    BlogController.getPostsByTag
);

router.get('/:id',
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