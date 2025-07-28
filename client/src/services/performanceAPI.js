import api from './api'

export const performanceAPI = {
    // Get performance metrics
    getMetrics: async () => {
        const response = await api.get('/performance')
        return response.data
    },

    // Get performance report
    getReport: async (hours = 24) => {
        const response = await api.get(`/performance/report?hours=${hours}`)
        return response.data
    },

    // Send performance data
    sendMetrics: async (metrics) => {
        const response = await api.post('/performance/metrics', metrics)
        return response.data
    },

    // Get Core Web Vitals
    getCoreWebVitals: async () => {
        const response = await api.get('/performance/core-web-vitals')
        return response.data
    },
}