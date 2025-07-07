// server/controllers/seoController.js
const { SEOMetadata, Project, BlogPost } = require('../models');
const { logger } = require('../utils/logger');
const { seoEnhancer } = require('../middleware/seoEnhancer');
const { cacheManager } = require('../middleware/cache');
const { Op } = require('sequelize');

class SEOController {
    // Get SEO metadata for a specific page
    static async getPageSEO(req, res) {
        try {
            const { page } = req.params;

            const seoData = await SEOMetadata.findOne({
                where: { page }
            });

            if (!seoData) {
                // Generate default SEO for the page
                const defaultSEO = seoEnhancer.getPageSEO(page, { path: req.path });

                return res.json({
                    page,
                    seo: defaultSEO,
                    isDefault: true,
                    message: 'Using default SEO metadata'
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

    // Get all SEO metadata with filtering
    static async getAllSEOData(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                search,
                sort = 'createdAt',
                order = 'DESC'
            } = req.query;

            const whereClause = {};

            if (search) {
                whereClause[Op.or] = [
                    { page: { [Op.like]: `%${search}%` } },
                    { title: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } }
                ];
            }

            const offset = (parseInt(page) - 1) * parseInt(limit);

            const { count, rows: seoData } = await SEOMetadata.findAndCountAll({
                where: whereClause,
                limit: parseInt(limit),
                offset,
                order: [[sort, order.toUpperCase()]],
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
                }
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
                robots = 'index,follow',
                ogImage,
                twitterImage,
                customMeta = {}
            } = req.body;

            // Validate required fields
            if (!title || !description) {
                return res.status(400).json({
                    error: 'Validation failed',
                    message: 'Title and description are required'
                });
            }

            // Check if SEO data exists
            let seoData = await SEOMetadata.findOne({ where: { page } });

            const seoPayload = {
                page,
                title,
                description,
                keywords,
                canonicalUrl: canonicalUrl || `${process.env.SITE_URL}/${page.replace(/^(home|index)$/, '')}`,
                robots,
                ogImage,
                twitterImage,
                customMeta
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
            if (cacheManager.isConnected) {
                await cacheManager.invalidateByTags(['seo', page]);
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

            const seoData = await SEOMetadata.findOne({ where: { page } });

            if (!seoData) {
                return res.status(404).json({
                    error: 'SEO metadata not found',
                    message: `No SEO data found for page: ${page}`
                });
            }

            await seoData.destroy();

            // Invalidate cache
            if (cacheManager.isConnected) {
                await cacheManager.invalidateByTags(['seo', page]);
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

    // Generate SEO suggestions for content
    static async generateSEOSuggestions(req, res) {
        try {
            const { content, title, currentDescription = '', currentKeywords = '' } = req.body;

            if (!content && !title) {
                return res.status(400).json({
                    error: 'Content or title is required for SEO analysis'
                });
            }

            // Generate suggestions
            const suggestions = {
                metaDescription: seoEnhancer.generateMetaDescription(content || title),
                keywords: seoEnhancer.extractKeywords(content || title),
                readingTime: content ? seoEnhancer.calculateReadingTime(content) : null,
                slug: title ? seoEnhancer.generateSlug(title) : null
            };

            // Analyze current SEO
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
                }
            };

            // SEO score calculation
            let seoScore = 0;
            if (title && title.length >= 30 && title.length <= 60) seoScore += 25;
            if (currentDescription.length >= 120 && currentDescription.length <= 160) seoScore += 25;
            if (currentKeywords && currentKeywords.split(',').length >= 3 && currentKeywords.split(',').length <= 10) seoScore += 25;
            if (content && content.length >= 300) seoScore += 25;

            logger.api('SEO suggestions generated', {
                contentLength: content ? content.length : 0,
                seoScore
            });

            res.json({
                suggestions,
                analysis,
                seoScore,
                recommendations: [
                    seoScore < 50 ? 'Consider improving title and meta description length' : null,
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
            const projectsWithSEO = await SEOMetadata.count({ where: { projectId: { [Op.ne]: null } } });
            const blogPostsWithSEO = await SEOMetadata.count({ where: { blogPostId: { [Op.ne]: null } } });

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
                attributes: ['title', 'description', 'keywords', 'page']
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
                        page: seo.page,
                        issue: 'title_length',
                        message: 'Title length not optimal (30-60 characters recommended)'
                    });
                }

                // Description analysis
                if (seo.description && seo.description.length >= 120 && seo.description.length <= 160) {
                    qualityAnalysis.optimalDescriptions++;
                } else {
                    qualityAnalysis.issues.push({
                        page: seo.page,
                        issue: 'description_length',
                        message: 'Description length not optimal (120-160 characters recommended)'
                    });
                }

                // Keywords analysis
                if (seo.keywords && seo.keywords.trim()) {
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

    // Generate sitemap data
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
                attributes: ['slug', 'updatedAt'],
                order: [['updatedAt', 'DESC']]
            });

            projects.forEach(project => {
                sitemapEntries.push({
                    url: `${process.env.SITE_URL}/projects/${project.slug}`,
                    lastmod: project.updatedAt.toISOString(),
                    priority: 0.7,
                    changefreq: 'monthly'
                });
            });

            // Add published blog posts
            const blogPosts = await BlogPost.findAll({
                where: {
                    status: 'published',
                    publishedAt: { [Op.lte]: new Date() }
                },
                attributes: ['slug', 'updatedAt'],
                order: [['publishedAt', 'DESC']]
            });

            blogPosts.forEach(post => {
                sitemapEntries.push({
                    url: `${process.env.SITE_URL}/blog/${post.slug}`,
                    lastmod: post.updatedAt.toISOString(),
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