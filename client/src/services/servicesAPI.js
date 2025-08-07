// client/src/services/servicesAPI.js - Enhanced with debugging
import { apiClient } from './api.js'

export const servicesAPI = {
    // Test database connection
    testDatabaseConnection: async () => {
        try {
            console.log('🔍 Testing database connection...');
            const response = await apiClient.get('/services/test-db')
            console.log('✅ Database test result:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Database test failed:', error);
            throw new Error(error.response?.data?.message || 'Database connection test failed');
        }
    },

    // Get all services with enhanced error handling and logging
    getAllServices: async (params = {}) => {
        try {
            console.log('📊 Fetching all services with params:', params);
            const response = await apiClient.get('/services', { params })

            console.log('✅ Raw API response:', response.data);

            // Handle different response structures from your backend
            if (response.data?.success) {
                console.log('✅ Services fetched successfully:', response.data.data.length, 'services');
                return {
                    data: response.data.data || [],
                    pagination: response.data.pagination,
                    success: true
                }
            }

            // Fallback for direct data response
            console.log('⚠️ Using fallback response structure');
            return {
                data: Array.isArray(response.data) ? response.data : [],
                success: true
            }
        } catch (error) {
            console.error('❌ getAllServices error:', error)
            console.error('❌ Error response:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Failed to fetch services')
        }
    },

    // Get single service by ID with enhanced error handling
    getServiceById: async (id) => {
        try {
            console.log(`🔍 Fetching service by ID/slug: ${id}`);
            const response = await apiClient.get(`/services/${id}`)

            console.log('✅ Service fetched:', response.data);

            if (response.data?.success) {
                return {
                    data: response.data.data,
                    service: response.data.data, // For backward compatibility
                    success: true
                }
            }

            return {
                data: response.data,
                service: response.data,
                success: true
            }
        } catch (error) {
            console.error('❌ getServiceById error:', error)
            if (error.response?.status === 404) {
                throw new Error('Service not found')
            }
            throw new Error(error.response?.data?.message || 'Failed to fetch service')
        }
    },

    // Get featured services for homepage
    getFeaturedServices: async (limit = 4) => {
        try {
            console.log(`⭐ Fetching featured services, limit: ${limit}`);
            const response = await apiClient.get('/services/featured', {
                params: { limit }
            })

            console.log('✅ Featured services fetched:', response.data);

            return {
                data: response.data?.data || response.data || [],
                success: true
            }
        } catch (error) {
            console.error('❌ getFeaturedServices error:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch featured services')
        }
    },

    // Get service statistics
    getServiceStats: async () => {
        try {
            console.log('📊 Fetching service statistics...');
            const response = await apiClient.get('/services/stats')
            console.log('✅ Service stats fetched:', response.data);
            return {
                data: response.data?.data || response.data,
                success: true
            }
        } catch (error) {
            console.error('❌ getServiceStats error:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch service statistics')
        }
    },

    // Admin: Create new service with FormData support
    createService: async (serviceData) => {
        try {
            console.log('➕ Creating new service...');
            console.log('📄 Service data:', serviceData instanceof FormData ? 'FormData' : serviceData);

            const config = {
                headers: {
                    'Content-Type': serviceData instanceof FormData ? 'multipart/form-data' : 'application/json'
                }
            }

            const response = await apiClient.post('/services', serviceData, config)
            console.log('✅ Service created successfully:', response.data);

            return {
                data: response.data?.data || response.data,
                service: response.data?.data || response.data, // For backward compatibility
                success: true
            }
        } catch (error) {
            console.error('❌ createService error:', error)
            console.error('❌ Error details:', error.response?.data);

            // Handle validation errors
            if (error.response?.status === 400 && error.response.data?.errors) {
                const validationErrors = error.response.data.errors
                    .map(err => `${err.field}: ${err.message}`)
                    .join(', ')
                throw new Error(`Validation error: ${validationErrors}`)
            }

            throw new Error(error.response?.data?.message || 'Failed to create service')
        }
    },

    // Admin: Update service with FormData support
    updateService: async (id, serviceData) => {
        try {
            console.log(`✏️ Updating service ID: ${id}`);
            console.log('📄 Update data:', serviceData instanceof FormData ? 'FormData' : serviceData);

            const config = {
                headers: {
                    'Content-Type': serviceData instanceof FormData ? 'multipart/form-data' : 'application/json'
                }
            }

            const response = await apiClient.put(`/services/${id}`, serviceData, config)
            console.log('✅ Service updated successfully:', response.data);

            return {
                data: response.data?.data || response.data,
                service: response.data?.data || response.data,
                success: true
            }
        } catch (error) {
            console.error('❌ updateService error:', error)

            if (error.response?.status === 404) {
                throw new Error('Service not found')
            }

            if (error.response?.status === 400 && error.response.data?.errors) {
                const validationErrors = error.response.data.errors
                    .map(err => `${err.field}: ${err.message}`)
                    .join(', ')
                throw new Error(`Validation error: ${validationErrors}`)
            }

            throw new Error(error.response?.data?.message || 'Failed to update service')
        }
    },

    // Admin: Delete service
    deleteService: async (id) => {
        try {
            console.log(`🗑️ Deleting service ID: ${id}`);
            const response = await apiClient.delete(`/services/${id}`)
            console.log('✅ Service deleted successfully');
            return {
                success: true,
                message: response.data?.message || 'Service deleted successfully'
            }
        } catch (error) {
            console.error('❌ deleteService error:', error)

            if (error.response?.status === 404) {
                throw new Error('Service not found')
            }

            throw new Error(error.response?.data?.message || 'Failed to delete service')
        }
    },

    // Search services
    searchServices: async (query, filters = {}) => {
        try {
            console.log(`🔍 Searching services: "${query}"`, filters);
            const response = await apiClient.get('/services', {
                params: { search: query, ...filters }
            })

            return {
                data: response.data?.data || response.data || [],
                success: true
            }
        } catch (error) {
            console.error('❌ searchServices error:', error)
            throw new Error(error.response?.data?.message || 'Failed to search services')
        }
    },

    // Get services by category
    getServicesByCategory: async (category, params = {}) => {
        try {
            console.log(`🏷️ Fetching services by category: ${category}`, params);
            const response = await apiClient.get(`/services/category/${category}`, { params })

            return {
                data: response.data?.data || response.data || [],
                category: response.data?.category || category,
                count: response.data?.count || 0,
                success: true
            }
        } catch (error) {
            console.error('❌ getServicesByCategory error:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch services by category')
        }
    },

    // Admin: Bulk operations
    bulkUpdateServices: async (updates) => {
        try {
            console.log(`📝 Bulk updating ${updates.length} services`);
            const response = await apiClient.patch('/services/bulk', { updates })

            return {
                data: response.data?.results || response.data,
                successful: response.data?.results?.successful || 0,
                failed: response.data?.results?.failed || 0,
                success: true
            }
        } catch (error) {
            console.error('❌ bulkUpdateServices error:', error)
            throw new Error(error.response?.data?.message || 'Failed to bulk update services')
        }
    },

    bulkDeleteServices: async (ids) => {
        try {
            console.log(`🗑️ Bulk deleting ${ids.length} services`);
            const response = await apiClient.delete('/services/bulk', {
                data: { ids }
            })

            return {
                deletedCount: response.data?.deletedCount || ids.length,
                success: true,
                message: response.data?.message || `${ids.length} service(s) deleted successfully`
            }
        } catch (error) {
            console.error('❌ bulkDeleteServices error:', error)
            throw new Error(error.response?.data?.message || 'Failed to bulk delete services')
        }
    },

    // Legacy methods for backward compatibility (if needed)
    getAll: async () => {
        return servicesAPI.getAllServices()
    },

    getById: async (id) => {
        return servicesAPI.getServiceById(id)
    },

    create: async (serviceData) => {
        return servicesAPI.createService(serviceData)
    },

    update: async (id, serviceData) => {
        return servicesAPI.updateService(id, serviceData)
    },

    delete: async (id) => {
        return servicesAPI.deleteService(id)
    },
};