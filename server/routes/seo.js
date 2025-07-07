const express = require('express');
const router = express.Router();
const SEOController = require('../controllers/seoController');
const { validationSchemas } = require('../middleware/validation');
const { cacheMiddleware } = require('../middleware/cache');

// Public routes
router.get('/sitemap',
    cacheMiddleware.long,
    SEOController.generateSitemapData
);

// Admin routes
router.get('/',
    SEOController.getAllSEOData
);

router.get('/analytics',
    SEOController.getSEOAnalytics
);

router.get('/:page',
    cacheMiddleware.long,
    SEOController.getPageSEO
);

router.post('/suggestions',
    SEOController.generateSEOSuggestions
);

router.put('/:page',
    validationSchemas.seoMetadata,
    SEOController.updatePageSEO
);

router.delete('/:page',
    SEOController.deleteSEO
);

module.exports = router;