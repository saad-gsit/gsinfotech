// client/src/services/projectsAPI.js - UPDATED WITH NEW STRUCTURED FIELDS
import { apiClient, handleApiError } from './api.js';

// Cache for frequently accessed data
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function for caching
const getCachedData = (key) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    cache.delete(key);
    return null;
};

const setCachedData = (key, data) => {
    cache.set(key, { data, timestamp: Date.now() });
};

export const projectsAPI = {
    // Get all projects with optional filters and caching
    getAllProjects: async (params = {}, useCache = true) => {
        try {
            const cacheKey = `projects-${JSON.stringify(params)}`;

            if (useCache) {
                const cachedData = getCachedData(cacheKey);
                if (cachedData) return cachedData;
            }

            const response = await apiClient.get('/projects', { params });
            const data = response.data;

            if (useCache) {
                setCachedData(cacheKey, data);
            }

            return data;
        } catch (error) {
            throw handleApiError(error, 'Failed to fetch projects');
        }
    },

    // Get project statistics with caching
    getProjectStats: async (useCache = true) => {
        try {
            const cacheKey = 'project-stats';

            if (useCache) {
                const cachedData = getCachedData(cacheKey);
                if (cachedData) return cachedData;
            }

            const response = await apiClient.get('/projects/stats');
            const data = response.data;

            if (useCache) {
                setCachedData(cacheKey, data);
            }

            return data;
        } catch (error) {
            throw handleApiError(error, 'Failed to fetch project statistics');
        }
    },

    // Get project by ID with caching - FIXED to handle both ID and slug
    getProjectById: async (id, useCache = true) => {
        try {
            if (!id) throw new Error('Project ID is required');

            const cacheKey = `project-${id}`;

            if (useCache) {
                const cachedData = getCachedData(cacheKey);
                if (cachedData) return cachedData;
            }

            // Use the same endpoint for both ID and slug - backend handles this
            const response = await apiClient.get(`/projects/${id}`);
            const data = response.data;

            if (useCache) {
                setCachedData(cacheKey, data);
            }

            return data;
        } catch (error) {
            throw handleApiError(error, `Failed to fetch project with ID: ${id}`);
        }
    },

    // Get featured projects with caching
    getFeaturedProjects: async (limit = 6, useCache = true) => {
        try {
            const params = { featured: true, limit, status: 'published' };
            const cacheKey = `featured-projects-${limit}`;

            if (useCache) {
                const cachedData = getCachedData(cacheKey);
                if (cachedData) return cachedData;
            }

            const response = await apiClient.get('/projects', { params });
            const data = response.data;

            if (useCache) {
                setCachedData(cacheKey, data);
            }

            return data;
        } catch (error) {
            throw handleApiError(error, 'Failed to fetch featured projects');
        }
    },

    // Get projects by category with caching
    getProjectsByCategory: async (category, params = {}, useCache = true) => {
        try {
            if (!category) throw new Error('Category is required');

            const requestParams = { category, ...params };
            const cacheKey = `projects-category-${category}-${JSON.stringify(params)}`;

            if (useCache) {
                const cachedData = getCachedData(cacheKey);
                if (cachedData) return cachedData;
            }

            const response = await apiClient.get('/projects', { params: requestParams });
            const data = response.data;

            if (useCache) {
                setCachedData(cacheKey, data);
            }

            return data;
        } catch (error) {
            throw handleApiError(error, `Failed to fetch projects for category: ${category}`);
        }
    },

    // UPDATED: Create new project with proper field mapping and new structured fields
    createProject: async (projectData, images = [], onProgress = null) => {
        try {
            console.log('Creating project with data:', projectData);

            // Clear relevant cache entries
            cache.clear();

            // Map frontend form fields to backend expected fields with NEW STRUCTURED FIELDS
            const mappedData = {
                // Basic fields
                title: projectData.title,
                description: projectData.description,
                shortDescription: projectData.shortDescription || projectData.short_description,

                // NEW STRUCTURED CONTENT FIELDS
                overview: projectData.overview || null,
                keyFeatures: Array.isArray(projectData.keyFeatures)
                    ? projectData.keyFeatures.filter(f => f && f.trim() !== '')
                    : [],
                technicalImplementation: projectData.technicalImplementation || null,

                // Technical details
                category: projectData.category,
                status: projectData.status || 'draft',
                featured: projectData.featured || false,
                technologies: Array.isArray(projectData.technologies) ? projectData.technologies : [],

                // URLs and client info
                project_url: projectData.projectUrl || projectData.project_url,
                github_url: projectData.githubUrl || projectData.github_url,
                client_name: projectData.client || projectData.client_name,

                // Dates
                start_date: projectData.startDate || null,
                completion_date: projectData.endDate || projectData.completion_date,

                // SEO fields
                seo_title: projectData.seoTitle || projectData.seo_title,
                seo_description: projectData.seoDescription || projectData.seo_description,
                seo_keywords: Array.isArray(projectData.seoKeywords) ? projectData.seoKeywords : []
            };

            // Remove undefined/null values except for arrays
            Object.keys(mappedData).forEach(key => {
                if (mappedData[key] === undefined || mappedData[key] === '' || mappedData[key] === 'null' || mappedData[key] === 'undefined') {
                    if (!Array.isArray(mappedData[key])) {
                        mappedData[key] = null;
                    }
                }
            });

            console.log('Mapped data being sent to backend:', mappedData);

            if (images && images.length > 0) {
                const formData = new FormData();

                // Add project data
                Object.keys(mappedData).forEach(key => {
                    if (mappedData[key] !== null && mappedData[key] !== undefined) {
                        if (typeof mappedData[key] === 'object') {
                            formData.append(key, JSON.stringify(mappedData[key]));
                        } else {
                            formData.append(key, mappedData[key]);
                        }
                    }
                });

                // Add images with validation
                images.forEach((image, index) => {
                    if (image.size > 10 * 1024 * 1024) { // 10MB limit
                        throw new Error(`Image ${index + 1} is too large. Maximum size is 10MB.`);
                    }
                    formData.append('images', image);
                });

                const config = {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 60000, // 60 seconds for image uploads
                };

                if (onProgress) {
                    config.onUploadProgress = (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(percentCompleted);
                    };
                }

                const response = await apiClient.post('/projects', formData, config);
                console.log('API Response:', response.data);
                return response.data;
            } else {
                const response = await apiClient.post('/projects', mappedData, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                console.log('API Response:', response.data);
                return response.data;
            }
        } catch (error) {
            console.error('Create project error:', error);
            console.error('Error response:', error.response?.data);
            throw handleApiError(error, 'Failed to create project');
        }
    },

    // UPDATED: Update existing project with proper field mapping and new structured fields
    updateProject: async (id, projectData, images = [], onProgress = null) => {
        try {
            if (!id) throw new Error('Project ID is required');

            console.log('Updating project with data:', projectData);

            // Clear relevant cache entries
            cache.delete(`project-${id}`);
            cache.clear(); // Clear all cache for consistency

            // Map frontend form fields to backend expected fields with NEW STRUCTURED FIELDS
            const mappedData = {
                // Basic fields
                title: projectData.title,
                description: projectData.description,
                shortDescription: projectData.shortDescription || projectData.short_description,

                // NEW STRUCTURED CONTENT FIELDS
                overview: projectData.overview || null,
                keyFeatures: Array.isArray(projectData.keyFeatures)
                    ? projectData.keyFeatures.filter(f => f && f.trim() !== '')
                    : [],
                technicalImplementation: projectData.technicalImplementation || null,

                // Technical details
                category: projectData.category,
                status: projectData.status || 'draft',
                featured: projectData.featured || false,
                technologies: Array.isArray(projectData.technologies) ? projectData.technologies : [],

                // URLs and client info
                project_url: projectData.projectUrl || projectData.project_url,
                github_url: projectData.githubUrl || projectData.github_url,
                client_name: projectData.client || projectData.client_name,

                // Dates
                start_date: projectData.startDate || null,
                completion_date: projectData.endDate || projectData.completion_date,

                // SEO fields
                seo_title: projectData.seoTitle || projectData.seo_title,
                seo_description: projectData.seoDescription || projectData.seo_description,
                seo_keywords: Array.isArray(projectData.seoKeywords) ? projectData.seoKeywords : []
            };

            // Remove undefined/null values except for arrays
            Object.keys(mappedData).forEach(key => {
                if (mappedData[key] === undefined || mappedData[key] === '' || mappedData[key] === 'null' || mappedData[key] === 'undefined') {
                    if (!Array.isArray(mappedData[key])) {
                        mappedData[key] = null;
                    }
                }
            });

            console.log('Mapped update data:', mappedData);

            if (images && images.length > 0) {
                const formData = new FormData();

                Object.keys(mappedData).forEach(key => {
                    if (mappedData[key] !== null && mappedData[key] !== undefined) {
                        if (typeof mappedData[key] === 'object') {
                            formData.append(key, JSON.stringify(mappedData[key]));
                        } else {
                            formData.append(key, mappedData[key]);
                        }
                    }
                });

                images.forEach((image, index) => {
                    if (image.size > 10 * 1024 * 1024) {
                        throw new Error(`Image ${index + 1} is too large. Maximum size is 10MB.`);
                    }
                    formData.append('images', image);
                });

                const config = {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 60000,
                };

                if (onProgress) {
                    config.onUploadProgress = (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(percentCompleted);
                    };
                }

                const response = await apiClient.put(`/projects/${id}`, formData, config);
                return response.data;
            } else {
                const response = await apiClient.put(`/projects/${id}`, mappedData, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                return response.data;
            }
        } catch (error) {
            console.error('Update project error:', error);
            console.error('Error response:', error.response?.data);
            throw handleApiError(error, `Failed to update project with ID: ${id}`);
        }
    },

    // Delete project with cache cleanup
    deleteProject: async (id) => {
        try {
            if (!id) throw new Error('Project ID is required');

            const response = await apiClient.delete(`/projects/${id}`);

            // Clear cache
            cache.delete(`project-${id}`);
            cache.clear();

            return response.data;
        } catch (error) {
            throw handleApiError(error, `Failed to delete project with ID: ${id}`);
        }
    },

    // Enhanced search with debouncing support
    searchProjects: async (query, filters = {}, abortController = null) => {
        try {
            if (!query || query.trim().length < 2) {
                throw new Error('Search query must be at least 2 characters long');
            }

            const params = { search: query.trim(), ...filters };
            const config = abortController ? { signal: abortController.signal } : {};

            const response = await apiClient.get('/projects', { params, ...config });
            return response.data;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Search cancelled');
            }
            throw handleApiError(error, 'Failed to search projects');
        }
    },

    // Get projects with enhanced pagination
    getProjectsPaginated: async (page = 1, limit = 10, filters = {}) => {
        try {
            if (page < 1) throw new Error('Page number must be greater than 0');
            if (limit < 1 || limit > 100) throw new Error('Limit must be between 1 and 100');

            const params = { page, limit, ...filters };
            const response = await apiClient.get('/projects', { params });

            // Validate response structure
            const data = response.data;
            if (!data.projects || !Array.isArray(data.projects)) {
                throw new Error('Invalid response format');
            }

            return data;
        } catch (error) {
            throw handleApiError(error, 'Failed to fetch paginated projects');
        }
    },

    // Enhanced bulk operations with validation
    bulkUpdateProjects: async (updates) => {
        try {
            if (!updates || !Array.isArray(updates) || updates.length === 0) {
                throw new Error('Updates array is required and must not be empty');
            }

            // Validate each update
            updates.forEach((update, index) => {
                if (!update.id) {
                    throw new Error(`Update at index ${index} is missing ID`);
                }
            });

            const response = await apiClient.patch('/projects/bulk', { updates });

            // Clear cache after bulk update
            cache.clear();

            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Failed to bulk update projects');
        }
    },

    // Enhanced bulk delete with validation
    bulkDeleteProjects: async (ids) => {
        try {
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                throw new Error('IDs array is required and must not be empty');
            }

            // Validate IDs
            ids.forEach((id, index) => {
                if (!id) {
                    throw new Error(`ID at index ${index} is invalid`);
                }
            });

            const response = await apiClient.delete('/projects/bulk', {
                data: { ids }
            });

            // Clear cache after bulk delete
            cache.clear();

            return response.data;
        } catch (error) {
            throw handleApiError(error, 'Failed to bulk delete projects');
        }
    },

    // Additional utility methods
    clearCache: () => {
        cache.clear();
    },

    // Toggle project status (active/inactive)
    toggleProjectStatus: async (id, status) => {
        try {
            if (!id) throw new Error('Project ID is required');
            if (!['draft', 'published', 'archived'].includes(status)) {
                throw new Error('Invalid status. Must be draft, published, or archived');
            }

            const response = await apiClient.patch(`/projects/${id}/status`, { status });

            // Clear relevant cache
            cache.delete(`project-${id}`);
            cache.clear();

            return response.data;
        } catch (error) {
            throw handleApiError(error, `Failed to update project status`);
        }
    },
};