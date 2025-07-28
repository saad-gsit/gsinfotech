// client/src/services/api.js - Base API Configuration
import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration matching your backend
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token and API key
api.interceptors.request.use(
    (config) => {
        // Add auth token for all requests - check both possible keys
        const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add API key for admin routes (based on your backend security)
        if (config.url?.includes('/admin')) {
            const apiKey = localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY;
            if (apiKey) {
                config.headers['X-API-Key'] = apiKey;
            }
        }

        // Log requests in development
        if (import.meta.env.DEV) {
            console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }

        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors and logging
api.interceptors.response.use(
    (response) => {
        // Log successful responses in development
        if (import.meta.env.DEV) {
            console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }
        return response;
    },
    (error) => {
        const message = error.response?.data?.message || error.response?.data?.error || 'Something went wrong';

        // Log errors in development
        if (import.meta.env.DEV) {
            console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
                status: error.response?.status,
                message,
                data: error.response?.data
            });
        }

        // Handle different error types based on your backend responses
        switch (error.response?.status) {
            case 401:
                // Clear all auth-related items
                localStorage.removeItem('authToken');
                localStorage.removeItem('adminToken');
                localStorage.removeItem('apiKey');
                // Only redirect if we're not already on login page
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/admin/login';
                    toast.error('Session expired. Please login again.');
                }
                break;
            case 403:
                toast.error('Access denied');
                break;
            case 404:
                toast.error('Resource not found');
                break;
            case 429:
                toast.error('Too many requests. Please try again later.');
                break;
            case 500:
                toast.error('Server error. Please try again later.');
                break;
            default:
                if (error.response?.status >= 400) {
                    toast.error(message);
                }
        }

        return Promise.reject(error);
    }
);

// Generic API methods
export const apiClient = {
    get: (url, config = {}) => api.get(url, config),
    post: (url, data = {}, config = {}) => api.post(url, data, config),
    put: (url, data = {}, config = {}) => api.put(url, data, config),
    patch: (url, data = {}, config = {}) => api.patch(url, data, config),
    delete: (url, config = {}) => api.delete(url, config),
};

// File upload helper for your image optimization system
export const uploadFile = async (file, endpoint, onProgress, additionalData = {}) => {
    const formData = new FormData();
    formData.append('file', file);

    // Add any additional form data
    Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
    });

    return api.post(endpoint, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const progress = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                onProgress(progress);
            }
        },
    });
};

// Health check function
export const checkServerHealth = async () => {
    try {
        const response = await apiClient.get('/health');
        return response.data;
    } catch (error) {
        throw new Error('Server is not responding');
    }
};

export const handleApiError = (error) => {
    const message = error.response?.data?.message || error.response?.data?.error || 'Something went wrong';

    if (import.meta.env.DEV) {
        console.error('API Error:', error);
    }

    // Return a formatted error object
    return {
        message,
        status: error.response?.status,
        data: error.response?.data
    };
};

// Test database connection
export const testDatabaseConnection = async () => {
    try {
        const response = await apiClient.get('/db-test');
        return response.data;
    } catch (error) {
        throw new Error('Database connection failed');
    }
};

// Export additional utilities if needed by existing components
export const apiHelpers = {
    checkServerHealth,
    testDatabaseConnection,
    isServerOnline: async () => {
        try {
            await checkServerHealth();
            return true;
        } catch {
            return false;
        }
    },
    getBaseURL: () => api.defaults.baseURL,
    setAuthToken: (token) => {
        if (token) {
            // Store in both locations for compatibility
            localStorage.setItem('authToken', token);
            localStorage.setItem('adminToken', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('adminToken');
            delete api.defaults.headers.common['Authorization'];
        }
    },
    clearAuth: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('apiKey');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        delete api.defaults.headers.common['X-API-Key'];
    }
};

export default api;