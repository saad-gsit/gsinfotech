import api from './api'

export const seoAPI = {
    // Get SEO data for a page
    getPageSEO: async (path) => {
        const response = await api.get(`/seo?path=${path}`)
        return response.data
    },

    // Update SEO data for a page (admin)
    updatePageSEO: async (path, seoData) => {
        const response = await api.put(`/seo`, { path, ...seoData })
        return response.data
    },

    // Generate sitemap
    generateSitemap: async (type = 'xml') => {
        const response = await api.post(`/seo/generate-sitemap?type=${type}`)
        return response.data
    },

    // Get SEO analysis
    analyzePage: async (url) => {
        const response = await api.post('/seo/analyze', { url })
        return response.data
    },
}