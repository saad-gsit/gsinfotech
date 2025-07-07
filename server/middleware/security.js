// server/middleware/security.js
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');
const { logger } = require('../utils/logger');

// Enhanced CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            process.env.CORS_ORIGIN,
            process.env.SITE_URL
        ].filter(Boolean);

        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            logger.security(`CORS: Blocked request from origin: ${origin}`, { ip: null });
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-API-Key'
    ],
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
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
    // General API endpoints
    general: createRateLimit(
        15 * 60 * 1000, // 15 minutes
        parseInt(process.env.RATE_LIMIT_MAX) || 100,
        'Too many requests from this IP, please try again later.'
    ),

    // Contact form submissions
    contact: createRateLimit(
        60 * 60 * 1000, // 1 hour
        5,
        'Too many contact form submissions. Please try again later.',
        true // don't count successful requests
    ),

    // Authentication endpoints
    auth: createRateLimit(
        15 * 60 * 1000, // 15 minutes
        5,
        'Too many authentication attempts. Please try again later.'
    ),

    // Admin endpoints
    admin: createRateLimit(
        15 * 60 * 1000, // 15 minutes
        50,
        'Too many admin requests. Please try again later.'
    ),

    // File upload endpoints
    upload: createRateLimit(
        60 * 60 * 1000, // 1 hour
        20,
        'Too many file upload attempts. Please try again later.'
    )
};

// Slow down configuration for repeated requests
const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // Allow 50 requests per windowMs without delay
    delayMs: (used, req) => {
        return (used - 50) * 100; // Add 100ms delay per request after 50 requests
    },
    maxDelayMs: 5000, // Maximum delay of 5 seconds
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

// Enhanced Helmet configuration
const helmetConfig = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
                "https://cdnjs.cloudflare.com"
            ],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://cdnjs.cloudflare.com",
                "https://www.googletagmanager.com",
                "https://www.google-analytics.com"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com",
                "https://cdnjs.cloudflare.com"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "https:",
                "blob:"
            ],
            connectSrc: [
                "'self'",
                "https://api.emailjs.com",
                "https://www.google-analytics.com"
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
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    noSniff: true,
    frameguard: { action: 'deny' },
    xssFilter: true
};

// Security middleware collection
const securityMiddleware = {
    // Enhanced helmet with CSP
    helmet: helmet(helmetConfig),

    // CORS with enhanced options
    cors: cors(corsOptions),

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
        whitelist: ['sort', 'fields', 'page', 'limit', 'category', 'tags']
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

        // HSTS for production
        if (process.env.NODE_ENV === 'production') {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
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

        // Log suspicious requests
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
                                userAgent: req.get('User-Agent')
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

    // API key validation for admin routes
    validateApiKey: (req, res, next) => {
        // Skip API key validation for public routes
        if (!req.path.includes('/admin') && !req.path.includes('/api/admin')) {
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
                code: 'INVALID_API_KEY'
            });
        }

        next();
    },

    // Request logging for security monitoring
    requestLogger: (req, res, next) => {
        const startTime = Date.now();

        res.on('finish', () => {
            const duration = Date.now() - startTime;
            logger.request(req, res, duration);
        });

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

module.exports = securityMiddleware;