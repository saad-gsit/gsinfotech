const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/contactController');
const { validationSchemas } = require('../middleware/validation');
const securityMiddleware = require('../middleware/security');

// Public routes
router.post('/',
    securityMiddleware.rateLimit.contact,
    validationSchemas.contact,
    ContactController.submitContactForm
);

router.post('/newsletter',
    securityMiddleware.rateLimit.contact,
    ContactController.subscribeNewsletter
);

// Admin routes
router.get('/',
    validationSchemas.queryParams,
    ContactController.getAllSubmissions
);

router.get('/stats',
    ContactController.getContactStats
);

router.get('/newsletter',
    ContactController.getNewsletterSubscribers
);

router.get('/:id',
    validationSchemas.idParam,
    ContactController.getSubmissionById
);

router.put('/:id/status',
    validationSchemas.idParam,
    ContactController.updateSubmissionStatus
);

router.delete('/:id',
    validationSchemas.idParam,
    ContactController.deleteSubmission
);

module.exports = router;