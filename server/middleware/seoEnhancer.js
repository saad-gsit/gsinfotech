// server/middleware/seoEnhancer.js
const { logger } = require('../utils/logger');
const slugify = require('slugify');
const cheerio = require('cheerio');

// SEO configuration
const SEO_CONFIG = {
    // Default meta values
    defaults: {
        title: process.env.SITE_NAME || 'GS Infotech',
        description: 'Professional software development company specializing in custom solutions, web development, and mobile applications.',
        keywords: 'software development, web development, mobile apps, custom software, technology solutions',
        author: 'GS Infotech',
        viewport: 'width=device-width, initial-scale=1.0',
        robots: 'index, follow',
        language: 'en',
        type: 'website',
        siteName: process.env.SITE_NAME || 'GS Infotech'
    },

    // Page-specific SEO templates
    pageTemplates: {
        home: {
            title: 'GS Infotech - Professional Software Development Company',
            description: 'Leading software development company offering custom solutions, web development, mobile applications, and enterprise software. Transform your business with cutting-edge technology.',
            keywords: 'software development company, custom software solutions, web development services, mobile app development, enterprise software'
        },
        about: {
            title: 'About GS Infotech - Expert Software Development Team',
            description: 'Meet our experienced software development team. Learn about our mission, values, and commitment to delivering innovative technology solutions for businesses worldwide.',
            keywords: 'about gs infotech, software development team, technology experts, company mission, development experience'
        },
        services: {
            title: 'Software Development Services - GS Infotech',
            description: 'Comprehensive software development services including custom software, web development, mobile apps, UI/UX design, and enterprise solutions. Get a free consultation today.',
            keywords: 'software development services, custom software development, web development, mobile app development, ui ux design'
        },
        projects: {
            title: 'Software Development Portfolio - Our Success Stories',
            description: 'Explore our portfolio of successful software development projects. Case studies showcasing our expertise in web development, mobile apps, and enterprise solutions.',
            keywords: 'software development portfolio, case studies, project showcase, development examples, success stories'
        },
        blog: {
            title: 'Technology Blog - Software Development Insights',
            description: 'Stay updated with the latest in software development, programming tutorials, technology trends, and industry insights from our expert developers.',
            keywords: 'technology blog, software development insights, programming tutorials, tech industry news, development tips'
        },
        contact: {
            title: 'Contact GS Infotech - Get Your Project Started',
            description: 'Ready to start your software development project? Contact GS Infotech for a free consultation. We\'re here to help transform your ideas into reality.',
            keywords: 'contact gs infotech, software development consultation, project inquiry, get quote, hire developers'
        }
    },

    // Social media image dimensions
    socialImages: {
        og: { width: 1200, height: 630 },
        twitter: { width: 1200, height: 600 }
    }
};

class SEOEnhancer {
    constructor() {
        this.config = SEO_CONFIG;
    }

    // Generate SEO-friendly slug
    generateSlug(text, options = {}) {
        const defaultOptions = {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g
        };

        return slugify(text, { ...defaultOptions, ...options });
    }

