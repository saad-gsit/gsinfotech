// server/controllers/projectController.js
const { Project, SEOMetadata } = require('../models');
const { logger } = require('../utils/logger');
const { cacheManager } = require('../middleware/cache');
const { seoEnhancer } = require('../middleware/seoEnhancer');
const slugify = require('slugify');
const { Op } = require('sequelize');

class ProjectController {
    // Get all projects with filtering, pagination, and SEO data
    static async getAllProjects(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                status = 'published',
                category,
                technology,
                featured,
                sort = 'created_at',
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

            if (featured !== undefined) {
                whereClause.featured = featured === 'true';
            }

            if (search) {
                whereClause[Op.or] = [
                    { title: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } },
                    { technologies: { [Op.like]: `%${search}%` } }
                ];
            }

            if (technology) {
                whereClause.technologies = { [Op.like]: `%${technology}%` };
            }

            // Calculate offset
            const offset = (parseInt(page) - 1) * parseInt(limit);

            // Get projects with pagination
            const { count, rows: projects } = await Project.findAndCountAll({
                where: whereClause,
                limit: parseInt(limit),
                offset,
                order: [[sort, order.toUpperCase()]]
            });

            // Manually fetch SEO data for each project
            const projectsWithSEO = await Promise.all(
                projects.map(async (project) => {
                    const seoData = await SEOMetadata.findOne({
                        where: { page_path: `projects/${project.slug}` }
                    });

                    return {
                        ...project.toJSON(),
                        seoData
                    };
                })
            );

            // Calculate pagination info
            const totalPages = Math.ceil(count / parseInt(limit));

