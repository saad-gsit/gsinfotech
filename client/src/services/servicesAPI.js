// client/src/services/servicesAPI.js - Updated
import { apiClient } from './api.js'

export const servicesAPI = {
    // Get all services (updated method name)
    getAllServices: async (params = {}) => {
        const response = await apiClient.get('/services', { params })
        return response.data
    },

    // Get single service by ID (updated method name)
    getServiceById: async (id) => {
        const response = await apiClient.get(`/services/${id}`)
        return response.data
    },

    // Get featured services for homepage
    getFeaturedServices: async (limit = 4) => {
        const response = await apiClient.get('/services', {
            params: { featured: true, limit }
        })
        return response.data
    },

    // Get service statistics
    getServiceStats: async () => {
        const response = await apiClient.get('/services/stats')
        return response.data
    },

    // Admin: Create new service
    createService: async (serviceData) => {
        const response = await apiClient.post('/services', serviceData)
        return response.data
    },

    // Admin: Update service
    updateService: async (id, serviceData) => {
        const response = await apiClient.put(`/services/${id}`, serviceData)
        return response.data
    },

    // Admin: Delete service
    deleteService: async (id) => {
        const response = await apiClient.delete(`/services/${id}`)
        return response.data
    },

    // Search services
    searchServices: async (query, filters = {}) => {
        const response = await apiClient.get('/services', {
            params: { search: query, ...filters }
        })
        return response.data
    },

    // Get services by category
    getServicesByCategory: async (category, params = {}) => {
        const response = await apiClient.get('/services', {
            params: { category, ...params }
        })
        return response.data
    },

    // Admin: Bulk operations
    bulkUpdateServices: async (updates) => {
        const response = await apiClient.patch('/services/bulk', { updates })
        return response.data
    },

    bulkDeleteServices: async (ids) => {
        const response = await apiClient.delete('/services/bulk', {
            data: { ids }
        })
        return response.data
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
}