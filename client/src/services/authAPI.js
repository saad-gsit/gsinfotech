// client/src/services/authAPI.js
import axios from 'axios';

// Auth API instance
const authAPIInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token to every request
authAPIInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Set token in headers if available
export const setAuthToken = (token) => {
    if (token) {
        authAPIInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Also update localStorage
        localStorage.setItem('adminToken', token);
    } else {
        delete authAPIInstance.defaults.headers.common['Authorization'];
        localStorage.removeItem('adminToken');
    }
};

// Auth API methods
export const authService = {
    // Login
    login: async (email, password) => {
        const response = await authAPIInstance.post('/auth/login', { email, password });
        // Set token after successful login
        if (response.data.token) {
            setAuthToken(response.data.token);
        }
        return response.data;
    },

    // Logout
    logout: async () => {
        try {
            const response = await authAPIInstance.post('/auth/logout');
            return response.data;
        } finally {
            // Clear token regardless of logout success
            setAuthToken(null);
        }
    },

    // Get current admin
    getCurrentAdmin: async () => {
        const response = await authAPIInstance.get('/auth/me');
        return response.data;
    },

    // Verify token
    verifyToken: async (token) => {
        const response = await authAPIInstance.post('/auth/verify-token', { token });
        return response.data;
    },

    // Update profile
    updateProfile: async (profileData) => {
        const response = await authAPIInstance.put('/auth/profile', profileData);
        return response.data;
    },

    // Change password
    changePassword: async (passwordData) => {
        const response = await authAPIInstance.put('/auth/change-password', passwordData);
        return response.data;
    },

    // Check if user is authenticated (helper method for useApi.js)
    isAuthenticated: () => {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
        return !!token;
    },

    // Get current user (alias for getCurrentAdmin to match useApi.js)
    getCurrentUser: async () => {
        const response = await authAPIInstance.get('/auth/me');
        return response.data;
    },
};

// Named export for compatibility with useApi.js
export const authAPI = authService;

// Response interceptor to handle 401 errors
authAPIInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear from localStorage
            localStorage.removeItem('adminToken');
            localStorage.removeItem('authToken');
            setAuthToken(null);
            // Redirect to login if not already there
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

export default authAPIInstance;