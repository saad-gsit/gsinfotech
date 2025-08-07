// server/controllers/serviceController.js - FIXED VERSION
const { Service } = require('../models');
const { Op } = require('sequelize');

// Utility function to generate slug
const slugify = (text) => {
    if (!text || typeof text !== 'string') {
        return '';
    }

    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

// Get all services with filters, search, and pagination
const getAllServices = async (req, res) => {
    try {
        console.log('📊 Getting all services from database...');

        const {
            page = 1,
            limit = 10,
            search,
            category,
            featured,
            active,
            sort = 'display_order',
            order = 'ASC'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const whereClause = {};

        // Search functionality
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { short_description: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Category filter
        if (category && category !== 'all') {
            whereClause.category = category;
        }

        // Featured filter
        if (featured === 'true') {
            whereClause.is_featured = true;
        }

        // Active filter (default to true if not specified)
        if (active !== undefined) {
            whereClause.is_active = active === 'true';
        } else {
            // Default to active services only
            whereClause.is_active = true;
        }

        console.log('🔍 Query filters:', whereClause);

        // Get services with pagination
        const { count, rows: services } = await Service.findAndCountAll({
            where: whereClause,
            order: [[sort, order.toUpperCase()]],
            limit: parseInt(limit),
            offset: offset,
            attributes: {
                exclude: ['created_at', 'updated_at']
            }
        });

        console.log(`✅ Found ${count} services in database`);

        // Calculate pagination info
        const totalPages = Math.ceil(count / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPrevPage = parseInt(page) > 1;

        res.json({
            success: true,
            data: services,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: parseInt(limit),
                hasNextPage,
                hasPrevPage
            }
        });

    } catch (error) {
        console.error('❌ Get services error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching services',
            error: error.message
        });
    }
};

// Get single service by ID or slug
const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Getting service by ID/slug: ${id}`);

        // Check if id is numeric (ID) or string (slug)
        const whereClause = isNaN(id)
            ? { slug: id }
            : { id: parseInt(id) };

        const service = await Service.findOne({
            where: whereClause
        });

        if (!service) {
            console.log(`❌ Service not found: ${id}`);
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        console.log(`✅ Service found: ${service.name}`);

        res.json({
            success: true,
            data: service
        });

    } catch (error) {
        console.error('❌ Get service error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching service',
            error: error.message
        });
    }
};

// Get service statistics for admin dashboard
const getServiceStats = async (req, res) => {
    try {
        console.log('📊 Service stats requested');

        // Get actual counts from database
        const total = await Service.count();
        const active = await Service.count({ where: { is_active: true } });
        const inactive = await Service.count({ where: { is_active: false } });
        const featured = await Service.count({ where: { is_featured: true } });

        // Get services by category
        const servicesByCategory = await Service.findAll({
            attributes: ['category', [Service.sequelize.fn('COUNT', Service.sequelize.col('id')), 'count']],
            group: ['category'],
            raw: true
        });

        const categories = new Set(servicesByCategory.map(s => s.category)).size;

        const stats = {
            total,
            active,
            inactive,
            featured,
            categories,
            servicesByCategory
        };

        console.log('✅ Service stats:', stats);

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('❌ Get service stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching service statistics',
            error: error.message
        });
    }
};

// Create new service (Admin only)
const createService = async (req, res) => {
    try {
        console.log('➕ Creating new service...');
        const serviceData = req.body;

        // Generate slug if not provided
        if (!serviceData.slug && serviceData.name) {
            serviceData.slug = slugify(serviceData.name);
        }

        // Handle file upload if featured_image is provided
        if (req.file) {
            serviceData.featured_image = `/uploads/services/${req.file.filename}`;
            console.log('📁 Image uploaded:', serviceData.featured_image);
        }

        // Ensure arrays are properly formatted
        if (typeof serviceData.features === 'string') {
            serviceData.features = JSON.parse(serviceData.features);
        }
        if (typeof serviceData.technologies === 'string') {
            serviceData.technologies = JSON.parse(serviceData.technologies);
        }
        if (typeof serviceData.process_steps === 'string') {
            serviceData.process_steps = JSON.parse(serviceData.process_steps);
        }
        if (typeof serviceData.seo_keywords === 'string') {
            serviceData.seo_keywords = JSON.parse(serviceData.seo_keywords);
        }

        console.log('💾 Service data to create:', serviceData);

        const service = await Service.create(serviceData);

        console.log('✅ Service created successfully:', service.name);

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: service
        });

    } catch (error) {
        console.error('❌ Create service error:', error);

        // Handle validation errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        // Handle unique constraint errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                success: false,
                message: 'Service with this slug already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating service',
            error: error.message
        });
    }
};

// Update service (Admin only)
const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        console.log(`✏️ Updating service ID: ${id}`);

        const service = await Service.findByPk(id);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Handle file upload if new featured_image is provided
        if (req.file) {
            updateData.featured_image = `/uploads/services/${req.file.filename}`;
            console.log('📁 New image uploaded:', updateData.featured_image);
        }

        // Update slug if name changed
        if (updateData.name && updateData.name !== service.name) {
            updateData.slug = slugify(updateData.name);
        }

        // Ensure arrays are properly formatted
        if (typeof updateData.features === 'string') {
            updateData.features = JSON.parse(updateData.features);
        }
        if (typeof updateData.technologies === 'string') {
            updateData.technologies = JSON.parse(updateData.technologies);
        }
        if (typeof updateData.process_steps === 'string') {
            updateData.process_steps = JSON.parse(updateData.process_steps);
        }
        if (typeof updateData.seo_keywords === 'string') {
            updateData.seo_keywords = JSON.parse(updateData.seo_keywords);
        }

        await service.update(updateData);

        console.log('✅ Service updated successfully:', service.name);

        res.json({
            success: true,
            message: 'Service updated successfully',
            data: service
        });

    } catch (error) {
        console.error('❌ Update service error:', error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating service',
            error: error.message
        });
    }
};

// Delete service (Admin only)
const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️ Deleting service ID: ${id}`);

        const service = await Service.findByPk(id);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        await service.destroy();

        console.log('✅ Service deleted successfully');

        res.json({
            success: true,
            message: 'Service deleted successfully'
        });

    } catch (error) {
        console.error('❌ Delete service error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting service',
            error: error.message
        });
    }
};

