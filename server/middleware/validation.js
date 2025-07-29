// server/middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');
const { logger } = require('../utils/logger');
const xss = require('xss');
const validator = require('validator');

// Validation configuration
const VALIDATION_CONFIG = {
    // String length limits
    limits: {
        title: { min: 2, max: 200 },
        description: { min: 10, max: 1000 },
        content: { min: 50, max: 50000 },
        name: { min: 2, max: 100 },
        email: { max: 254 },
        phone: { min: 10, max: 20 },
        url: { max: 2048 },
        slug: { min: 2, max: 100 },
        keywords: { max: 500 }
    },

    // File upload limits
    fileUpload: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
    },

    // Custom validation patterns
    patterns: {
        slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        phone: /^[\+]?[1-9][\d]{0,15}$/,
        username: /^[a-zA-Z0-9_-]{3,30}$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    }
};

class ValidationHelper {
    constructor() {
        this.config = VALIDATION_CONFIG;
    }

    // Sanitize string input
    sanitizeString(value) {
        if (typeof value !== 'string') return value;

        // Remove XSS attempts
        let sanitized = xss(value, {
            whiteList: {}, // No HTML tags allowed
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script', 'style']
        });

        // Trim whitespace
        sanitized = sanitized.trim();

        // Normalize whitespace
        sanitized = sanitized.replace(/\s+/g, ' ');

        return sanitized;
    }

    // Sanitize HTML content (for rich text)
    sanitizeHTML(value) {
        if (typeof value !== 'string') return value;

        return xss(value, {
            whiteList: {
                p: [],
                br: [],
                strong: [],
                b: [],
                em: [],
                i: [],
                u: [],
                h1: [], h2: [], h3: [], h4: [], h5: [], h6: [],
                ul: [], ol: [], li: [],
                a: ['href', 'title', 'target'],
                img: ['src', 'alt', 'title', 'width', 'height'],
                blockquote: [],
                code: [],
                pre: []
            },
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script', 'style', 'iframe']
        });
    }

    // Validate file upload
    validateFile(file) {
        const errors = [];

        if (!file) {
            errors.push('No file provided');
            return errors;
        }

        // Check file size
        if (file.size > this.config.fileUpload.maxSize) {
            errors.push(`File size exceeds ${this.config.fileUpload.maxSize / (1024 * 1024)}MB limit`);
        }

        // Check MIME type
        if (!this.config.fileUpload.allowedMimeTypes.includes(file.mimetype)) {
            errors.push(`File type ${file.mimetype} is not allowed`);
        }

        // Check file name
        if (file.originalname && !/^[a-zA-Z0-9._-]+$/.test(file.originalname.replace(/\s/g, '_'))) {
            errors.push('File name contains invalid characters');
        }

        return errors;
    }

