// client/src/services/blogAPI.js
import { apiClient, uploadFile } from './api.js';

export const blogAPI = {
    // Simple CRUD operations
    getAll: () => apiClient.get('/blog'),
    create: (data) => apiClient.post('/blog', data),
    update: (id, data) => apiClient.put(`/blog/${id}`, data),
    delete: (id) => apiClient.delete(`/blog/${id}`),

    // Get all blog posts with optional filters
    getAllPosts: async (params = {}) => {
        const response = await apiClient.get('/blog', { params });
        return response.data;
    },

    // Get blog statistics
    getBlogStats: async () => {
        const response = await apiClient.get('/blog/stats');
        return response.data;
    },

    // Get blog post by ID or slug
    getPostById: async (id) => {
        const response = await apiClient.get(`/blog/${id}`);
        return response.data;
    },

    // Get blog post by slug
    getPostBySlug: async (slug) => {
        const response = await apiClient.get(`/blog/slug/${slug}`);
        return response.data;
    },

    // Get featured posts for homepage
    getFeaturedPosts: async (limit = 3) => {
        const response = await apiClient.get('/blog', {
            params: { featured: true, limit }
        });
        return response.data;
    },

    // Get latest posts
    getLatestPosts: async (limit = 6) => {
        const response = await apiClient.get('/blog', {
            params: { sort: 'latest', limit }
        });
        return response.data;
    },

    // Get posts by category
    getPostsByCategory: async (category, params = {}) => {
        const response = await apiClient.get('/blog', {
            params: { category, ...params }
        });
        return response.data;
    },

    // Get posts by tag
    getPostsByTag: async (tag, params = {}) => {
        const response = await apiClient.get('/blog', {
            params: { tag, ...params }
        });
        return response.data;
    },

    // Get related posts
    getRelatedPosts: async (postId, limit = 3) => {
        const response = await apiClient.get(`/blog/${postId}/related`, {
            params: { limit }
        });
        return response.data;
    },

    // Admin: Create new blog post with featured image
    createPost: async (postData, featuredImage = null, additionalImages = []) => {
        if (featuredImage || additionalImages.length > 0) {
            const formData = new FormData();

            // Add post data
            Object.keys(postData).forEach(key => {
                if (postData[key] !== null && postData[key] !== undefined) {
                    formData.append(key, postData[key]);
                }
            });

            // Add featured image
            if (featuredImage) {
                formData.append('featuredImage', featuredImage);
            }

            // Add additional images
            additionalImages.forEach((image, index) => {
                formData.append('images', image);
            });

            const response = await apiClient.post('/blog', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } else {
            const response = await apiClient.post('/blog', postData);
            return response.data;
        }
    },

    // Admin: Update blog post
    updatePost: async (id, postData, featuredImage = null, additionalImages = []) => {
        if (featuredImage || additionalImages.length > 0) {
            const formData = new FormData();

            Object.keys(postData).forEach(key => {
                if (postData[key] !== null && postData[key] !== undefined) {
                    formData.append(key, postData[key]);
                }
            });

            if (featuredImage) {
                formData.append('featuredImage', featuredImage);
            }

            additionalImages.forEach((image, index) => {
                formData.append('images', image);
            });

            const response = await apiClient.put(`/blog/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } else {
            const response = await apiClient.put(`/blog/${id}`, postData);
            return response.data;
        }
    },

    // Admin: Delete blog post
    deletePost: async (id) => {
        const response = await apiClient.delete(`/blog/${id}`);
        return response.data;
    },

    // Upload blog images (for rich text editor)
    uploadBlogImages: async (images, onProgress) => {
        const formData = new FormData();
        images.forEach((image, index) => {
            formData.append('images', image);
        });

        return uploadFile(images[0], '/blog/upload-images', onProgress);
    },

    // Search blog posts
    searchPosts: async (query, filters = {}) => {
        const response = await apiClient.get('/blog', {
            params: { search: query, ...filters }
        });
        return response.data;
    },

    // Get blog posts with pagination
    getPostsPaginated: async (page = 1, limit = 10, filters = {}) => {
        const response = await apiClient.get('/blog', {
            params: { page, limit, ...filters }
        });
        return response.data;
    },

    // Get blog categories
    getCategories: async () => {
        try {
            const response = await apiClient.get('/blog/categories');
            return response.data;
        } catch (error) {
            // If categories endpoint doesn't exist, return default categories
            console.warn('Blog categories endpoint not available, using defaults');
            return [
                { id: 'development', name: 'Development', slug: 'development', count: 0 },
                { id: 'design', name: 'Design', slug: 'design', count: 0 },
                { id: 'technology', name: 'Technology', slug: 'technology', count: 0 },
                { id: 'business', name: 'Business', slug: 'business', count: 0 }
            ];
        }
    },

    // Get blog tags
    getTags: async () => {
        const response = await apiClient.get('/blog/tags');
        return response.data;
    },

    // Get blog archives (by month/year)
    getArchives: async () => {
        const response = await apiClient.get('/blog/archives');
        return response.data;
    },

    // Admin: Publish/unpublish post
    togglePostStatus: async (id, status) => {
        const response = await apiClient.patch(`/blog/${id}/status`, { status });
        return response.data;
    },

    // Admin: Bulk update posts
    bulkUpdatePosts: async (updates) => {
        const response = await apiClient.patch('/blog/bulk', { updates });
        return response.data;
    },

    // Admin: Bulk delete posts
    bulkDeletePosts: async (ids) => {
        const response = await apiClient.delete('/blog/bulk', {
            data: { ids }
        });
        return response.data;
    },

    // Admin: Schedule post publication
    schedulePost: async (id, publishDate) => {
        const response = await apiClient.patch(`/blog/${id}/schedule`, {
            publishDate
        });
        return response.data;
    },

    // Admin: Auto-save draft
    autoSaveDraft: async (postData) => {
        const response = await apiClient.post('/blog/auto-save', postData);
        return response.data;
    },

    // Admin: Get post drafts
    getDrafts: async () => {
        const response = await apiClient.get('/blog', {
            params: { status: 'draft' }
        });
        return response.data;
    },
};