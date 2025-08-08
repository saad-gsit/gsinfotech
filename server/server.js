// Complete Enhanced server.js with Admin Authentication and Services integrated
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const db = require('./models');
const { logger } = require('./utils/logger');

// Import enhanced middleware
const securityMiddleware = require('./middleware/security');
const { createImageOptimizerMiddleware, getStorageStats, cleanupTempImages, compressImages, convertImageFormat } = require('./middleware/imageOptimizer');
const { createSEOMiddleware, autoGenerateBlogSEO } = require('./middleware/seoEnhancer');
const { cacheMiddleware, cacheInvalidationMiddleware } = require('./middleware/cache');
const { sanitizeRequest, validationSchemas } = require('./middleware/validation');
const { addPerformanceMonitoring, trackDatabaseOperation, performanceMonitor } = require('./middleware/performanceMonitor');

// Import auth middleware
const {
    authenticateAdmin,
    authorizeRole,
    authorizePermission,
    adminSecurityHeaders
} = require('./middleware/auth');

// Import routes
const projectRoutes = require('./routes/projects');
const blogRoutes = require('./routes/blog');
const contactRoutes = require('./routes/contact');
const seoRoutes = require('./routes/seo');
const analyticsRoutes = require('./routes/analytics');
const teamRoutes = require('./routes/team');
const authRoutes = require('./routes/auth'); // Auth routes
const servicesRoutes = require('./routes/services'); // Services routes - NEW

require('dotenv').config();

const app = express();

// Add error handlers at the top
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

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

// 3. UTILITY ENDPOINTS (Before rate limiting for admin access)
// Image utility endpoints
app.use(getStorageStats);
app.use(cleanupTempImages);
app.use(compressImages);
app.use(convertImageFormat);

// 4. RATE LIMITING (Apply different limits to different routes)
// General API rate limiting
app.use('/api/', securityMiddleware.rateLimit.general);

// Specific rate limits for sensitive endpoints
app.use('/api/contact', securityMiddleware.rateLimit.contact);
app.use('/api/auth', securityMiddleware.rateLimit.auth);
app.use('/api/admin', securityMiddleware.rateLimit.admin);

// 5. BODY PARSING AND COMPRESSION
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// 6. REQUEST SANITIZATION
app.use(sanitizeRequest);

// 7. LOGGING
app.use(morgan('combined'));

// 8. SEO ENHANCEMENT
app.use(createSEOMiddleware());

// 9. STATIC FILES with caching
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '1d',
    etag: true
}));

// Static files for generated sitemaps and robots.txt
app.use('/public', express.static(path.join(__dirname, 'public'), {
    maxAge: '1h',
    etag: true
}));

// 10. SEO FILES ROUTES (sitemap.xml, robots.txt)
// Serve sitemap.xml from root (standard SEO practice)
app.get('/sitemap.xml', (req, res) => {
    const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');

    if (fs.existsSync(sitemapPath)) {
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        res.sendFile(sitemapPath);
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.status(404).json({
            error: 'Sitemap not found',
            message: 'Sitemap has not been generated yet.',
            suggestion: 'Generate sitemap using: POST /api/seo/generate-sitemap?type=xml',
            autoGenerate: `${req.protocol}://${req.get('host')}/generate-sitemap`
        });
    }
});

