const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/projectController');
const { validationSchemas } = require('../middleware/validation');
const { optimizeProjectImages } = require('../middleware/imageOptimizer');
const { cacheMiddleware, cacheInvalidationMiddleware } = require('../middleware/cache');

// Public routes
router.get('/',
    validationSchemas.queryParams,
    cacheMiddleware.projects,
    ProjectController.getAllProjects
);

router.get('/stats',
    cacheMiddleware.long,
    ProjectController.getProjectStats
);

router.get('/:id',
    validationSchemas.idParam,
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
    validationSchemas.idParam,
    optimizeProjectImages,
    validationSchemas.project,
    cacheInvalidationMiddleware(['projects']),
    ProjectController.updateProject
);

router.delete('/:id',
    validationSchemas.idParam,
    cacheInvalidationMiddleware(['projects']),
    ProjectController.deleteProject
);

module.exports = router;