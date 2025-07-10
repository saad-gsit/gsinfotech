// Updated server/routes/seo.js
const express = require('express');
const router = express.Router();
const SEOController = require('../controllers/seoController');
const { logger } = require('../utils/logger');

// Middleware to log SEO API requests
router.use((req, res, next) => {
    logger.api('SEO API request', {
        method: req.method,
        path: req.path,
        query: req.query,
        ip: req.ip
    });
    next();
});

// Get all SEO metadata with filtering and pagination
router.get('/', SEOController.getAllSEOData);

// Get SEO metadata for a specific page
router.get('/page/:page', SEOController.getPageSEO);

// Create or update SEO metadata for a page
router.put('/page/:page', SEOController.updatePageSEO);
router.post('/page/:page', SEOController.updatePageSEO); // Also allow POST

// Delete SEO metadata for a page
router.delete('/page/:page', SEOController.deleteSEO);

// Generate SEO suggestions for content
router.post('/suggestions', SEOController.generateSEOSuggestions);

// Get SEO analytics and insights
router.get('/analytics', SEOController.getSEOAnalytics);

// Generate sitemap (new utility method)
router.post('/generate-sitemap', SEOController.generateSitemap);

// Generate sitemap data (legacy method for compatibility)
router.get('/sitemap-data', SEOController.generateSitemapData);

// Error handling for SEO routes
router.use((error, req, res, next) => {
    logger.error('SEO route error:', {
        error: error.message,
        path: req.path,
        method: req.method,
        stack: error.stack
    });

    res.status(500).json({
        error: 'SEO operation failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;