// Corrected server/controllers/seoController.js to match your SEOMetadata model
const { SEOMetadata, Project, BlogPost } = require('../models');
const { logger } = require('../utils/logger');
const { seoEnhancer } = require('../middleware/seoEnhancer');
const { cacheManager } = require('../middleware/cache');
const { Op } = require('sequelize');
const seoGenerator = require('../utils/seoGenerator');

class SEOController {
    // Get SEO metadata for a specific page
    static async getPageSEO(req, res) {
        try {
            const { page } = req.params;

            const seoData = await SEOMetadata.findOne({
                where: { page_path: page } // Using page_path to match your model
            });

            if (!seoData) {
                // Generate default SEO for the page using new utility
                const defaultSEO = seoGenerator.generateCompleteSEO({
                    title: `${page.charAt(0).toUpperCase() + page.slice(1)} | ${process.env.SITE_NAME}`,
                    url: `/${page}`,
                    type: 'website'
                });

                return res.json({
                    page,
                    seo: defaultSEO,
                    isDefault: true,
                    message: 'Using generated default SEO metadata'
                });
            }

            logger.api('SEO metadata retrieved', { page });

            res.json({
                page,
                seo: seoData,
                isDefault: false
            });

        } catch (error) {
            logger.error('Error fetching SEO metadata:', error);
            res.status(500).json({
                error: 'Failed to fetch SEO metadata',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get all SEO metadata with filtering - CORRECTED VERSION
    static async getAllSEOData(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                search,
                sort = 'updated_at', // Using snake_case to match your model
                order = 'DESC'
            } = req.query;

            const whereClause = {};

            if (search) {
                whereClause[Op.or] = [
                    { page_path: { [Op.like]: `%${search}%` } }, // Using page_path
                    { title: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } }
                ];
            }

            const offset = (parseInt(page) - 1) * parseInt(limit);

            // Check if the sort column exists in your SEOMetadata model
            const allowedSortColumns = ['id', 'page_path', 'title', 'description', 'updated_at', 'created_at', 'priority'];
            const safeSortColumn = allowedSortColumns.includes(sort) ? sort : 'updated_at';

            const { count, rows: seoData } = await SEOMetadata.findAndCountAll({
                where: whereClause,
                limit: parseInt(limit),
                offset,
                order: [[safeSortColumn, order.toUpperCase()]],
                include: [
                    {
                        model: Project,
                        as: 'project',
                        attributes: ['id', 'title', 'slug'],
                        required: false
                    },
                    {
                        model: BlogPost,
                        as: 'blogPost',
                        attributes: ['id', 'title', 'slug'],
                        required: false
                    }
                ]
            });

            const totalPages = Math.ceil(count / parseInt(limit));

            res.json({
                seoData,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalEntries: count,
                    entriesPerPage: parseInt(limit),
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1
                },
                sortedBy: safeSortColumn,
                sortOrder: order
            });

        } catch (error) {
            logger.error('Error fetching all SEO data:', error);
            res.status(500).json({
                error: 'Failed to fetch SEO data',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Create or update SEO metadata
    static async updatePageSEO(req, res) {
        try {
            const { page } = req.params;
            const {
                title,
                description,
                keywords,
                canonicalUrl,
                robots = 'index, follow',
                ogImage,
                twitterImage,
                ogTitle,
                ogDescription,
                ogType = 'website',
                twitterCard = 'summary_large_image',
                structuredData = {},
                priority = 0.5,
                changeFrequency = 'monthly',
                isActive = true
            } = req.body;

            // Validate required fields
            if (!title || !description) {
                return res.status(400).json({
                    error: 'Validation failed',
                    message: 'Title and description are required'
                });
            }

            // Check if SEO data exists
            let seoData = await SEOMetadata.findOne({ where: { page_path: page } });

            const seoPayload = {
                page_path: page, // Using your model's field name
                title,
                description,
                keywords: Array.isArray(keywords) ? keywords : (keywords ? keywords.split(',').map(k => k.trim()) : []),
                canonical_url: canonicalUrl || `${process.env.SITE_URL}/${page.replace(/^(home|index)$/, '')}`,
                robots,
                og_image: ogImage,
                og_title: ogTitle || title,
                og_description: ogDescription || description,
                og_type: ogType,
                twitter_card: twitterCard,
                structured_data: structuredData,
                priority: parseFloat(priority),
                change_frequency: changeFrequency,
                is_active: isActive
            };

            if (seoData) {
                // Update existing
                await seoData.update(seoPayload);
                logger.api('SEO metadata updated', { page, title });
            } else {
                // Create new
                seoData = await SEOMetadata.create(seoPayload);
                logger.api('SEO metadata created', { page, title });
            }

            // Invalidate related caches
            try {
                if (cacheManager && cacheManager.isConnected) {
                    await cacheManager.invalidateByTags(['seo', page]);
                }
            } catch (cacheError) {
                logger.debug('Cache invalidation failed (non-critical):', cacheError);
            }

            res.json({
                message: seoData.isNewRecord ? 'SEO metadata created successfully' : 'SEO metadata updated successfully',
                seo: seoData
            });

        } catch (error) {
            logger.error('Error updating SEO metadata:', error);
            res.status(500).json({
                error: 'Failed to update SEO metadata',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Delete SEO metadata
    static async deleteSEO(req, res) {
        try {
            const { page } = req.params;

            const seoData = await SEOMetadata.findOne({ where: { page_path: page } });

            if (!seoData) {
                return res.status(404).json({
                    error: 'SEO metadata not found',
                    message: `No SEO data found for page: ${page}`
                });
            }

            await seoData.destroy();

            // Invalidate cache
            try {
                if (cacheManager && cacheManager.isConnected) {
                    await cacheManager.invalidateByTags(['seo', page]);
                }
            } catch (cacheError) {
                logger.debug('Cache invalidation failed (non-critical):', cacheError);
            }

            logger.api('SEO metadata deleted', { page });

            res.json({
                message: 'SEO metadata deleted successfully',
                deletedPage: page
            });

        } catch (error) {
            logger.error('Error deleting SEO metadata:', error);
            res.status(500).json({
                error: 'Failed to delete SEO metadata',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Enhanced SEO suggestions using new utility
    static async generateSEOSuggestions(req, res) {
        try {
            const { content, title, currentDescription = '', currentKeywords = '', url = '' } = req.body;

            if (!content && !title) {
                return res.status(400).json({
                    error: 'Content or title is required for SEO analysis'
                });
            }

            // Use the new SEO generator for comprehensive SEO data
            const completeSEO = seoGenerator.generateCompleteSEO({
                title,
                description: currentDescription,
                content,
                url,
                keywords: currentKeywords ? currentKeywords.split(',').map(k => k.trim()) : []
            });

            // Generate suggestions using new utility
            const suggestions = {
                metaDescription: seoGenerator.generateMetaDescription(content || title),
                keywords: seoGenerator.extractKeywords(content || title),
                readingTime: content ? seoGenerator.calculateReadingTime(content) : null,
                slug: title ? seoGenerator.generateSlug(title) : null,
                completeSEO: completeSEO
            };

            // Validate SEO data using new utility
            const validation = seoGenerator.validateSEO({
                title,
                description: currentDescription,
                keywords: currentKeywords,
                openGraph: completeSEO.openGraph
            });

            // Enhanced analysis with new features
            const analysis = {
                title: {
                    length: title ? title.length : 0,
                    recommendation: title ? (
                        title.length < 30 ? 'Title is too short (aim for 30-60 characters)' :
                            title.length > 60 ? 'Title is too long (aim for 30-60 characters)' :
                                'Title length is optimal'
                    ) : 'Title is required'
                },
                description: {
                    length: currentDescription.length,
                    recommendation: currentDescription ? (
                        currentDescription.length < 120 ? 'Description is too short (aim for 120-160 characters)' :
                            currentDescription.length > 160 ? 'Description is too long (aim for 120-160 characters)' :
                                'Description length is optimal'
                    ) : 'Meta description is recommended'
                },
                keywords: {
                    count: currentKeywords ? currentKeywords.split(',').length : 0,
                    recommendation: currentKeywords ? (
                        currentKeywords.split(',').length > 10 ? 'Too many keywords (aim for 5-10)' :
                            currentKeywords.split(',').length < 3 ? 'Consider adding more keywords (aim for 5-10)' :
                                'Keyword count is good'
                    ) : 'Keywords are recommended for better SEO'
                },
                structuredData: {
                    available: Object.keys(completeSEO.structuredData).length,
                    recommendation: 'Structured data will improve search visibility'
                },
                openGraph: {
                    complete: completeSEO.openGraph['og:title'] && completeSEO.openGraph['og:description'],
                    recommendation: completeSEO.openGraph['og:title'] && completeSEO.openGraph['og:description']
                        ? 'Open Graph data is complete'
                        : 'Add Open Graph data for better social sharing'
                }
            };

            logger.api('Enhanced SEO suggestions generated', {
                contentLength: content ? content.length : 0,
                seoScore: validation.score,
                hasStructuredData: Object.keys(completeSEO.structuredData).length > 0
            });

            res.json({
                suggestions,
                analysis,
                validation,
                seoScore: validation.score,
                recommendations: [
                    ...validation.recommendations,
                    validation.score < 50 ? 'Consider improving title and meta description length' : null,
                    !currentKeywords ? 'Add relevant keywords for better search visibility' : null,
                    content && content.length < 300 ? 'Consider adding more content (300+ words recommended)' : null,
                    title && !title.includes(process.env.SITE_NAME) ? `Consider including "${process.env.SITE_NAME}" in the title` : null
                ].filter(Boolean)
            });

        } catch (error) {
            logger.error('Error generating SEO suggestions:', error);
            res.status(500).json({
                error: 'Failed to generate SEO suggestions',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get SEO analytics and insights
    static async getSEOAnalytics(req, res) {
        try {
            // Get total SEO entries
            const totalSEOEntries = await SEOMetadata.count();

            // Get pages without SEO
            const totalProjects = await Project.count({ where: { status: 'published' } });
            const totalBlogPosts = await BlogPost.count({ where: { status: 'published' } });

            // Use page_path patterns since you don't have direct foreign keys
            const projectsWithSEO = await SEOMetadata.count({
                where: { page_path: { [Op.like]: '/projects/%' } }
            });

            const blogPostsWithSEO = await SEOMetadata.count({
                where: { page_path: { [Op.like]: '/blog/%' } }
            });

            // SEO coverage analysis
            const coverage = {
                projects: {
                    total: totalProjects,
                    withSEO: projectsWithSEO,
                    coverage: totalProjects > 0 ? ((projectsWithSEO / totalProjects) * 100).toFixed(1) : 0
                },
                blogPosts: {
                    total: totalBlogPosts,
                    withSEO: blogPostsWithSEO,
                    coverage: totalBlogPosts > 0 ? ((blogPostsWithSEO / totalBlogPosts) * 100).toFixed(1) : 0
                }
            };

            // Get SEO quality analysis
            const allSEOData = await SEOMetadata.findAll({
                attributes: ['title', 'description', 'keywords', 'page_path'],
                where: { is_active: true }
            });

            const qualityAnalysis = {
                optimalTitles: 0,
                optimalDescriptions: 0,
                withKeywords: 0,
                issues: []
            };

            allSEOData.forEach(seo => {
                // Title analysis
                if (seo.title && seo.title.length >= 30 && seo.title.length <= 60) {
                    qualityAnalysis.optimalTitles++;
                } else {
                    qualityAnalysis.issues.push({
                        page: seo.page_path,
                        issue: 'title_length',
                        message: 'Title length not optimal (30-60 characters recommended)'
                    });
                }

                // Description analysis
                if (seo.description && seo.description.length >= 120 && seo.description.length <= 160) {
                    qualityAnalysis.optimalDescriptions++;
                } else {
                    qualityAnalysis.issues.push({
                        page: seo.page_path,
                        issue: 'description_length',
                        message: 'Description length not optimal (120-160 characters recommended)'
                    });
                }

                // Keywords analysis (checking if it's an array with content)
                if (seo.keywords && Array.isArray(seo.keywords) && seo.keywords.length > 0) {
                    qualityAnalysis.withKeywords++;
                }
            });

            // Calculate overall SEO health score
            const totalChecks = allSEOData.length * 3; // 3 checks per entry
            const passedChecks = qualityAnalysis.optimalTitles + qualityAnalysis.optimalDescriptions + qualityAnalysis.withKeywords;
            const healthScore = totalChecks > 0 ? ((passedChecks / totalChecks) * 100).toFixed(1) : 0;

            res.json({
                overview: {
                    totalSEOEntries,
                    healthScore: `${healthScore}%`,
                    coverage
                },
                quality: {
                    ...qualityAnalysis,
                    totalEntries: allSEOData.length
                },
                recommendations: [
                    coverage.projects.coverage < 80 ? `${totalProjects - projectsWithSEO} projects need SEO metadata` : null,
                    coverage.blogPosts.coverage < 80 ? `${totalBlogPosts - blogPostsWithSEO} blog posts need SEO metadata` : null,
                    qualityAnalysis.issues.length > 5 ? 'Multiple SEO quality issues detected - review and optimize' : null,
                    healthScore < 70 ? 'SEO health score is below 70% - consider optimization' : null
                ].filter(Boolean)
            });

        } catch (error) {
            logger.error('Error fetching SEO analytics:', error);
            res.status(500).json({
                error: 'Failed to fetch SEO analytics',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Generate sitemap using new utility
    static async generateSitemap(req, res) {
        try {
            const sitemapGenerator = require('../utils/sitemapGenerator');

            const { type = 'xml' } = req.query;

            let result;
            switch (type) {
                case 'xml':
                    result = await sitemapGenerator.generateXMLSitemap();
                    break;
                case 'html':
                    result = await sitemapGenerator.generateHTMLSitemap();
                    break;
                case 'robots':
                    result = await sitemapGenerator.generateRobotsTxt();
                    break;
                case 'all':
                    result = await sitemapGenerator.generateAll();
                    break;
                default:
                    return res.status(400).json({
                        error: 'Invalid sitemap type',
                        message: 'Valid types: xml, html, robots, all'
                    });
            }

            logger.api('Sitemap generated', { type, success: result.success });

            res.json({
                message: `${type.toUpperCase()} sitemap generated successfully`,
                result
            });

        } catch (error) {
            logger.error('Error generating sitemap:', error);
            res.status(500).json({
                error: 'Failed to generate sitemap',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Generate sitemap data (your existing method - updated for your model)
    static async generateSitemapData(req, res) {
        try {
            const sitemapEntries = [];

            // Add static pages
            const staticPages = [
                { url: '/', priority: 1.0, changefreq: 'weekly' },
                { url: '/about', priority: 0.8, changefreq: 'monthly' },
                { url: '/services', priority: 0.9, changefreq: 'monthly' },
                { url: '/projects', priority: 0.9, changefreq: 'weekly' },
                { url: '/blog', priority: 0.8, changefreq: 'daily' },
                { url: '/contact', priority: 0.7, changefreq: 'monthly' }
            ];

            staticPages.forEach(page => {
                sitemapEntries.push({
                    url: `${process.env.SITE_URL}${page.url}`,
                    lastmod: new Date().toISOString(),
                    priority: page.priority,
                    changefreq: page.changefreq
                });
            });

            // Add published projects
            const projects = await Project.findAll({
                where: { status: 'published' },
                attributes: ['slug', 'updated_at'], // Using your model's field names
                order: [['updated_at', 'DESC']]
            });

            projects.forEach(project => {
                sitemapEntries.push({
                    url: `${process.env.SITE_URL}/projects/${project.slug}`,
                    lastmod: project.updated_at ? project.updated_at.toISOString() : new Date().toISOString(),
                    priority: 0.7,
                    changefreq: 'monthly'
                });
            });

            // Add published blog posts
            const blogPosts = await BlogPost.findAll({
                where: {
                    status: 'published',
                    published_at: { [Op.lte]: new Date() } // Assuming you use published_at
                },
                attributes: ['slug', 'updated_at'],
                order: [['published_at', 'DESC']]
            });

            blogPosts.forEach(post => {
                sitemapEntries.push({
                    url: `${process.env.SITE_URL}/blog/${post.slug}`,
                    lastmod: post.updated_at ? post.updated_at.toISOString() : new Date().toISOString(),
                    priority: 0.6,
                    changefreq: 'monthly'
                });
            });

            logger.api('Sitemap data generated', {
                totalEntries: sitemapEntries.length,
                projects: projects.length,
                blogPosts: blogPosts.length
            });

            res.json({
                sitemap: sitemapEntries,
                stats: {
                    totalEntries: sitemapEntries.length,
                    staticPages: staticPages.length,
                    projects: projects.length,
                    blogPosts: blogPosts.length,
                    lastGenerated: new Date().toISOString()
                }
            });

        } catch (error) {
            logger.error('Error generating sitemap data:', error);
            res.status(500).json({
                error: 'Failed to generate sitemap data',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
}

module.exports = SEOController;