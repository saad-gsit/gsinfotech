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
            console.log('Received project data:', req.body);
            console.log('Received files:', req.files);

            // Map form data to database fields
            const formData = req.body;

            // Handle JSON fields that might come as strings
            const parseJsonField = (field) => {
                if (!field) return null;
                if (typeof field === 'string') {
                    try {
                        return JSON.parse(field);
                    } catch (e) {
                        console.log(`Failed to parse ${field} as JSON:`, e.message);
                        return null;
                    }
                }
                return field;
            };

            // Prepare project data with proper field mapping
            const projectData = {
                // Basic fields
                title: formData.title,
                description: formData.description,
                short_description: formData.shortDescription || null,

                // NEW: Structured content fields
                overview: formData.overview || null,
                key_features: parseJsonField(formData.keyFeatures) || [],
                technical_implementation: formData.technicalImplementation || null,

                // Technical details
                category: formData.category,
                status: formData.status || 'draft',
                featured: formData.featured === 'true' || formData.featured === true || false,
                technologies: parseJsonField(formData.technologies) || [],

                // URLs and client info
                project_url: formData.projectUrl || null,
                github_url: formData.githubUrl || null,
                client_name: formData.client || null,

                // Dates
                start_date: formData.startDate || null,
                completion_date: formData.endDate || null,

                // SEO fields
                seo_title: formData.seoTitle || null,
                seo_description: formData.seoDescription || null,
                seo_keywords: parseJsonField(formData.seoKeywords) || []
            };

            // Clean up empty arrays and null values
            Object.keys(projectData).forEach(key => {
                if (projectData[key] === '' || projectData[key] === 'null' || projectData[key] === 'undefined') {
                    projectData[key] = null;
                }
            });

            // Ensure arrays are properly formatted
            if (!Array.isArray(projectData.technologies)) {
                projectData.technologies = [];
            }
            if (!Array.isArray(projectData.key_features)) {
                projectData.key_features = [];
            }
            if (!Array.isArray(projectData.seo_keywords)) {
                projectData.seo_keywords = [];
            }

            // Filter out empty key features
            projectData.key_features = projectData.key_features.filter(feature =>
                feature && typeof feature === 'string' && feature.trim() !== ''
            );

            console.log('Processed project data:', projectData);

            // Generate slug from title
            const slug = slugify(projectData.title, { lower: true, strict: true });
            projectData.slug = slug;

            // Check for duplicate slug
            const existingProject = await Project.findOne({ where: { slug } });
            if (existingProject) {
                const uniqueSlug = `${slug}-${Date.now()}`;
                projectData.slug = uniqueSlug;
                console.log(`Slug conflict resolved: ${slug} -> ${uniqueSlug}`);
            }

            // Process uploaded images
            let processedImages = [];
            if (req.files && req.files.length > 0) {
                processedImages = req.files.map(file => ({
                    url: `/uploads/projects/${file.filename}`,
                    name: file.originalname,
                    size: file.size,
                    type: file.mimetype
                }));
                projectData.images = processedImages;

                // Set first image as featured image if none exists
                if (processedImages.length > 0 && !projectData.featured_image) {
                    projectData.featured_image = processedImages[0].url;
                }
            } else {
                projectData.images = [];
            }

            console.log('Final data for database:', projectData);

            // Create project
            const project = await Project.create(projectData);

            console.log('Project created successfully:', project.id);

            // Create SEO metadata for published projects
            if (projectData.status === 'published') {
                try {
                    const { SEOMetadata } = require('../models');
                    await SEOMetadata.create({
                        page_path: `projects/${project.slug}`,
                        title: projectData.seo_title || `${projectData.title} - Project Showcase`,
                        description: projectData.seo_description || projectData.description?.substring(0, 160),
                        keywords: projectData.seo_keywords || [],
                        canonical_url: `${process.env.SITE_URL || 'https://gsinfotech.com'}/projects/${project.slug}`,
                        og_title: projectData.title,
                        og_description: projectData.seo_description || projectData.description?.substring(0, 160),
                        og_type: 'article'
                    });
                    console.log('SEO metadata created for published project');
                } catch (seoError) {
                    console.error('Failed to create SEO metadata:', seoError);
                    // Don't fail the whole request for SEO issues
                }
            }

            // Invalidate cache
            if (cacheManager?.isConnected) {
                await cacheManager.invalidateByTags(['projects']);
            }

            logger.api('Project created successfully', {
                projectId: project.id,
                title: projectData.title,
                slug: project.slug,
                status: projectData.status,
                hasImages: processedImages.length > 0,
                hasOverview: !!projectData.overview,
                featuresCount: projectData.key_features.length,
                hasTechnicalImpl: !!projectData.technical_implementation
            });

            res.status(201).json({
                message: 'Project created successfully',
                project: {
                    id: project.id,
                    title: project.title,
                    slug: project.slug,
                    status: project.status,
                    featured: project.featured,
                    overview: project.overview,
                    key_features: project.key_features,
                    technical_implementation: project.technical_implementation,
                    images: processedImages
                }
            });

        } catch (error) {
            console.error('Error creating project:', error);
            console.error('Error details:', error.message);
            if (error.original) {
                console.error('Database error:', error.original);
            }

            logger.error('Error creating project:', error);

            res.status(500).json({
                error: 'Failed to create project',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
                details: process.env.NODE_ENV === 'development' ? {
                    stack: error.stack,
                    original: error.original?.message
                } : undefined
            });
        }
    }

    // Update project
    static async updateProject(req, res) {
        try {
            const { id } = req.params;
            console.log('Updating project:', id, 'with data:', req.body);

            const project = await Project.findByPk(id);
            if (!project) {
                return res.status(404).json({
                    error: 'Project not found',
                    message: `No project found with ID: ${id}`
                });
            }

            const formData = req.body;

            // Handle JSON fields that might come as strings
            const parseJsonField = (field) => {
                if (!field) return null;
                if (typeof field === 'string') {
                    try {
                        return JSON.parse(field);
                    } catch (e) {
                        console.log(`Failed to parse ${field} as JSON:`, e.message);
                        return null;
                    }
                }
                return field;
            };

            // Prepare update data with proper field mapping
            const updates = {};

            // Only include fields that are actually being updated
            if (formData.title !== undefined) updates.title = formData.title;
            if (formData.description !== undefined) updates.description = formData.description;
            if (formData.shortDescription !== undefined) updates.short_description = formData.shortDescription || null;

            // NEW: Structured content fields
            if (formData.overview !== undefined) updates.overview = formData.overview || null;
            if (formData.keyFeatures !== undefined) {
                const keyFeatures = parseJsonField(formData.keyFeatures) || [];
                updates.key_features = keyFeatures.filter(feature =>
                    feature && typeof feature === 'string' && feature.trim() !== ''
                );
            }
            if (formData.technicalImplementation !== undefined) {
                updates.technical_implementation = formData.technicalImplementation || null;
            }

            // Other fields
            if (formData.category !== undefined) updates.category = formData.category;
            if (formData.status !== undefined) updates.status = formData.status;
            if (formData.featured !== undefined) {
                updates.featured = formData.featured === 'true' || formData.featured === true;
            }
            if (formData.technologies !== undefined) {
                updates.technologies = parseJsonField(formData.technologies) || [];
            }
            if (formData.projectUrl !== undefined) updates.project_url = formData.projectUrl || null;
            if (formData.githubUrl !== undefined) updates.github_url = formData.githubUrl || null;
            if (formData.client !== undefined) updates.client_name = formData.client || null;
            if (formData.startDate !== undefined) updates.start_date = formData.startDate || null;
            if (formData.endDate !== undefined) updates.completion_date = formData.endDate || null;

            // SEO fields
            if (formData.seoTitle !== undefined) updates.seo_title = formData.seoTitle || null;
            if (formData.seoDescription !== undefined) updates.seo_description = formData.seoDescription || null;
            if (formData.seoKeywords !== undefined) updates.seo_keywords = parseJsonField(formData.seoKeywords) || [];

            // Update slug if title changed
            if (updates.title && updates.title !== project.title) {
                const newSlug = slugify(updates.title, { lower: true, strict: true });

                // Check for slug conflicts
                const existingProject = await Project.findOne({
                    where: {
                        slug: newSlug,
                        id: { [Op.ne]: id }
                    }
                });

                if (existingProject) {
                    updates.slug = `${newSlug}-${Date.now()}`;
                } else {
                    updates.slug = newSlug;
                }
            }

            // Process new images if uploaded
            if (req.files && req.files.length > 0) {
                const newImages = req.files.map(file => ({
                    url: `/uploads/projects/${file.filename}`,
                    name: file.originalname,
                    size: file.size,
                    type: file.mimetype
                }));

                // Merge with existing images
                const existingImages = project.images || [];
                updates.images = [...existingImages, ...newImages];

                // Update featured image if not set
                if (!project.featured_image && newImages.length > 0) {
                    updates.featured_image = newImages[0].url;
                }
            }

            console.log('Update data:', updates);

            // Update project
            await project.update(updates);

            // Update SEO metadata if needed
            if (updates.status === 'published' || project.status === 'published') {
                try {
                    const { SEOMetadata } = require('../models');
                    const seoData = await SEOMetadata.findOne({
                        where: { page_path: `projects/${project.slug}` }
                    });

                    const seoUpdates = {
                        page_path: `projects/${project.slug}`,
                        title: updates.seo_title || project.seo_title || `${project.title} - Project Showcase`,
                        description: updates.seo_description || project.seo_description || project.description?.substring(0, 160),
                        keywords: updates.seo_keywords || project.seo_keywords || [],
                        canonical_url: `${process.env.SITE_URL || 'https://gsinfotech.com'}/projects/${project.slug}`
                    };

                    if (seoData) {
                        await seoData.update(seoUpdates);
                    } else {
                        await SEOMetadata.create(seoUpdates);
                    }
                } catch (seoError) {
                    console.error('Failed to update SEO metadata:', seoError);
                }
            }

            // Invalidate cache
            if (cacheManager?.isConnected) {
                await cacheManager.invalidateByTags(['projects']);
            }

            logger.api('Project updated successfully', {
                projectId: project.id,
                updatedFields: Object.keys(updates),
                hasOverview: !!project.overview,
                featuresCount: project.key_features?.length || 0,
                hasTechnicalImpl: !!project.technical_implementation
            });

            res.json({
                message: 'Project updated successfully',
                project: {
                    id: project.id,
                    title: project.title,
                    slug: project.slug,
                    status: project.status,
                    overview: project.overview,
                    key_features: project.key_features,
                    technical_implementation: project.technical_implementation
                }
            });

        } catch (error) {
            console.error('Error updating project:', error);
            console.error('Error details:', error.message);
            if (error.original) {
                console.error('Database error:', error.original);
            }

            logger.error('Error updating project:', error);

            res.status(500).json({
                error: 'Failed to update project',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
                details: process.env.NODE_ENV === 'development' ? {
                    stack: error.stack,
                    original: error.original?.message
                } : undefined
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
            try {
                await SEOMetadata.destroy({
                    where: { page_path: `projects/${project.slug}` }
                });
            } catch (seoError) {
                console.error('Failed to delete SEO metadata:', seoError);
                // Don't fail the whole request for SEO cleanup issues
            }

            // Delete the project
            await project.destroy();

            // Invalidate cache
            if (cacheManager?.isConnected) {
                await cacheManager.invalidateByTags(['projects']);
            }

            logger.api('Project deleted successfully', {
                projectId: project.id,
                title: project.title,
                slug: project.slug
            });

            res.json({
                message: 'Project deleted successfully',
                project: {
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