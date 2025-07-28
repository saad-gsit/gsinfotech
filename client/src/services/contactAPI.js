// client/src/services/contactAPI.js
import { apiClient } from './api.js';

export const contactAPI = {
    // Simple CRUD operations
    getAll: () => apiClient.get('/contact'),
    updateStatus: (id, status) => apiClient.patch(`/contact/${id}/status`, { status }),
    delete: (id) => apiClient.delete(`/contact/${id}`),

    // Submit contact form (public route)
    submitContactForm: async (contactData) => {
        const response = await apiClient.post('/contact', contactData);
        return response.data;
    },

    // Subscribe to newsletter (public route)
    subscribeNewsletter: async (email) => {
        const response = await apiClient.post('/contact/newsletter', { email });
        return response.data;
    },

    // Admin: Get all contact submissions
    getAllSubmissions: async (params = {}) => {
        const response = await apiClient.get('/contact', { params });
        return response.data;
    },

    // Admin: Get contact statistics
    getContactStats: async () => {
        const response = await apiClient.get('/contact/stats');
        return response.data;
    },

    // Admin: Get newsletter subscribers
    getNewsletterSubscribers: async (params = {}) => {
        const response = await apiClient.get('/contact/newsletter', { params });
        return response.data;
    },

    // Admin: Get contact submission by ID
    getSubmissionById: async (id) => {
        const response = await apiClient.get(`/contact/${id}`);
        return response.data;
    },

    // Admin: Update submission status
    updateSubmissionStatus: async (id, status, notes = '') => {
        const response = await apiClient.put(`/contact/${id}/status`, {
            status,
            notes
        });
        return response.data;
    },

    // Admin: Delete contact submission
    deleteSubmission: async (id) => {
        const response = await apiClient.delete(`/contact/${id}`);
        return response.data;
    },

    // Admin: Get submissions by status
    getSubmissionsByStatus: async (status, params = {}) => {
        const response = await apiClient.get('/contact', {
            params: { status, ...params }
        });
        return response.data;
    },

    // Admin: Get submissions by service type
    getSubmissionsByService: async (service, params = {}) => {
        const response = await apiClient.get('/contact', {
            params: { service, ...params }
        });
        return response.data;
    },

    // Admin: Search contact submissions
    searchSubmissions: async (query, filters = {}) => {
        const response = await apiClient.get('/contact', {
            params: { search: query, ...filters }
        });
        return response.data;
    },

    // Admin: Export contact submissions
    exportSubmissions: async (format = 'csv', filters = {}) => {
        const response = await apiClient.get('/contact/export', {
            params: { format, ...filters },
            responseType: 'blob'
        });
        return response.data;
    },

    // Admin: Bulk update submissions
    bulkUpdateSubmissions: async (updates) => {
        const response = await apiClient.patch('/contact/bulk', { updates });
        return response.data;
    },

    // Admin: Bulk delete submissions
    bulkDeleteSubmissions: async (ids) => {
        const response = await apiClient.delete('/contact/bulk', {
            data: { ids }
        });
        return response.data;
    },

    // Admin: Mark as spam
    markAsSpam: async (id) => {
        const response = await apiClient.patch(`/contact/${id}/spam`);
        return response.data;
    },

    // Admin: Add response/notes to submission
    addResponse: async (id, responseData) => {
        const response = await apiClient.post(`/contact/${id}/response`, responseData);
        return response.data;
    },

    // Admin: Get response history for submission
    getResponseHistory: async (id) => {
        const response = await apiClient.get(`/contact/${id}/responses`);
        return response.data;
    },

    // Get contact form statistics for analytics
    getFormAnalytics: async (dateRange = {}) => {
        const response = await apiClient.get('/contact/analytics', {
            params: dateRange
        });
        return response.data;
    },
};