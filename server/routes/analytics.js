const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');

// Admin routes
router.get('/dashboard',
    AnalyticsController.getDashboardOverview
);

router.get('/content',
    AnalyticsController.getContentAnalytics
);

router.get('/performance',
    AnalyticsController.getPerformanceAnalytics
);

router.get('/contacts',
    AnalyticsController.getContactAnalytics
);

router.get('/events',
    AnalyticsController.getCustomEvents
);

router.post('/events',
    AnalyticsController.recordEvent
);

module.exports = router;