            // Format response
            const response = {
                projects: projectsWithSEO,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalProjects: count,
                    projectsPerPage: parseInt(limit),
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1
                },
                filters: {
                    status,
                    category,
                    technology,
                    featured,
                    search
                }
            };

            logger.api('Projects retrieved successfully', {
                count: projects.length,
                page: parseInt(page),
                filters: { status, category, technology, featured, search }
            });

            res.json(response);

        } catch (error) {
            logger.error('Error fetching projects:', error);
            res.status(500).json({
                error: 'Failed to fetch projects',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get single project by ID or slug
    static async getProjectById(req, res) {
        try {
            const { id } = req.params;

            // Check if ID is numeric (database ID) or string (slug)
            const isNumeric = /^\d+$/.test(id);
            const whereClause = isNumeric ? { id: parseInt(id) } : { slug: id };

            const project = await Project.findOne({
                where: whereClause
            });

            if (!project) {
                return res.status(404).json({
                    error: 'Project not found',
                    message: `No project found with ${isNumeric ? 'ID' : 'slug'}: ${id}`
                });
            }

            // Manually fetch SEO data
            const seoData = await SEOMetadata.findOne({
                where: { page_path: `projects/${project.slug}` }
            });

            // Increment view count
            await project.increment('view_count');

            logger.api('Project retrieved', {
                projectId: project.id,
                slug: project.slug,
                views: project.view_count + 1
            });

            res.json({
                project: {
                    ...project.toJSON(),
                    view_count: project.view_count + 1,
                    seoData
                }
            });

        } catch (error) {
            logger.error('Error fetching project:', error);
            res.status(500).json({
                error: 'Failed to fetch project',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Create new project with image optimization
    static async createProject(req, res) {
        try {
            const {
                title,
                description,
                content,
                technologies = [],
                category,
                project_url,
                github_url,
                featured = false,
                status = 'draft',
                metaDescription,
                metaKeywords
            } = req.body;

            // Generate slug from title
            const slug = slugify(title, { lower: true, strict: true });

            // Check for duplicate slug
            const existingProject = await Project.findOne({ where: { slug } });
            if (existingProject) {
                return res.status(400).json({
                    error: 'Slug conflict',
                    message: 'A project with this title already exists',
                    suggestion: `Try: ${slug}-${Date.now()}`
                });
            }

            // Process uploaded images if any
            let imageUrls = {};
            if (req.processedImages) {
                for (const [fieldName, images] of Object.entries(req.processedImages)) {
                    imageUrls[fieldName] = images[0]?.responsiveImages || [];
                }
            }

            // Auto-generate SEO data
            const autoMetaDescription = metaDescription ||
                (seoEnhancer?.generateMetaDescription ? seoEnhancer.generateMetaDescription(description || content) : description?.substring(0, 160));
            const autoKeywords = metaKeywords ||
                (seoEnhancer?.extractKeywords ? seoEnhancer.extractKeywords(content || description).join(', ') : '');

            // Create project
            const project = await Project.create({
                title,
                slug,
                description,
                content,
                technologies: Array.isArray(technologies) ? technologies : [technologies],
                category,
                project_url,
                github_url,
                featured,
                status,
                gallery: imageUrls,
                view_count: 0
            });

            // Create SEO metadata for published projects
            if (status === 'published') {
                await SEOMetadata.create({
                    page_path: `projects/${project.slug}`,
                    title: `${title} - Project Showcase | ${process.env.SITE_NAME || 'GS Infotech'}`,
                    description: autoMetaDescription,
                    keywords: autoKeywords ? autoKeywords.split(', ') : [],
                    canonical_url: `${process.env.SITE_URL || 'https://gsinfotech.com'}/projects/${slug}`,
                    og_title: title,
                    og_description: autoMetaDescription,
                    og_type: 'article'
                });
            }

            // Invalidate related caches
            if (cacheManager?.isConnected) {
                await cacheManager.invalidateByTags(['projects']);
            }

            logger.api('Project created successfully', {
                projectId: project.id,
                title,
                slug,
                status,
                imagesProcessed: Object.keys(imageUrls).length
            });

            res.status(201).json({
                message: 'Project created successfully',
                project,
                seo: {
                    metaDescription: autoMetaDescription,
                    keywords: autoKeywords,
                    slug
                },
                images: imageUrls
            });

        } catch (error) {
            logger.error('Error creating project:', error);
            res.status(500).json({
                error: 'Failed to create project',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Update project
    static async updateProject(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            const project = await Project.findByPk(id);
            if (!project) {
                return res.status(404).json({
                    error: 'Project not found',
                    message: `No project found with ID: ${id}`
                });
            }

            // If title is being updated, regenerate slug
            if (updates.title && updates.title !== project.title) {
                updates.slug = slugify(updates.title, { lower: true, strict: true });

                // Check for slug conflicts
                const existingProject = await Project.findOne({
                    where: {
                        slug: updates.slug,
                        id: { [Op.ne]: id }
                    }
                });

                if (existingProject) {
                    updates.slug = `${updates.slug}-${Date.now()}`;
                }
            }

            // Process new images if uploaded
            if (req.processedImages) {
                const newImages = {};
                for (const [fieldName, images] of Object.entries(req.processedImages)) {
                    newImages[fieldName] = images[0]?.responsiveImages || [];
                }
                updates.gallery = { ...project.gallery, ...newImages };
            }

            // Update project
            await project.update(updates);

            // Update SEO metadata if project is published
            if (updates.status === 'published' || project.status === 'published') {
                const seoData = await SEOMetadata.findOne({
                    where: { page_path: `projects/${project.slug}` }
                });

                const seoUpdates = {
                    page_path: `projects/${project.slug}`,
                    title: `${project.title} - Project Showcase | ${process.env.SITE_NAME || 'GS Infotech'}`,
                    description: updates.metaDescription ||
                        (seoEnhancer?.generateMetaDescription ? seoEnhancer.generateMetaDescription(project.description) : project.description?.substring(0, 160)),
                    keywords: updates.metaKeywords ?
                        updates.metaKeywords.split(', ') :
                        (seoEnhancer?.extractKeywords ? seoEnhancer.extractKeywords(project.content || project.description) : []),
                    canonical_url: `${process.env.SITE_URL || 'https://gsinfotech.com'}/projects/${project.slug}`
                };

                if (seoData) {
                    await seoData.update(seoUpdates);
                } else {
                    await SEOMetadata.create(seoUpdates);
                }
            }

            // Invalidate caches
            if (cacheManager?.isConnected) {
                await cacheManager.invalidateByTags(['projects']);
            }

            logger.api('Project updated successfully', {
                projectId: project.id,
                updatedFields: Object.keys(updates)
            });

            res.json({
                message: 'Project updated successfully',
                project
            });

        } catch (error) {
            logger.error('Error updating project:', error);
            res.status(500).json({
                error: 'Failed to update project',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Delete project
    static async deleteProject(req, res) {
        try {
            const { id } = req.params;

            const project = await Project.findByPk(id);
            if (!project) {
                return res.status(404).json({
                    error: 'Project not found',
                    message: `No project found with ID: ${id}`
                });
            }

            // Delete associated SEO metadata
            await SEOMetadata.destroy({
                where: { page_path: `projects/${project.slug}` }
            });

            // Delete project
            await project.destroy();

            // Invalidate caches
            if (cacheManager?.isConnected) {
                await cacheManager.invalidateByTags(['projects']);
            }

            logger.api('Project deleted successfully', {
                projectId: id,
                title: project.title
            });

            res.json({
                message: 'Project deleted successfully',
                deletedProject: {
                    id: project.id,
                    title: project.title,
                    slug: project.slug
                }
            });

        } catch (error) {
            logger.error('Error deleting project:', error);
            res.status(500).json({
                error: 'Failed to delete project',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get project statistics
    static async getProjectStats(req, res) {
        try {
            const stats = await Project.findAll({
                attributes: [
                    'status',
                    [Project.sequelize.fn('COUNT', '*'), 'count']
                ],
                group: ['status']
            });

            const totalProjects = await Project.count();
            const totalViews = await Project.sum('view_count');
            const featuredProjects = await Project.count({ where: { featured: true } });

            const technologies = await Project.findAll({
                attributes: ['technologies'],
                where: { status: 'published' }
            });

            // Process technologies
            const techCount = {};
            technologies.forEach(project => {
                if (project.technologies && Array.isArray(project.technologies)) {
                    project.technologies.forEach(tech => {
                        techCount[tech] = (techCount[tech] || 0) + 1;
                    });
                }
            });

            const topTechnologies = Object.entries(techCount)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([tech, count]) => ({ technology: tech, count }));

            const response = {
                totalProjects,
                totalViews: totalViews || 0,
                featuredProjects,
                statusBreakdown: stats.reduce((acc, stat) => {
                    acc[stat.status] = parseInt(stat.get('count'));
                    return acc;
                }, {}),
                topTechnologies
            };

            logger.api('Project statistics retrieved', {
                totalProjects,
                featuredProjects
            });

            res.json(response);

        } catch (error) {
            logger.error('Error fetching project statistics:', error);
            res.status(500).json({
                error: 'Failed to fetch project statistics',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
}

module.exports = ProjectController;