// server/middleware/security.js
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');
const { logger } = require('../utils/logger');

// Enhanced CORS configuration with frontend support
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',      // React dev server (alternative)
            'http://localhost:5173',     // Vite dev server (your frontend)
            'http://127.0.0.1:5173',     // IPv4 localhost
            'http://127.0.0.1:3000',     // IPv4 localhost alternative
            process.env.CORS_ORIGIN,     // Environment-specific origin
            process.env.SITE_URL,        // Production site URL
            process.env.CLIENT_URL       // Dedicated client URL
        ].filter(Boolean);

        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            // Log successful CORS requests in development
            if (process.env.NODE_ENV === 'development') {
                console.log(`🌐 CORS: Allowed request from origin: ${origin}`);
            }
            callback(null, true);
        } else {
            logger.security(`CORS: Blocked request from origin: ${origin}`, {
                ip: null,
                allowedOrigins,
                blockedOrigin: origin
            });
            console.warn(`🚫 CORS: Blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies and authorization headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-API-Key',
        'Cache-Control',
        'X-Total-Count',
        'X-Page-Count'
    ],
    exposedHeaders: [
        'X-Total-Count',
        'X-Page-Count',
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset'
    ],
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    preflightContinue: false,
    maxAge: 86400 // Cache preflight response for 24 hours
};

// CORS middleware with enhanced logging
const corsWithLogging = (req, res, next) => {
    const origin = req.get('Origin');

    // Add CORS headers for development debugging
    if (process.env.NODE_ENV === 'development') {
        console.log(`🔗 Request: ${req.method} ${req.path} from ${origin || 'same-origin'}`);
    }

    // Apply CORS
    cors(corsOptions)(req, res, (err) => {
        if (err) {
            console.error(`❌ CORS Error: ${err.message} for origin: ${origin}`);
            return res.status(403).json({
                error: 'CORS Error',
                message: 'Origin not allowed by CORS policy',
                allowedOrigins: process.env.NODE_ENV === 'development' ? [
                    'http://localhost:5173',
                    'http://localhost:3000'
                ] : ['Contact administrator']
            });
        }
        next();
    });
};

// Rate limiting configurations for different endpoints
const createRateLimit = (windowMs, max, message, skipSuccessfulRequests = false) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            error: message,
            resetTime: new Date(Date.now() + windowMs),
            retryAfter: Math.ceil(windowMs / 1000)
        },
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests,
        handler: (req, res) => {
            logger.security(`Rate limit exceeded`, {
                ip: req.ip,
                path: req.path,
                userAgent: req.get('User-Agent'),
                limit: max,
                window: windowMs
            });
            res.status(429).json({
                error: message,
                resetTime: new Date(Date.now() + windowMs),
                retryAfter: Math.ceil(windowMs / 1000)
            });
        },
        // Skip rate limiting for whitelisted IPs
        skip: (req) => {
            const whitelistedIPs = (process.env.RATE_LIMIT_WHITELIST || '').split(',');
            return whitelistedIPs.includes(req.ip);
        }
    });
};

// Different rate limits for different endpoints
const rateLimits = {
    // General API endpoints - more lenient for development
    general: createRateLimit(
        15 * 60 * 1000, // 15 minutes
        parseInt(process.env.RATE_LIMIT_MAX) || (process.env.NODE_ENV === 'development' ? 1000 : 100),
        'Too many requests from this IP, please try again later.'
    ),

    // Contact form submissions
    contact: createRateLimit(
        60 * 60 * 1000, // 1 hour
        process.env.NODE_ENV === 'development' ? 50 : 5,
        'Too many contact form submissions. Please try again later.',
        true // don't count successful requests
    ),

    // Authentication endpoints
    auth: createRateLimit(
        15 * 60 * 1000, // 15 minutes
        process.env.NODE_ENV === 'development' ? 50 : 5,
        'Too many authentication attempts. Please try again later.'
    ),

    // Admin endpoints
    admin: createRateLimit(
        15 * 60 * 1000, // 15 minutes
        process.env.NODE_ENV === 'development' ? 500 : 50,
        'Too many admin requests. Please try again later.'
    ),

    // File upload endpoints
    upload: createRateLimit(
        60 * 60 * 1000, // 1 hour
        process.env.NODE_ENV === 'development' ? 100 : 20,
        'Too many file upload attempts. Please try again later.'
    )
};

// Slow down configuration for repeated requests
const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: process.env.NODE_ENV === 'development' ? 500 : 50, // More lenient in development
    delayMs: (used, req) => {
        return (used - 50) * (process.env.NODE_ENV === 'development' ? 10 : 100); // Less delay in development
    },
    maxDelayMs: process.env.NODE_ENV === 'development' ? 1000 : 5000, // Max 1s delay in dev
    skipFailedRequests: true,
    skipSuccessfulRequests: false,
    headers: true,
    onLimitReached: (req, res, options) => {
        logger.security(`Speed limit reached`, {
            ip: req.ip,
            path: req.path,
            userAgent: req.get('User-Agent')
        });
    }
});

// Enhanced Helmet configuration with frontend support
const helmetConfig = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
                "https://cdnjs.cloudflare.com",
                "localhost:5173", // Allow Vite dev server styles
                "localhost:3000"  // Allow React dev server styles
            ],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'", // Required for Vite dev server
                "https://cdnjs.cloudflare.com",
                "https://www.googletagmanager.com",
                "https://www.google-analytics.com",
                "localhost:5173", // Allow Vite dev server scripts
                "localhost:3000"  // Allow React dev server scripts
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com",
                "https://cdnjs.cloudflare.com",
                "data:"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "https:",
                "blob:",
                "localhost:5173",
                "localhost:3000"
            ],
            connectSrc: [
                "'self'",
                "https://api.emailjs.com",
                "https://www.google-analytics.com",
                "localhost:5173",
                "localhost:3000",
                "localhost:5000", // Allow backend connections
                "ws://localhost:5173", // Vite HMR
                "ws://localhost:3000"  // React HMR
            ],
            mediaSrc: ["'self'", "data:", "blob:"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"],
            upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
        maxAge: process.env.NODE_ENV === 'production' ? 31536000 : 0, // Disable HSTS in development
        includeSubDomains: process.env.NODE_ENV === 'production',
        preload: process.env.NODE_ENV === 'production'
    },
    noSniff: true,
    frameguard: { action: 'deny' },
    xssFilter: true
};

// Security middleware collection
const securityMiddleware = {
    // Enhanced helmet with CSP
    helmet: helmet(helmetConfig),

    // CORS with enhanced options and logging
    cors: corsWithLogging,

    // Rate limiting
    rateLimit: rateLimits,

    // Speed limiting
    speedLimit: speedLimiter,

    // NoSQL injection prevention
    mongoSanitize: mongoSanitize({
        replaceWith: '_'
    }),

    // Parameter pollution prevention
    hpp: hpp({
        whitelist: ['sort', 'fields', 'page', 'limit', 'category', 'tags', 'search', 'filter']
    }),

    // Additional security headers
    securityHeaders: (req, res, next) => {
        // Remove server information
        res.removeHeader('X-Powered-By');

        // Additional security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        // HSTS for production only
        if (process.env.NODE_ENV === 'production') {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        // Development-friendly headers
        if (process.env.NODE_ENV === 'development') {
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        }

        next();
    },

    // Request sanitization and validation
    sanitizeRequest: (req, res, next) => {
        // XSS protection for request body and query parameters
        if (req.body && typeof req.body === 'object') {
            req.body = sanitizeObject(req.body);
        }

        if (req.query && typeof req.query === 'object') {
            req.query = sanitizeObject(req.query);
        }

        // Log suspicious requests (less aggressive in development)
        const suspiciousPatterns = [
            /(<script|javascript:|vbscript:|onload=|onerror=)/i,
            /(union.*select|drop.*table|insert.*into)/i,
            /(\.\.\/)|(\.\.\\)/,
            /(exec|eval|system|cmd)/i,
            /(base64|fromcharcode)/i
        ];

        const checkSuspicious = (obj, path = '') => {
            for (const [key, value] of Object.entries(obj)) {
                const currentPath = path ? `${path}.${key}` : key;

                if (typeof value === 'string') {
                    suspiciousPatterns.forEach(pattern => {
                        if (pattern.test(value)) {
                            logger.security(`Suspicious content detected`, {
                                ip: req.ip,
                                path: req.path,
                                field: currentPath,
                                value: value.substring(0, 100),
                                userAgent: req.get('User-Agent'),
                                severity: 'medium'
                            });
                        }
                    });
                } else if (typeof value === 'object' && value !== null) {
                    checkSuspicious(value, currentPath);
                }
            }
        };

        if (req.body) checkSuspicious(req.body, 'body');
        if (req.query) checkSuspicious(req.query, 'query');

        next();
    },

    // API key validation for admin routes (more flexible for development)
    validateApiKey: (req, res, next) => {
        // Skip API key validation for public routes
        if (!req.path.includes('/admin') && !req.path.includes('/api/admin')) {
            return next();
        }

        // Skip API key validation in development if not configured
        if (process.env.NODE_ENV === 'development' && !process.env.API_KEY) {
            console.log(`🔓 Development mode: Skipping API key validation for ${req.path}`);
            return next();
        }

        const apiKey = req.headers['x-api-key'];
        const validApiKey = process.env.API_KEY;

        if (!validApiKey) {
            // No API key configured, skip validation
            return next();
        }

        if (!apiKey || apiKey !== validApiKey) {
            logger.security(`Invalid or missing API key for admin route`, {
                ip: req.ip,
                path: req.path,
                hasApiKey: !!apiKey,
                userAgent: req.get('User-Agent')
            });

            return res.status(401).json({
                error: 'Invalid or missing API key',
                code: 'INVALID_API_KEY',
                hint: process.env.NODE_ENV === 'development' ? 'Set API_KEY in .env or add X-API-Key header' : undefined
            });
        }

        next();
    },

    // Request logging for security monitoring
    requestLogger: (req, res, next) => {
        const startTime = Date.now();

        res.on('finish', () => {
            const duration = Date.now() - startTime;

            // Only log in development for debugging
            if (process.env.NODE_ENV === 'development') {
                console.log(`📝 ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
            }

            logger.request(req, res, duration);
        });

        next();
    },

    // CORS options handler for preflight requests
    handleCorsOptions: (req, res, next) => {
        if (req.method === 'OPTIONS') {
            res.header('Access-Control-Allow-Origin', req.get('Origin'));
            res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,X-API-Key');
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Max-Age', '86400');
            return res.sendStatus(200);
        }
        next();
    }
};

// Helper function to sanitize objects recursively
function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return typeof obj === 'string' ? xss(obj) : obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
    }

    return sanitized;
}

// Export CORS options for reference
securityMiddleware.corsOptions = corsOptions;

module.exports = securityMiddleware;