import api from './api'

export const analyticsAPI = {
    // Get dashboard analytics
    getDashboard: async (timeRange = '7d') => {
        const response = await api.get(`/analytics/dashboard?range=${timeRange}`)
        return response.data
    },

    // Track custom event
    trackEvent: async (eventName, properties = {}) => {
        const response = await api.post('/analytics/track', {
            event: eventName,
            properties,
            timestamp: Date.now()
        })
        return response.data
    },

    // Get page views
    getPageViews: async (timeRange = '7d') => {
        const response = await api.get(`/analytics/pageviews?range=${timeRange}`)
        return response.data
    },

    // Get user analytics
    getUserAnalytics: async (timeRange = '7d') => {
        const response = await api.get(`/analytics/users?range=${timeRange}`)
        return response.data
    },

    // Get conversion analytics
    getConversions: async (timeRange = '7d') => {
        const response = await api.get(`/analytics/conversions?range=${timeRange}`)
        return response.data
    },
}