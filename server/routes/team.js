// server/routes/team.js - Simplified version
const express = require('express');
const router = express.Router();
const TeamController = require('../controllers/teamController');

// Import middleware with fallbacks
let validationSchemas, optimizeTeamImages, cacheMiddleware, cacheInvalidationMiddleware;

try {
    ({ validationSchemas } = require('../middleware/validation'));
} catch (error) {
    validationSchemas = {};
}

try {
    ({ optimizeTeamImages } = require('../middleware/imageOptimizer'));
} catch (error) {
    optimizeTeamImages = (req, res, next) => next();
}

try {
    ({ cacheMiddleware, cacheInvalidationMiddleware } = require('../middleware/cache'));
} catch (error) {
    cacheMiddleware = { team: (req, res, next) => next() };
    cacheInvalidationMiddleware = () => (req, res, next) => next();
}

// Public routes
router.get('/',
    cacheMiddleware.team || ((req, res, next) => next()),
    TeamController.getAllTeamMembers
);

router.get('/stats',
    cacheMiddleware.long || cacheMiddleware.team || ((req, res, next) => next()),
    TeamController.getTeamStats
);

router.get('/:id',
    cacheMiddleware.team || ((req, res, next) => next()),
    TeamController.getTeamMemberById
);

// Admin routes (you can add authentication middleware later)
router.post('/',
    optimizeTeamImages,
    validationSchemas.teamMember || ((req, res, next) => next()),
    cacheInvalidationMiddleware(['team']),
    TeamController.createTeamMember
);

router.put('/:id',
    optimizeTeamImages,
    validationSchemas.teamMember || ((req, res, next) => next()),
    cacheInvalidationMiddleware(['team']),
    TeamController.updateTeamMember
);

router.delete('/:id',
    cacheInvalidationMiddleware(['team']),
    TeamController.deleteTeamMember
);

module.exports = router;