    // Generate validation chain for common fields
    createValidationChain(field, type, options = {}) {
        const { location = 'body', optional = false } = options;
        let chain;

        switch (location) {
            case 'body':
                chain = body(field);
                break;
            case 'param':
                chain = param(field);
                break;
            case 'query':
                chain = query(field);
                break;
            default:
                throw new Error(`Invalid location: ${location}`);
        }

        if (optional) {
            chain = chain.optional();
        }

        // Apply type-specific validations
        switch (type) {
            case 'email':
                return chain
                    .isEmail()
                    .withMessage('Must be a valid email address')
                    .isLength({ max: this.config.limits.email.max })
                    .withMessage(`Email must not exceed ${this.config.limits.email.max} characters`)
                    .normalizeEmail();

            case 'title':
                return chain
                    .isLength({
                        min: this.config.limits.title.min,
                        max: this.config.limits.title.max
                    })
                    .withMessage(`Title must be between ${this.config.limits.title.min} and ${this.config.limits.title.max} characters`)
                    .matches(/^[a-zA-Z0-9\s\-_.,!?()]+$/)
                    .withMessage('Title contains invalid characters');

            case 'description':
                return chain
                    .isLength({
                        min: this.config.limits.description.min,
                        max: this.config.limits.description.max
                    })
                    .withMessage(`Description must be between ${this.config.limits.description.min} and ${this.config.limits.description.max} characters`);

            case 'content':
                return chain
                    .isLength({
                        min: this.config.limits.content.min,
                        max: this.config.limits.content.max
                    })
                    .withMessage(`Content must be between ${this.config.limits.content.min} and ${this.config.limits.content.max} characters`);

            case 'name':
                return chain
                    .isLength({
                        min: this.config.limits.name.min,
                        max: this.config.limits.name.max
                    })
                    .withMessage(`Name must be between ${this.config.limits.name.min} and ${this.config.limits.name.max} characters`)
                    .matches(/^[a-zA-Z\s\-'.]+$/)
                    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes');

            case 'phone':
                return chain
                    .matches(this.config.patterns.phone)
                    .withMessage('Must be a valid phone number');

            case 'url':
                return chain
                    .isURL({ require_protocol: true })
                    .withMessage('Must be a valid URL with protocol (http/https)')
                    .isLength({ max: this.config.limits.url.max })
                    .withMessage(`URL must not exceed ${this.config.limits.url.max} characters`);

            case 'slug':
                return chain
                    .matches(this.config.patterns.slug)
                    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens')
                    .isLength({
                        min: this.config.limits.slug.min,
                        max: this.config.limits.slug.max
                    })
                    .withMessage(`Slug must be between ${this.config.limits.slug.min} and ${this.config.limits.slug.max} characters`);

            case 'boolean':
                return chain
                    .isBoolean()
                    .withMessage('Must be a boolean value');

            case 'integer':
                return chain
                    .isInt(options.intOptions || {})
                    .withMessage('Must be a valid integer')
                    .toInt();

            case 'date':
                return chain
                    .isISO8601()
                    .withMessage('Must be a valid ISO 8601 date')
                    .toDate();

            case 'array':
                return chain
                    .isArray(options.arrayOptions || {})
                    .withMessage('Must be an array');

            default:
                return chain
                    .isString()
                    .withMessage('Must be a string')
                    .trim();
        }
    }
}

const validationHelper = new ValidationHelper();

// Validation result handler middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
            field: error.path || error.param,
            message: error.msg,
            value: error.value,
            location: error.location
        }));

        logger.performance('Validation errors', {
            ip: req.ip,
            path: req.path,
            method: req.method,
            errors: formattedErrors
        });

        return res.status(400).json({
            error: 'Validation failed',
            details: formattedErrors
        });
    }

    next();
};

// Sanitization middleware
const sanitizeRequest = (req, res, next) => {
    try {
        // Sanitize body
        if (req.body && typeof req.body === 'object') {
            req.body = sanitizeObject(req.body);
        }

        // Sanitize query parameters
        if (req.query && typeof req.query === 'object') {
            req.query = sanitizeObject(req.query);
        }

        next();
    } catch (error) {
        logger.error('Sanitization error:', error);
        res.status(500).json({ error: 'Request processing failed' });
    }
};

// Recursive object sanitization
const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
        return typeof obj === 'string' ? validationHelper.sanitizeString(obj) : obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        // Sanitize key name
        const cleanKey = validationHelper.sanitizeString(key);
        sanitized[cleanKey] = sanitizeObject(value);
    }

    return sanitized;
};