    // Extract keywords from content
    extractKeywords(content, maxKeywords = 10) {
        if (!content || typeof content !== 'string') return [];

        // Remove HTML tags and normalize text
        const text = content.replace(/<[^>]*>/g, ' ').toLowerCase();

        // Common stop words to exclude
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
            'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i',
            'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
        ]);

        // Extract words and count frequency
        const words = text.match(/\b[a-z]{3,}\b/g) || [];
        const wordCount = {};

        words.forEach(word => {
            if (!stopWords.has(word)) {
                wordCount[word] = (wordCount[word] || 0) + 1;
            }
        });

        // Sort by frequency and return top keywords
        return Object.entries(wordCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, maxKeywords)
            .map(([word]) => word);
    }

    // Calculate reading time
    calculateReadingTime(content) {
        if (!content) return 0;

        const text = content.replace(/<[^>]*>/g, ' ');
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
        const wordsPerMinute = 200; // Average reading speed

        return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    }

    // Generate meta description from content
    generateMetaDescription(content, maxLength = 160) {
        if (!content) return this.config.defaults.description;

        // Remove HTML tags
        const text = content.replace(/<[^>]*>/g, ' ').trim();

        // Clean up extra whitespace
        const cleanText = text.replace(/\s+/g, ' ');

        if (cleanText.length <= maxLength) return cleanText;

        // Truncate at word boundary
        const truncated = cleanText.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');

        return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
    }

    // Generate structured data for organization
    generateOrganizationSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": this.config.defaults.siteName,
            "url": process.env.SITE_URL,
            "logo": `${process.env.SITE_URL}/logo.png`,
            "description": this.config.defaults.description,
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "US"
            },
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": process.env.COMPANY_PHONE,
                "contactType": "customer service",
                "email": process.env.COMPANY_EMAIL
            },
            "sameAs": [
                // Add social media URLs when available
            ]
        };
    }

    // Generate structured data for articles/blog posts
    generateArticleSchema(data) {
        const {
            title,
            description,
            content,
            author,
            publishedAt,
            updatedAt,
            slug,
            featuredImage
        } = data;

        return {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": description,
            "author": {
                "@type": "Person",
                "name": author || "GS Infotech Team"
            },
            "publisher": {
                "@type": "Organization",
                "name": this.config.defaults.siteName,
                "logo": {
                    "@type": "ImageObject",
                    "url": `${process.env.SITE_URL}/logo.png`
                }
            },
            "datePublished": publishedAt,
            "dateModified": updatedAt || publishedAt,
            "url": `${process.env.SITE_URL}/blog/${slug}`,
            "image": featuredImage ? `${process.env.SITE_URL}${featuredImage}` : undefined,
            "wordCount": content ? content.split(/\s+/).length : undefined,
            "timeRequired": `PT${this.calculateReadingTime(content)}M`
        };
    }

    // Generate breadcrumb schema
    generateBreadcrumbSchema(breadcrumbs) {
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": item.name,
                "item": `${process.env.SITE_URL}${item.url}`
            }))
        };
    }

    // Generate Open Graph meta tags
    generateOpenGraphTags(data) {
        const {
            title,
            description,
            url,
            type = 'website',
            image,
            siteName = this.config.defaults.siteName
        } = data;

        return {
            'og:title': title,
            'og:description': description,
            'og:url': url,
            'og:type': type,
            'og:site_name': siteName,
            'og:image': image,
            'og:image:width': this.config.socialImages.og.width,
            'og:image:height': this.config.socialImages.og.height,
            'og:locale': 'en_US'
        };
    }

    // Generate Twitter Card meta tags
    generateTwitterCardTags(data) {
        const {
            title,
            description,
            image,
            creator = '@gsinfotech'
        } = data;

        return {
            'twitter:card': 'summary_large_image',
            'twitter:title': title,
            'twitter:description': description,
            'twitter:image': image,
            'twitter:creator': creator,
            'twitter:site': creator
        };
    }

    // Get page-specific SEO data
    getPageSEO(pageType, customData = {}) {
        const template = this.config.pageTemplates[pageType] || {};
        const defaults = this.config.defaults;

        return {
            title: customData.title || template.title || defaults.title,
            description: customData.description || template.description || defaults.description,
            keywords: customData.keywords || template.keywords || defaults.keywords,
            canonical: customData.canonical || `${process.env.SITE_URL}${customData.path || '/'}`,
            robots: customData.robots || defaults.robots,
            author: customData.author || defaults.author,
            type: customData.type || defaults.type
        };
    }
}

// SEO Middleware
const seoEnhancer = new SEOEnhancer();

const createSEOMiddleware = (options = {}) => {
    return (req, res, next) => {
        // Add SEO helper methods to request object
        req.seo = {
            enhancer: seoEnhancer,

            // Generate SEO data for current page
            generatePageSEO: (pageType, customData = {}) => {
                return seoEnhancer.getPageSEO(pageType, {
                    ...customData,
                    path: req.path
                });
            },

            // Add SEO data to response
            setSEOData: (data) => {
                res.locals.seo = data;
            },

            // Generate complete meta tags
            generateMetaTags: (data) => {
                const openGraph = seoEnhancer.generateOpenGraphTags(data);
                const twitterCard = seoEnhancer.generateTwitterCardTags(data);

                return {
                    ...openGraph,
                    ...twitterCard,
                    'description': data.description,
                    'keywords': data.keywords,
                    'author': data.author,
                    'robots': data.robots,
                    'canonical': data.canonical
                };
            }
        };

        // Add SEO data to response locals for template rendering
        res.locals.seoEnhancer = seoEnhancer;

        next();
    };
};

// Auto-generate SEO for blog posts
const autoGenerateBlogSEO = async (req, res, next) => {
    if (req.method === 'POST' && req.path.includes('/blog')) {
        try {
            const { title, content, excerpt } = req.body;

            if (title && content) {
                // Auto-generate SEO fields if not provided
                req.body.slug = req.body.slug || seoEnhancer.generateSlug(title);
                req.body.metaDescription = req.body.metaDescription ||
                    seoEnhancer.generateMetaDescription(excerpt || content);
                req.body.keywords = req.body.keywords ||
                    seoEnhancer.extractKeywords(content).join(', ');
                req.body.readingTime = seoEnhancer.calculateReadingTime(content);

                logger.info('Auto-generated SEO data for blog post', {
                    title,
                    slug: req.body.slug,
                    readingTime: req.body.readingTime
                });
            }
        } catch (error) {
            logger.error('Failed to auto-generate blog SEO:', error);
        }
    }

    next();
};

module.exports = {
    SEOEnhancer,
    seoEnhancer,
    createSEOMiddleware,
    autoGenerateBlogSEO
};