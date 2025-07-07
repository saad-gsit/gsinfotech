// Enhanced server.js with all middleware integrated
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./models');

// Import enhanced middleware
const securityMiddleware = require('./middleware/security');
const { createImageOptimizerMiddleware } = require('./middleware/imageOptimizer');
const { createSEOMiddleware, autoGenerateBlogSEO } = require('./middleware/seoEnhancer');
const { cacheMiddleware, cacheInvalidationMiddleware } = require('./middleware/cache');
const { addPerformanceMonitoring } = require('./middleware/performanceMonitor');
const { sanitizeRequest, validationSchemas } = require('./middleware/validation');

// Import routes
const projectRoutes = require('./routes/projects');
const blogRoutes = require('./routes/blog');
const contactRoutes = require('./routes/contact');
const seoRoutes = require('./routes/seo');
const analyticsRoutes = require('./routes/analytics');

require('dotenv').config();

const app = express();

// Trust proxy (for production)
app.set('trust proxy', 1);

// 1. SECURITY MIDDLEWARE (First priority)
// Enhanced Helmet security headers
app.use(securityMiddleware.helmet);

// Enhanced CORS with logging
app.use(securityMiddleware.cors);

// Request sanitization and security validation
app.use(securityMiddleware.sanitizeRequest);

// Additional security headers
app.use(securityMiddleware.securityHeaders);

// NoSQL injection and XSS protection
app.use(securityMiddleware.mongoSanitize);
app.use(securityMiddleware.hpp);

// Speed limiting for performance
app.use(securityMiddleware.speedLimit);

// 2. PERFORMANCE MONITORING (Early to track everything)
addPerformanceMonitoring(app);

// 3. RATE LIMITING (Apply different limits to different routes)
// General API rate limiting
app.use('/api/', securityMiddleware.rateLimit.general);

// Use routes
app.use('/api/projects', projectRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/analytics', analyticsRoutes);

// Specific rate limits for sensitive endpoints
app.use('/api/contact', securityMiddleware.rateLimit.contact);
app.use('/api/auth', securityMiddleware.rateLimit.auth);
app.use('/api/admin', securityMiddleware.rateLimit.admin);

// 4. BODY PARSING AND COMPRESSION
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// 5. REQUEST SANITIZATION
app.use(sanitizeRequest);

// 6. LOGGING
app.use(morgan('combined'));

// 7. SEO ENHANCEMENT
app.use(createSEOMiddleware());

// 8. STATIC FILES with caching
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '1d',
    etag: true
}));

// 9. API ROUTES WITH CACHING AND VALIDATION

// Health check endpoint (no caching)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'GS Infotech Enhanced API Server Running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'GS Infotech Enhanced API',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: {
            health: '/api/health',
            performance: '/api/performance',
            projects: '/api/projects',
            team: '/api/team',
            blog: '/api/blog',
            services: '/api/services',
            contact: '/api/contact'
        }
    });
});

// Database test endpoint
app.get('/api/db-test', async (req, res) => {
    try {
        const isConnected = await db.testConnection();

        if (isConnected) {
            const [dbResult] = await db.sequelize.query('SELECT DATABASE() as current_db');
            const [versionResult] = await db.sequelize.query('SELECT VERSION() as mysql_version');
            const [timeResult] = await db.sequelize.query('SELECT NOW() as server_time');

            res.json({
                status: 'success',
                message: 'Database connection successful! ✅',
                database: {
                    name: dbResult[0].current_db,
                    mysql_version: versionResult[0].mysql_version,
                    server_time: timeResult[0].server_time
                },
                sequelize: {
                    dialect: db.sequelize.getDialect(),
                    version: db.Sequelize.version
                },
                environment: process.env.NODE_ENV,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Database connection failed ❌'
            });
        }
    } catch (error) {
        console.error('Database test error:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed ❌',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Database error',
            timestamp: new Date().toISOString()
        });
    }
});

// EXAMPLE API ROUTES WITH ENHANCED MIDDLEWARE