// Bulk update services (Admin only)
const bulkUpdateServices = async (req, res) => {
    try {
        const { updates } = req.body;
        console.log(`📝 Bulk updating ${updates.length} services`);

        if (!updates || !Array.isArray(updates)) {
            return res.status(400).json({
                success: false,
                message: 'Updates array is required'
            });
        }

        const results = await Promise.allSettled(
            updates.map(async (update) => {
                const service = await Service.findByPk(update.id);
                if (service) {
                    return await service.update(update.data);
                }
                throw new Error(`Service with ID ${update.id} not found`);
            })
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        console.log(`✅ Bulk update completed: ${successful} successful, ${failed} failed`);

        res.json({
            success: true,
            message: `Bulk update completed: ${successful} successful, ${failed} failed`,
            results: {
                successful,
                failed,
                details: results
            }
        });

    } catch (error) {
        console.error('❌ Bulk update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing bulk update',
            error: error.message
        });
    }
};

// Bulk delete services (Admin only)
const bulkDeleteServices = async (req, res) => {
    try {
        const { ids } = req.body;
        console.log(`🗑️ Bulk deleting services:`, ids);

        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({
                success: false,
                message: 'Service IDs array is required'
            });
        }

        const deletedCount = await Service.destroy({
            where: {
                id: {
                    [Op.in]: ids
                }
            }
        });

        console.log(`✅ ${deletedCount} services deleted successfully`);

        res.json({
            success: true,
            message: `${deletedCount} service(s) deleted successfully`,
            deletedCount
        });

    } catch (error) {
        console.error('❌ Bulk delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing bulk delete',
            error: error.message
        });
    }
};

// Get services by category
const getServicesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { active = true } = req.query;
        console.log(`🏷️ Getting services by category: ${category}`);

        const whereClause = { category };
        if (active !== 'false') {
            whereClause.is_active = true;
        }

        const services = await Service.findAll({
            where: whereClause,
            order: [['display_order', 'ASC'], ['created_at', 'DESC']]
        });

        console.log(`✅ Found ${services.length} services in category: ${category}`);

        res.json({
            success: true,
            data: services,
            category,
            count: services.length
        });

    } catch (error) {
        console.error('❌ Get services by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching services by category',
            error: error.message
        });
    }
};

// Get featured services for homepage
const getFeaturedServices = async (req, res) => {
    try {
        const { limit = 4 } = req.query;
        console.log('⭐ Getting featured services, limit:', limit);

        const services = await Service.findAll({
            where: {
                is_featured: true,
                is_active: true
            },
            order: [['display_order', 'ASC'], ['created_at', 'DESC']],
            limit: parseInt(limit)
        });

        console.log(`✅ Found ${services.length} featured services`);

        res.json({
            success: true,
            data: services,
            count: services.length
        });

    } catch (error) {
        console.error('❌ Get featured services error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured services',
            error: error.message
        });
    }
};

// Test database connection (useful for debugging)
const testDatabaseConnection = async (req, res) => {
    try {
        console.log('🔍 Testing database connection...');

        // Test basic connection
        await Service.sequelize.authenticate();

        // Test service table specifically
        const serviceCount = await Service.count();

        console.log(`✅ Database connected successfully. Services count: ${serviceCount}`);

        res.json({
            success: true,
            message: 'Database connection successful',
            serviceCount
        });
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
};

// Export all functions
module.exports = {
    getAllServices,
    getServiceById,
    getServiceStats,
    createService,
    updateService,
    deleteService,
    bulkUpdateServices,
    bulkDeleteServices,
    getServicesByCategory,
    getFeaturedServices,
    testDatabaseConnection
};