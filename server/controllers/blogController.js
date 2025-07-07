// server/controllers/blogController.js
const { BlogPost, SEOMetadata } = require('../models');
const { logger } = require('../utils/logger');
const { cacheManager } = require('../middleware/cache');
const { seoEnhancer } = require('../middleware/seoEnhancer');
const slugify = require('slugify');
const { Op } = require('sequelize');

class BlogController {
    // Get all blog posts with advanced filtering and SEO
    static async getAllPosts(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                status = 'published',
                tag,
                category,
                author,
                featured,
                sort = 'published_at',
                order = 'DESC',
                search
            } = req.query;

            // Build where clause
            const whereClause = {};

            if (status && status !== 'all') {
                whereClause.status = status;
            }

            if (category) {
                whereClause.category = category;
            }

            if (author) {
                whereClause.author_name = { [Op.like]: `%${author}%` };
            }

            if (featured !== undefined) {
                whereClause.featured = featured === 'true';
            }

            if (tag) {
                whereClause.tags = { [Op.like]: `%${tag}%` };
            }

            if (search) {
                whereClause[Op.or] = [
                    { title: { [Op.like]: `%${search}%` } },
                    { excerpt: { [Op.like]: `%${search}%` } },
                    { content: { [Op.like]: `%${search}%` } },
                    { tags: { [Op.like]: `%${search}%` } }
                ];
            }

            // For published posts, only show current or past publish dates
            if (status === 'published') {
                whereClause.published_at = { [Op.lte]: new Date() };
            }

            const offset = (parseInt(page) - 1) * parseInt(limit);

            // Get posts with pagination - using manual SEO fetching
            const { count, rows: posts } = await BlogPost.findAndCountAll({
                where: whereClause,
                limit: parseInt(limit),
                offset,
                order: [[sort, order.toUpperCase()]]
            });

            // Manually fetch SEO data for each post
            const postsWithSEO = await Promise.all(
                posts.map(async (post) => {
                    const seoData = await SEOMetadata.findOne({
                        where: { page_path: `blog/${post.slug}` }
                    });

                    const postData = post.toJSON();

                    // Add reading time and excerpt if missing
                    if (!postData.reading_time && postData.content) {
                        postData.reading_time = Math.ceil(
                            postData.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200
                        );
                    }
                    if (!postData.excerpt && postData.content) {
                        postData.excerpt = postData.content
                            .replace(/<[^>]*>/g, '')
                            .substring(0, 200) + '...';
                    }

                    return {
                        ...postData,
                        seoData
                    };
                })
            );

            const totalPages = Math.ceil(count / parseInt(limit));

