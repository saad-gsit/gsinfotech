// client/src/services/companyAPI.js - Updated
import { apiClient } from './api.js'

export const companyAPI = {
    // Get company information
    getCompanyInfo: async () => {
        const response = await apiClient.get('/company')
        return response.data
    },

    // Get company statistics
    getCompanyStats: async () => {
        const response = await apiClient.get('/company/stats')
        return response.data
    },

    // Admin: Update company information
    updateCompanyInfo: async (companyData) => {
        const response = await apiClient.put('/company', companyData)
        return response.data
    },

    // Legacy methods for backward compatibility
    getInfo: async () => {
        return companyAPI.getCompanyInfo()
    },

    updateInfo: async (companyData) => {
        return companyAPI.updateCompanyInfo(companyData)
    },

    getStats: async () => {
        return companyAPI.getCompanyStats()
    },
}