// Serve robots.txt from root (standard SEO practice)
app.get('/robots.txt', (req, res) => {
    const robotsPath = path.join(__dirname, 'public', 'robots.txt');

    if (fs.existsSync(robotsPath)) {
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
        res.sendFile(robotsPath);
    } else {
        // Serve a default robots.txt if not generated
        const siteUrl = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;
        const defaultRobots = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /api/

# Allow important pages
Allow: /projects/
Allow: /blog/
Allow: /services/

# Crawl delay
Crawl-delay: 1`;

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(defaultRobots);
    }
});

// HTML sitemap for users
app.get('/sitemap.html', (req, res) => {
    const htmlSitemapPath = path.join(__dirname, 'public', 'sitemap.html');

    if (fs.existsSync(htmlSitemapPath)) {
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.sendFile(htmlSitemapPath);
    } else {
        res.status(404).json({
            error: 'HTML sitemap not found',
            message: 'HTML sitemap has not been generated yet.',
            suggestion: 'Generate HTML sitemap using: POST /api/seo/generate-sitemap?type=html'
        });
    }
});

// Convenience route to generate all sitemaps
app.get('/generate-sitemap', async (req, res) => {
    try {
        const sitemapGenerator = require('./utils/sitemapGenerator');
        const result = await sitemapGenerator.generateAll();

        const siteUrl = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;

        res.json({
            message: 'All sitemaps generated successfully! 🎉',
            result,
            generatedFiles: {
                xml: `${siteUrl}/sitemap.xml`,
                html: `${siteUrl}/sitemap.html`,
                robots: `${siteUrl}/robots.txt`
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Auto-generate sitemap failed:', error);
        res.status(500).json({
            error: 'Failed to generate sitemaps',
            message: error.message
        });
    }
});

// API redirects for backward compatibility
app.get('/api/sitemap.xml', (req, res) => res.redirect(301, '/sitemap.xml'));
app.get('/api/robots.txt', (req, res) => res.redirect(301, '/robots.txt'));

// 11. API ROUTES WITH CACHING AND VALIDATION

// Enhanced health check endpoint with performance data
app.get('/api/health', (req, res) => {
    try {
        const healthStatus = performanceMonitor.getHealthStatus();
        res.json({
            status: 'OK',
            message: 'GS Infotech Enhanced API Server Running',
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            performance: healthStatus
        });
    } catch (error) {
        res.json({
            status: 'OK',
            message: 'GS Infotech Enhanced API Server Running',
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            performance: { status: 'monitoring_unavailable' }
        });
    }
});

// Performance metrics endpoint
app.get('/api/performance', (req, res) => {
    try {
        const metrics = performanceMonitor.getMetrics();
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            detailedMetrics: metrics
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get performance metrics',
            message: error.message
        });
    }
});

// Performance report endpoint
app.get('/api/performance/report', async (req, res) => {
    try {
        const { hours = 24 } = req.query;
        const report = await performanceMonitor.generateReport(parseInt(hours));
        res.json(report);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to generate performance report',
            message: error.message
        });
    }
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
            'performance-report': '/api/performance/report?hours=24',
            'storage-stats': '/api/storage/stats',
            'image-cleanup': '/api/images/cleanup?hours=24',
            'image-compress': 'POST /api/images/compress',
            'image-convert': 'POST /api/images/convert',
            projects: '/api/projects',
            team: '/api/team',
            blog: '/api/blog',
            services: '/api/services', // NEW
            contact: '/api/contact',
            seo: '/api/seo',
            analytics: '/api/analytics',
            // Auth endpoints
            auth: {
                login: 'POST /api/auth/login',
                logout: 'POST /api/auth/logout',
                me: 'GET /api/auth/me',
                'verify-token': 'POST /api/auth/verify-token',
                'change-password': 'PUT /api/auth/change-password',
                profile: 'PUT /api/auth/profile'
            }
        },
        utilities: {
            sitemap: '/sitemap.xml',
            robots: '/robots.txt',
            htmlSitemap: '/sitemap.html',
            'generate-sitemap': '/generate-sitemap',
            'api-generate-sitemap': 'POST /api/seo/generate-sitemap?type=xml|html|robots|all'
        }
    });
});

// Database test endpoint with performance tracking
app.get('/api/db-test', async (req, res) => {
    const startTime = Date.now();

    try {
        const isConnected = await db.testConnection();

        if (isConnected) {
            const [dbResult] = await db.sequelize.query('SELECT DATABASE() as current_db');
            const [versionResult] = await db.sequelize.query('SELECT VERSION() as mysql_version');
            const [timeResult] = await db.sequelize.query('SELECT NOW() as server_time');

            // Track database operation
            trackDatabaseOperation('connection_test', startTime);

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
                performance: {
                    connectionTime: `${Date.now() - startTime}ms`
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
        trackDatabaseOperation('connection_error', startTime);

        res.status(500).json({
            status: 'error',
            message: 'Database connection failed ❌',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Database error',
            timestamp: new Date().toISOString()
        });
    }
});

// 12. AUTHENTICATION ROUTES
app.use('/api/auth', authRoutes);

// 13. PUBLIC API ROUTES
app.use('/api/projects', projectRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/services', servicesRoutes); // NEW SERVICES ROUTES

// 14. EXAMPLE API ROUTES WITH ENHANCED MIDDLEWARE

// Projects API with caching, validation, and image optimization
app.get('/api/projects',
    validationSchemas.queryParams,
    cacheMiddleware.projects,
    async (req, res) => {
        // Your projects logic here
        res.json({
            message: 'Projects endpoint with caching',
            query: req.query
        });
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
            images: req.processedImages,
            imageHelpers: {
                thumbnail: req.getThumbnailUrl('image'),
                mediumWebP: req.getImageUrl('image', 'medium', 'webp'),
                allSizes: req.getAllImageSizes('image'),
                metadata: req.getImageMetadata('image')
            }
        });
    }
);

// Blog API with SEO auto-generation
app.get('/api/blog',
    validationSchemas.queryParams,
    cacheMiddleware.blog,
    async (req, res) => {
        // Your blog posts logic here
        res.json({
            message: 'Blog posts with caching',
            query: req.query
        });
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
            },
            images: req.processedImages
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
            images: req.processedImages,
            thumbnail: req.getThumbnailUrl('photo')
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

// 15. PROTECTED ADMIN ROUTES
app.use('/api/admin', adminSecurityHeaders, authenticateAdmin);

// Admin stats endpoint (requires authentication)
app.get('/api/admin/stats',
    authorizeRole('super_admin', 'admin'),
    async (req, res) => {
        try {
            const performanceStats = performanceMonitor.getMetrics();
            const { imageProcessor } = require('./middleware/imageOptimizer');
            const storageStats = await imageProcessor.getStorageStats();

            res.json({
                message: 'Admin stats - Authentication verified',
                performance: performanceStats,
                storage: storageStats,
                admin: {
                    id: req.admin.id,
                    email: req.admin.email,
                    role: req.admin.role,
                    permissions: req.admin.permissions
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                error: 'Failed to get admin stats',
                message: error.message
            });
        }
    }
);

// Admin content management endpoints
app.get('/api/admin/content-stats',
    authorizePermission('analytics', 'read'),
    async (req, res) => {
        try {
            // Get content statistics including services
            const [projects, team, blog, contacts, services] = await Promise.all([
                db.Project ? db.Project.count() : 0,
                db.TeamMember ? db.TeamMember.count() : 0,
                db.BlogPost ? db.BlogPost.count() : 0,
                db.ContactSubmission ? db.ContactSubmission.count() : 0,
                db.Service ? db.Service.count() : 0 // NEW
            ]);

            res.json({
                success: true,
                data: {
                    projects,
                    team,
                    blog,
                    contacts,
                    services, // NEW
                    total: projects + team + blog + contacts + services
                },
                admin: {
                    id: req.admin.id,
                    role: req.admin.role
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get content stats',
                message: error.message
            });
        }
    }
);

// Admin system health endpoint
app.get('/api/admin/system-health',
    authorizeRole('super_admin', 'admin'),
    async (req, res) => {
        try {
            const healthStatus = performanceMonitor.getHealthStatus();
            const dbStatus = await db.testConnection();

            res.json({
                success: true,
                data: {
                    server: {
                        status: 'healthy',
                        uptime: process.uptime(),
                        memory: process.memoryUsage(),
                        environment: process.env.NODE_ENV
                    },
                    database: {
                        status: dbStatus ? 'healthy' : 'error',
                        connected: dbStatus
                    },
                    performance: healthStatus
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to get system health',
                message: error.message
            });
        }
    }
);

// 16. TEST ENDPOINTS for utilities
app.post('/api/test/image-upload',
    createImageOptimizerMiddleware('optimized', {
        generateResponsive: true,
        generateThumbnail: true,
        compress: true,
        targetSizeKB: 100
    }),
    (req, res) => {
        if (!req.processedImages) {
            return res.status(400).json({ error: 'No images processed' });
        }

        res.json({
            message: 'Images processed successfully',
            processed: req.processedImages,
            helpers: {
                thumbnail: req.getThumbnailUrl('image'),
                mediumWebP: req.getImageUrl('image', 'medium', 'webp'),
                largeJPEG: req.getImageUrl('image', 'large', 'jpeg'),
                allSizes: req.getAllImageSizes('image'),
                metadata: req.getImageMetadata('image')
            }
        });
    }
);

// Test SEO generator
app.post('/api/test/seo', async (req, res) => {
    try {
        const seoGenerator = require('./utils/seoGenerator');

        const testData = {
            title: req.body.title || 'Test Page Title',
            content: req.body.content || 'This is test content for SEO generation...',
            url: req.body.url || '/test-page'
        };

        const seoData = seoGenerator.generateCompleteSEO(testData);
        const validation = seoGenerator.validateSEO(seoData);

        res.json({
            testData,
            generatedSEO: seoData,
            validation,
            score: validation.score
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test email service status
app.get('/api/test/email-status', async (req, res) => {
    try {
        const emailService = require('./utils/emailService');
        const status = emailService.getStatus();

        res.json({
            emailService: status,
            message: status.configured ? 'Email service is configured and ready' : 'Email service not configured'
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test admin authentication (protected endpoint)
app.get('/api/test/admin-auth',
    authenticateAdmin,
    (req, res) => {
        res.json({
            message: 'Admin authentication test successful! 🎉',
            admin: {
                id: req.admin.id,
                email: req.admin.email,
                role: req.admin.role,
                permissions: req.admin.permissions
            },
            timestamp: new Date().toISOString()
        });
    }
);

// 17. ERROR HANDLING

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'API endpoint not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        suggestion: 'Check /api for available endpoints'
    });
});

// Global error handling middleware with performance tracking
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);

    // Track error in performance monitor
    try {
        performanceMonitor.recordError(err, req, {
            timestamp: Date.now(),
            userAgent: req.get('User-Agent'),
            referer: req.get('Referer')
        });
    } catch (monitorError) {
        console.error('Failed to record error in performance monitor:', monitorError);
    }

    // Log security-related errors
    if (err.message.includes('CORS') || err.message.includes('rate limit')) {
        logger.security('Security error', {
            error: err.message,
            ip: req.ip,
            path: req.path,
            userAgent: req.get('User-Agent')
        });
    }

    // Log authentication errors
    if (err.message.includes('jwt') || err.message.includes('token') || err.message.includes('auth')) {
        logger.security('Authentication error', {
            error: err.message,
            ip: req.ip,
            path: req.path,
            userAgent: req.get('User-Agent'),
            admin: req.admin ? req.admin.id : null
        });
    }

    res.status(err.status || 500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
    try {
        console.log('📝 Server.js file loaded completely');
        console.log('🔧 Setting up server...');

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

        console.log('⏳ Attempting to start server...');

        // Start the server
        app.listen(PORT, HOST, () => {
            console.log(`
🚀 GS Infotech Enhanced Server Started Successfully!
📍 Environment: ${process.env.NODE_ENV}
🌐 Server: http://${HOST}:${PORT}
📊 Health Check: http://${HOST}:${PORT}/api/health
📈 Performance: http://${HOST}:${PORT}/api/performance
📊 Storage Stats: http://${HOST}:${PORT}/api/storage/stats
🗺️  Sitemap XML: http://${HOST}:${PORT}/sitemap.xml
🗺️  Sitemap HTML: http://${HOST}:${PORT}/sitemap.html
🤖 Robots.txt: http://${HOST}:${PORT}/robots.txt
📖 API Info: http://${HOST}:${PORT}/api
🔧 DB Test: http://${HOST}:${PORT}/api/db-test
💾 Database: Connected to ${process.env.DB_NAME}
🛡️  Security: Enhanced middleware active
⚡ Performance: Enhanced monitoring enabled
🖼️  Images: Advanced processing enabled
🔍 SEO: Auto-generation active
🗄️  Cache: ${process.env.ENABLE_CACHE !== 'false' ? 'Enabled' : 'Disabled'}

🔐 Admin Authentication:
   • Login: POST http://${HOST}:${PORT}/api/auth/login
   • Logout: POST http://${HOST}:${PORT}/api/auth/logout
   • Profile: GET http://${HOST}:${PORT}/api/auth/me
   • Test Auth: GET http://${HOST}:${PORT}/api/test/admin-auth

🛡️  Protected Admin Routes:
   • Stats: GET http://${HOST}:${PORT}/api/admin/stats
   • Content Stats: GET http://${HOST}:${PORT}/api/admin/content-stats
   • System Health: GET http://${HOST}:${PORT}/api/admin/system-health

🔧 Services API:
   • All Services: GET http://${HOST}:${PORT}/api/services
   • Service Stats: GET http://${HOST}:${PORT}/api/services/stats
   • Featured Services: GET http://${HOST}:${PORT}/api/services/featured
   • Service by ID/Slug: GET http://${HOST}:${PORT}/api/services/:id
   • Services by Category: GET http://${HOST}:${PORT}/api/services/category/:category
   • Create Service: POST http://${HOST}:${PORT}/api/services (Admin)
   • Update Service: PUT http://${HOST}:${PORT}/api/services/:id (Admin)
   • Delete Service: DELETE http://${HOST}:${PORT}/api/services/:id (Admin)

⏰ Started at: ${new Date().toISOString()}

🧪 Test Endpoints:
   • POST /api/test/image-upload - Test image processing
   • POST /api/test/seo - Test SEO generation
   • GET /api/test/email-status - Check email service
   • GET /api/test/admin-auth - Test admin authentication
   • GET /generate-sitemap - Generate all sitemaps
   • POST /api/seo/generate-sitemap?type=all - Generate sitemaps via API
   • GET /api/images/cleanup?hours=1 - Cleanup temp files

🔗 Quick Links:
   • All Endpoints: http://${HOST}:${PORT}/api
   • Generate Sitemap: http://${HOST}:${PORT}/generate-sitemap
   • Performance Dashboard: http://${HOST}:${PORT}/api/performance
   • Admin Login: http://${HOST}:${PORT}/admin/login (Frontend)
   • Services Page: http://${HOST}:${PORT}/services (Frontend)
            `);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();

module.exports = app;