            const response = {
                posts: postsWithSEO,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalPosts: count,
                    postsPerPage: parseInt(limit),
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1
                },
                filters: { status, tag, category, author, featured, search }
            };

            logger.api('Blog posts retrieved successfully', {
                count: posts.length,
                page: parseInt(page),
                filters: { status, tag, category, author }
            });

            res.json(response);

        } catch (error) {
            logger.error('Error fetching blog posts:', error);
            res.status(500).json({
                error: 'Failed to fetch blog posts',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get single blog post with SEO optimization
    static async getPostById(req, res) {
        try {
            const { id } = req.params;

            const isNumeric = /^\d+$/.test(id);
            const whereClause = isNumeric ? { id: parseInt(id) } : { slug: id };

            const post = await BlogPost.findOne({
                where: whereClause
            });

            if (!post) {
                return res.status(404).json({
                    error: 'Blog post not found',
                    message: `No blog post found with ${isNumeric ? 'ID' : 'slug'}: ${id}`
                });
            }

            // Check if post should be visible
            if (post.status === 'published' && post.published_at && post.published_at > new Date()) {
                return res.status(404).json({
                    error: 'Blog post not published yet',
                    message: 'This post is scheduled for future publication'
                });
            }

            // Manually fetch SEO data
            const seoData = await SEOMetadata.findOne({
                where: { page_path: `blog/${post.slug}` }
            });

            // Increment view count
            await post.increment('view_count');

            // Enhance post data
            const postData = post.toJSON();
            if (!postData.reading_time && postData.content) {
                postData.reading_time = Math.ceil(
                    postData.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200
                );
            }

            // Get related posts
            const relatedPosts = await BlogPost.findAll({
                where: {
                    id: { [Op.ne]: post.id },
                    status: 'published',
                    published_at: { [Op.lte]: new Date() },
                    [Op.or]: [
                        { category: post.category },
                        { tags: { [Op.like]: `%${post.tags?.[0] || ''}%` } }
                    ]
                },
                limit: 3,
                order: [['published_at', 'DESC']],
                attributes: ['id', 'title', 'slug', 'excerpt', 'featured_image', 'published_at', 'reading_time']
            });

            logger.api('Blog post retrieved', {
                postId: post.id,
                slug: post.slug,
                views: post.view_count + 1
            });

            res.json({
                post: {
                    ...postData,
                    view_count: post.view_count + 1,
                    seoData
                },
                relatedPosts
            });

        } catch (error) {
            logger.error('Error fetching blog post:', error);
            res.status(500).json({
                error: 'Failed to fetch blog post',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Create new blog post with auto SEO generation
    static async createPost(req, res) {
        try {
            const {
                title,
                content,
                excerpt,
                category,
                tags = [],
                author_name,
                featured = false,
                status = 'draft',
                published_at,
                metaDescription,
                metaKeywords
            } = req.body;

            // Auto-generate missing fields
            const slug = req.body.slug || slugify(title, { lower: true, strict: true });

            // Check for duplicate slug
            const existingPost = await BlogPost.findOne({ where: { slug } });
            if (existingPost) {
                return res.status(400).json({
                    error: 'Slug conflict',
                    message: 'A blog post with this title already exists',
                    suggestion: `${slug}-${Date.now()}`
                });
            }

            // Auto-generate SEO data
            const autoExcerpt = excerpt || content.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
            const autoMetaDescription = metaDescription || autoExcerpt;
            const autoKeywords = metaKeywords || [];
            const readingTime = Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200);

            // Process uploaded images
            let featuredImage = null;
            if (req.processedImages && req.processedImages.featuredImage) {
                const images = req.processedImages.featuredImage[0]?.responsiveImages;
                featuredImage = images?.find(img => img.size === 'large')?.url || images?.[0]?.url;
            }

            // Set publish date
            const finalPublishedAt = status === 'published' ?
                (published_at ? new Date(published_at) : new Date()) :
                null;

            // Create blog post
            const post = await BlogPost.create({
                title,
                slug,
                content,
                excerpt: autoExcerpt,
                category,
                tags: Array.isArray(tags) ? tags : [tags],
                author_name: author_name || 'GS Infotech Team',
                featured,
                status,
                published_at: finalPublishedAt,
                featured_image: featuredImage,
                reading_time: readingTime,
                view_count: 0
            });

            // Create SEO metadata for published posts
            if (status === 'published') {
                await SEOMetadata.create({
                    page_path: `blog/${post.slug}`,
                    title: `${title} | ${process.env.SITE_NAME || 'GS Infotech'} Blog`,
                    description: autoMetaDescription,
                    keywords: Array.isArray(autoKeywords) ? autoKeywords : autoKeywords.split(', '),
                    canonical_url: `${process.env.SITE_URL || 'https://gsinfotech.com'}/blog/${slug}`,
                    og_title: title,
                    og_description: autoMetaDescription,
                    og_type: 'article'
                });
            }

            // Invalidate blog cache
            if (cacheManager?.isConnected) {
                await cacheManager.invalidateByTags(['blog']);
            }

            logger.api('Blog post created successfully', {
                postId: post.id,
                title,
                slug,
                status,
                readingTime
            });

            res.status(201).json({
                message: 'Blog post created successfully',
                post,
                seo: {
                    metaDescription: autoMetaDescription,
                    keywords: autoKeywords,
                    slug,
                    readingTime
                }
            });

        } catch (error) {
            logger.error('Error creating blog post:', error);
            res.status(500).json({
                error: 'Failed to create blog post',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Update blog post
    static async updatePost(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            const post = await BlogPost.findByPk(id);
            if (!post) {
                return res.status(404).json({
                    error: 'Blog post not found',
                    message: `No blog post found with ID: ${id}`
                });
            }

            // Regenerate slug if title changed
            if (updates.title && updates.title !== post.title) {
                updates.slug = slugify(updates.title, { lower: true, strict: true });

                const existingPost = await BlogPost.findOne({
                    where: {
                        slug: updates.slug,
                        id: { [Op.ne]: id }
                    }
                });

                if (existingPost) {
                    updates.slug = `${updates.slug}-${Date.now()}`;
                }
            }

            // Update reading time if content changed
            if (updates.content && updates.content !== post.content) {
                updates.reading_time = Math.ceil(
                    updates.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200
                );
            }

            // Handle featured image update
            if (req.processedImages && req.processedImages.featuredImage) {
                const images = req.processedImages.featuredImage[0]?.responsiveImages;
                updates.featured_image = images?.find(img => img.size === 'large')?.url || images?.[0]?.url;
            }

            // Handle publishing
            if (updates.status === 'published' && post.status !== 'published') {
                updates.published_at = updates.published_at ? new Date(updates.published_at) : new Date();
            }

            // Update post
            await post.update(updates);

            // Update SEO metadata
            if (post.status === 'published' || updates.status === 'published') {
                const seoData = await SEOMetadata.findOne({
                    where: { page_path: `blog/${post.slug}` }
                });

                const seoUpdates = {
                    page_path: `blog/${post.slug}`,
                    title: `${post.title} | ${process.env.SITE_NAME || 'GS Infotech'} Blog`,
                    description: updates.metaDescription || post.excerpt || post.content.substring(0, 160),
                    keywords: updates.metaKeywords ? updates.metaKeywords.split(', ') : [],
                    canonical_url: `${process.env.SITE_URL || 'https://gsinfotech.com'}/blog/${post.slug}`
                };

                if (seoData) {
                    await seoData.update(seoUpdates);
                } else {
                    await SEOMetadata.create(seoUpdates);
                }
            }

            // Invalidate cache
            if (cacheManager?.isConnected) {
                await cacheManager.invalidateByTags(['blog']);
            }

            logger.api('Blog post updated successfully', {
                postId: post.id,
                updatedFields: Object.keys(updates)
            });

            res.json({
                message: 'Blog post updated successfully',
                post
            });

        } catch (error) {
            logger.error('Error updating blog post:', error);
            res.status(500).json({
                error: 'Failed to update blog post',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Delete blog post
    static async deletePost(req, res) {
        try {
            const { id } = req.params;

            const post = await BlogPost.findByPk(id);
            if (!post) {
                return res.status(404).json({
                    error: 'Blog post not found',
                    message: `No blog post found with ID: ${id}`
                });
            }

            // Delete SEO metadata
            await SEOMetadata.destroy({
                where: { page_path: `blog/${post.slug}` }
            });

            // Delete post
            await post.destroy();

            // Invalidate cache
            if (cacheManager?.isConnected) {
                await cacheManager.invalidateByTags(['blog']);
            }

            logger.api('Blog post deleted successfully', {
                postId: id,
                title: post.title
            });

            res.json({
                message: 'Blog post deleted successfully',
                deletedPost: {
                    id: post.id,
                    title: post.title,
                    slug: post.slug
                }
            });

        } catch (error) {
            logger.error('Error deleting blog post:', error);
            res.status(500).json({
                error: 'Failed to delete blog post',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get blog statistics and analytics
    static async getBlogStats(req, res) {
        try {
            const totalPosts = await BlogPost.count();
            const publishedPosts = await BlogPost.count({ where: { status: 'published' } });
            const draftPosts = await BlogPost.count({ where: { status: 'draft' } });
            const totalViews = await BlogPost.sum('view_count') || 0;
            const featuredPosts = await BlogPost.count({ where: { featured: true } });

            // Get popular posts
            const popularPosts = await BlogPost.findAll({
                where: { status: 'published' },
                order: [['view_count', 'DESC']],
                limit: 5,
                attributes: ['id', 'title', 'slug', 'view_count', 'published_at']
            });

            // Get recent posts
            const recentPosts = await BlogPost.findAll({
                where: { status: 'published' },
                order: [['published_at', 'DESC']],
                limit: 5,
                attributes: ['id', 'title', 'slug', 'published_at', 'view_count']
            });

            // Get category distribution
            const categories = await BlogPost.findAll({
                attributes: [
                    'category',
                    [BlogPost.sequelize.fn('COUNT', '*'), 'count']
                ],
                where: { status: 'published' },
                group: ['category'],
                order: [[BlogPost.sequelize.literal('count'), 'DESC']]
            });

            const response = {
                overview: {
                    totalPosts,
                    publishedPosts,
                    draftPosts,
                    totalViews,
                    featuredPosts,
                    averageViews: publishedPosts > 0 ? Math.round(totalViews / publishedPosts) : 0
                },
                popularPosts,
                recentPosts,
                categories: categories.map(cat => ({
                    category: cat.category,
                    count: parseInt(cat.get('count'))
                }))
            };

            logger.api('Blog statistics retrieved', {
                totalPosts,
                publishedPosts,
                totalViews
            });

            res.json(response);

        } catch (error) {
            logger.error('Error fetching blog statistics:', error);
            res.status(500).json({
                error: 'Failed to fetch blog statistics',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get posts by category
    static async getPostsByCategory(req, res) {
        try {
            const { category } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const offset = (parseInt(page) - 1) * parseInt(limit);

            const { count, rows: posts } = await BlogPost.findAndCountAll({
                where: {
                    category,
                    status: 'published',
                    published_at: { [Op.lte]: new Date() }
                },
                limit: parseInt(limit),
                offset,
                order: [['published_at', 'DESC']],
                attributes: ['id', 'title', 'slug', 'excerpt', 'featured_image', 'published_at', 'reading_time', 'view_count']
            });

            const totalPages = Math.ceil(count / parseInt(limit));

            res.json({
                category,
                posts,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalPosts: count,
                    postsPerPage: parseInt(limit),
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1
                }
            });

        } catch (error) {
            logger.error('Error fetching posts by category:', error);
            res.status(500).json({
                error: 'Failed to fetch posts by category',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get posts by tag
    static async getPostsByTag(req, res) {
        try {
            const { tag } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const offset = (parseInt(page) - 1) * parseInt(limit);

            const { count, rows: posts } = await BlogPost.findAndCountAll({
                where: {
                    tags: { [Op.like]: `%${tag}%` },
                    status: 'published',
                    published_at: { [Op.lte]: new Date() }
                },
                limit: parseInt(limit),
                offset,
                order: [['published_at', 'DESC']],
                attributes: ['id', 'title', 'slug', 'excerpt', 'featured_image', 'published_at', 'reading_time', 'view_count']
            });

            const totalPages = Math.ceil(count / parseInt(limit));

            res.json({
                tag,
                posts,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalPosts: count,
                    postsPerPage: parseInt(limit),
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1
                }
            });

        } catch (error) {
            logger.error('Error fetching posts by tag:', error);
            res.status(500).json({
                error: 'Failed to fetch posts by tag',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
}

module.exports = BlogController;