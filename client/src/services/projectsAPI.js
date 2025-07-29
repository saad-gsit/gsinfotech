// client/src/services/projectsAPI.js
import { apiClient, uploadFile, handleApiError } from './api.js';

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

    // Get project by ID with caching
    getProjectById: async (id, useCache = true) => {
        try {
            if (!id) throw new Error('Project ID is required');

            const cacheKey = `project-${id}`;

            if (useCache) {
                const cachedData = getCachedData(cacheKey);
                if (cachedData) return cachedData;
            }

            // Check if it's a numeric ID or slug
            const isNumeric = /^\d+$/.test(id);
            const endpoint = isNumeric ? `/projects/${id}` : `/projects/slug/${id}`;

            const response = await apiClient.get(endpoint);
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
            const params = { featured: true, limit };
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

    // Create new project with enhanced validation and progress tracking
    createProject: async (projectData, images = [], onProgress = null) => {
        try {
            // Validate required fields
            if (!projectData.title) throw new Error('Project title is required');
            if (!projectData.description) throw new Error('Project description is required');

            // Clear relevant cache entries
            cache.clear();

            if (images.length > 0) {
                const formData = new FormData();

                // Add project data
                Object.keys(projectData).forEach(key => {
                    if (projectData[key] !== null && projectData[key] !== undefined) {
                        if (typeof projectData[key] === 'object') {
                            formData.append(key, JSON.stringify(projectData[key]));
                        } else {
                            formData.append(key, projectData[key]);
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
                return response.data;
            } else {
                const response = await apiClient.post('/projects', projectData);
                return response.data;
            }
        } catch (error) {
            throw handleApiError(error, 'Failed to create project');
        }
    },

    // Update existing project with enhanced validation
    updateProject: async (id, projectData, images = [], onProgress = null) => {
        try {
            if (!id) throw new Error('Project ID is required');

            // Clear relevant cache entries
            cache.delete(`project-${id}`);
            cache.clear(); // Clear all cache for consistency

            if (images.length > 0) {
                const formData = new FormData();

                Object.keys(projectData).forEach(key => {
                    if (projectData[key] !== null && projectData[key] !== undefined) {
                        if (typeof projectData[key] === 'object') {
                            formData.append(key, JSON.stringify(projectData[key]));
                        } else {
                            formData.append(key, projectData[key]);
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
                const response = await apiClient.put(`/projects/${id}`, projectData);
                return response.data;
            }
        } catch (error) {
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

    // Upload project images with progress tracking
    uploadProjectImages: async (projectId, images, onProgress) => {
        try {
            if (!projectId) throw new Error('Project ID is required');
            if (!images || images.length === 0) throw new Error('At least one image is required');

            const formData = new FormData();
            images.forEach((image, index) => {
                if (image.size > 10 * 1024 * 1024) {
                    throw new Error(`Image ${index + 1} is too large. Maximum size is 10MB.`);
                }
                formData.append('images', image);
            });
            formData.append('projectId', projectId);

            return uploadFile(images[0], '/projects/upload-images', onProgress, {
                projectId,
                additionalImages: images.slice(1),
            });
        } catch (error) {
            throw handleApiError(error, 'Failed to upload project images');
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

    // Get project categories with caching
    getProjectCategories: async (useCache = true) => {
        try {
            const cacheKey = 'project-categories';

            if (useCache) {
                const cachedData = getCachedData(cacheKey);
                if (cachedData) return cachedData;
            }

            const response = await apiClient.get('/projects/categories');
            const data = response.data;

            if (useCache) {
                setCachedData(cacheKey, data);
            }

            return data;
        } catch (error) {
            // Return default categories if endpoint doesn't exist
            console.warn('Project categories endpoint not available, using defaults');
            const defaultCategories = [
                { id: 'web', name: 'Web Development', slug: 'web', count: 0 },
                { id: 'mobile', name: 'Mobile Apps', slug: 'mobile', count: 0 },
                { id: 'desktop', name: 'Desktop Applications', slug: 'desktop', count: 0 },
                { id: 'api', name: 'API Development', slug: 'api', count: 0 },
            ];
            return defaultCategories;
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

    // Get project technologies/skills
    getProjectTechnologies: async (useCache = true) => {
        try {
            const cacheKey = 'project-technologies';

            if (useCache) {
                const cachedData = getCachedData(cacheKey);
                if (cachedData) return cachedData;
            }

            const response = await apiClient.get('/projects/technologies');
            const data = response.data;

            if (useCache) {
                setCachedData(cacheKey, data);
            }

            return data;
        } catch (error) {
            console.warn('Project technologies endpoint not available, using defaults');
            return [
                'React', 'Node.js', 'MongoDB', 'Express.js', 'JavaScript', 'TypeScript',
                'Python', 'Django', 'PostgreSQL', 'MySQL', 'Docker', 'AWS'
            ];
        }
    },

    // Toggle project status (active/inactive)
    toggleProjectStatus: async (id, status) => {
        try {
            if (!id) throw new Error('Project ID is required');
            if (!['active', 'inactive', 'archived'].includes(status)) {
                throw new Error('Invalid status. Must be active, inactive, or archived');
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