// Pre-defined validation schemas
const validationSchemas = {
    // Project validation
    project: [
        validationHelper.createValidationChain('title', 'title'),
        validationHelper.createValidationChain('description', 'description'),
        validationHelper.createValidationChain('content', 'content', { optional: true }),
        validationHelper.createValidationChain('technologies', 'array', { optional: true }),
        validationHelper.createValidationChain('projectUrl', 'url', { optional: true }),
        validationHelper.createValidationChain('status', 'string', { optional: true }),
        body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Status must be draft, published, or archived'),
        handleValidationErrors
    ],

    // Blog post validation
    blogPost: [
        validationHelper.createValidationChain('title', 'title'),
        validationHelper.createValidationChain('content', 'content'),
        validationHelper.createValidationChain('excerpt', 'description', { optional: true }),
        validationHelper.createValidationChain('slug', 'slug', { optional: true }),
        validationHelper.createValidationChain('tags', 'array', { optional: true }),
        validationHelper.createValidationChain('publishedAt', 'date', { optional: true }),
        body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Status must be draft, published, or archived'),
        handleValidationErrors
    ],

    // Team member validation
    teamMember: [
        validationHelper.createValidationChain('name', 'name'),
        validationHelper.createValidationChain('position', 'title'),
        validationHelper.createValidationChain('bio', 'description', { optional: true }),
        validationHelper.createValidationChain('email', 'email', { optional: true }),
        validationHelper.createValidationChain('linkedinUrl', 'url', { optional: true }),
        validationHelper.createValidationChain('githubUrl', 'url', { optional: true }),
        validationHelper.createValidationChain('skills', 'array', { optional: true }),
        handleValidationErrors
    ],

    // Contact form validation
    contact: [
        validationHelper.createValidationChain('name', 'name'),
        validationHelper.createValidationChain('email', 'email'),
        validationHelper.createValidationChain('phone', 'phone', { optional: true }),
        validationHelper.createValidationChain('subject', 'title'),
        validationHelper.createValidationChain('message', 'description'),
        body('serviceType').optional().isIn(['web-development', 'mobile-app', 'custom-software', 'ui-ux-design', 'consulting']).withMessage('Invalid service type'),
        body('budget').optional().isIn(['under-5k', '5k-10k', '10k-25k', '25k-50k', 'over-50k']).withMessage('Invalid budget range'),
        handleValidationErrors
    ],

    // Service validation
    service: [
        validationHelper.createValidationChain('name', 'title'),
        validationHelper.createValidationChain('description', 'description'),
        validationHelper.createValidationChain('features', 'array', { optional: true }),
        validationHelper.createValidationChain('price', 'string', { optional: true }),
        body('category').optional().isIn(['development', 'design', 'consulting', 'maintenance']).withMessage('Invalid service category'),
        handleValidationErrors
    ],

    // Company info validation
    companyInfo: [
        validationHelper.createValidationChain('section', 'string'),
        body('data').isObject().withMessage('Data must be an object'),
        handleValidationErrors
    ],

    // SEO metadata validation
    seoMetadata: [
        validationHelper.createValidationChain('page', 'string'),
        validationHelper.createValidationChain('title', 'title'),
        validationHelper.createValidationChain('description', 'description'),
        validationHelper.createValidationChain('keywords', 'string', { optional: true }),
        validationHelper.createValidationChain('canonicalUrl', 'url', { optional: true }),
        body('robots').optional().isIn(['index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow']).withMessage('Invalid robots directive'),
        handleValidationErrors
    ],

    // ID parameter validation
    idParam: [
        param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer').toInt(),
        handleValidationErrors
    ],

    // Slug parameter validation
    slugParam: [
        param('slug').matches(validationHelper.config.patterns.slug).withMessage('Invalid slug format'),
        handleValidationErrors
    ],

    projectQueryParams: [
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
        query('status').optional().isIn(['all', 'published', 'draft', 'archived']).withMessage('Invalid status'),
        query('category').optional().isIn(['all', 'web_application', 'mobile_application', 'desktop_application', 'e_commerce', 'cms', 'api']).withMessage('Invalid category'),
        query('featured').optional().isIn(['true', 'false']).withMessage('Featured must be true or false'),
        query('sort').optional().isIn(['created_at', 'updated_at', 'title', 'view_count']).withMessage('Invalid sort field'),
        query('order').optional().isIn(['ASC', 'DESC', 'asc', 'desc']).withMessage('Order must be ASC or DESC'),
        query('search').optional().isString().trim(),
        query('technology').optional().isString().trim(),
        handleValidationErrors
    ],

    // Query parameters validation
    queryParams: [
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
        // Updated to match actual database column names (snake_case)
        query('sort').optional().isIn([
            'created_at', 'updated_at', 'name', 'email', 'subject', 'status', 'company', 'phone'
        ]).withMessage('Invalid sort field'),
        // Accept both cases for order
        query('order').optional().isIn(['ASC', 'DESC', 'asc', 'desc']).withMessage('Order must be ASC or DESC'),
        // Updated status values to match your contact submission statuses
        query('status').optional().isIn(['new', 'in_progress', 'responded', 'closed']).withMessage('Invalid status'),
        // Add other query parameters
        query('search').optional().isString().trim(),
        query('service_interest').optional().isString(),
        query('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
        handleValidationErrors
    ]
};

module.exports = {
    ValidationHelper,
    validationHelper,
    handleValidationErrors,
    sanitizeRequest,
    validationSchemas,
    VALIDATION_CONFIG
};