// Projects API with caching, validation, and image optimization
app.get('/api/projects',
    validationSchemas.queryParams,
    cacheMiddleware.projects,
    async (req, res) => {
        // Your projects logic here
        res.json({ message: 'Projects endpoint with caching' });
    }
);

app.post('/api/projects',
    createImageOptimizerMiddleware('projects'),
    validationSchemas.project,
    cacheInvalidationMiddleware(['projects']),
    async (req, res) => {
        // Your project creation logic here
        // req.processedImages will contain optimized images
        res.json({
            message: 'Project created with optimized images',
            images: req.processedImages
        });
    }
);

// Blog API with SEO auto-generation
app.get('/api/blog',
    validationSchemas.queryParams,
    cacheMiddleware.blog,
    async (req, res) => {
        // Your blog posts logic here
        res.json({ message: 'Blog posts with caching' });
    }
);

app.post('/api/blog',
    createImageOptimizerMiddleware('blog'),
    autoGenerateBlogSEO,
    validationSchemas.blogPost,
    cacheInvalidationMiddleware(['blog']),
    async (req, res) => {
        // Your blog creation logic here
        // req.body will have auto-generated SEO fields
        res.json({
            message: 'Blog post created with SEO optimization',
            seo: {
                slug: req.body.slug,
                metaDescription: req.body.metaDescription,
                readingTime: req.body.readingTime
            }
        });
    }
);

// Team API with image optimization
app.get('/api/team',
    cacheMiddleware.team,
    async (req, res) => {
        res.json({ message: 'Team members with caching' });
    }
);

app.post('/api/team',
    createImageOptimizerMiddleware('team'),
    validationSchemas.teamMember,
    cacheInvalidationMiddleware(['team']),
    async (req, res) => {
        res.json({
            message: 'Team member added with optimized images',
            images: req.processedImages
        });
    }
);

// Contact API with enhanced validation and rate limiting
app.post('/api/contact',
    validationSchemas.contact,
    async (req, res) => {
        // Your contact form logic here
        res.json({ message: 'Contact form submitted successfully' });
    }
);

// Services API with caching
app.get('/api/services',
    cacheMiddleware.long, // Services change infrequently
    async (req, res) => {
        res.json({ message: 'Services with long-term caching' });
    }
);

// Admin routes with API key validation
app.use('/api/admin', securityMiddleware.validateApiKey);

app.get('/api/admin/stats', (req, res) => {
    res.json({ message: 'Admin stats - API key validated' });
});

// 10. ERROR HANDLING

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'API endpoint not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        suggestion: 'Check /api for available endpoints'
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);

    // Log security-related errors
    if (err.message.includes('CORS') || err.message.includes('rate limit')) {
        require('./utils/logger').logger.security('Security error', {
            error: err.message,
            ip: req.ip,
            path: req.path,
            userAgent: req.get('User-Agent')
        });
    }

    res.status(err.status || 500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

const startServer = async () => {
    try {
        // Test database connection on startup
        console.log('🔌 Testing database connection...');
        const isConnected = await db.testConnection();

        if (!isConnected) {
            console.error('❌ Database connection failed. Please check your MySQL server and credentials.');
            console.log('💡 Make sure:');
            console.log('   - MySQL server is running');
            console.log('   - Database "gsinfotech_db" exists');
            console.log('   - Credentials in .env are correct');
            process.exit(1);
        }

        // Start the server
        app.listen(PORT, HOST, () => {
            console.log(`
🚀 GS Infotech Enhanced Server Started!
📍 Environment: ${process.env.NODE_ENV}
🌐 Server: http://${HOST}:${PORT}
📊 Health Check: http://${HOST}:${PORT}/api/health
📈 Performance: http://${HOST}:${PORT}/api/performance
📖 API Info: http://${HOST}:${PORT}/api
🔧 DB Test: http://${HOST}:${PORT}/api/db-test
💾 Database: Connected to ${process.env.DB_NAME}
🛡️  Security: Enhanced middleware active
⚡ Performance: Monitoring enabled
🗄️  Cache: ${process.env.ENABLE_CACHE !== 'false' ? 'Enabled' : 'Disabled'}
⏰ Started at: ${new Date().toISOString()}
            `);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();

module.exports = app;