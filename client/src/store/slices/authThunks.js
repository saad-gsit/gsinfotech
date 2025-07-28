// client/src/store/slices/authThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService, setAuthToken } from '../../services/authAPI';
import { apiHelpers } from '../../services/api';

// Login thunk
export const loginAdmin = createAsyncThunk(
    'auth/loginAdmin',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await authService.login(email, password);
            const { admin, token } = response.data;

            // Set token in both API instances and localStorage
            setAuthToken(token);
            apiHelpers.setAuthToken(token); // Also set in main API instance

            // Store in both locations for compatibility
            localStorage.setItem('adminToken', token);
            localStorage.setItem('authToken', token);

            return { user: admin, token };
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Login failed';
            return rejectWithValue(message);
        }
    }
);

// Logout thunk
export const logoutAdmin = createAsyncThunk(
    'auth/logoutAdmin',
    async (_, { rejectWithValue }) => {
        try {
            await authService.logout();
        } catch (error) {
            // Log error but continue with logout
            console.error('Logout API error:', error);
        } finally {
            // Always clear local data
            setAuthToken(null);
            apiHelpers.clearAuth();
            localStorage.removeItem('adminToken');
            localStorage.removeItem('authToken');
        }

        return null;
    }
);

// Verify token thunk
export const verifyToken = createAsyncThunk(
    'auth/verifyToken',
    async (_, { rejectWithValue }) => {
        try {
            // Check both possible token locations
            const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');

            if (!token) {
                return rejectWithValue('No token found');
            }

            // Set token in headers for both API instances
            setAuthToken(token);
            apiHelpers.setAuthToken(token);

            const response = await authService.verifyToken(token);
            const { admin } = response.data;

            return { user: admin, token };
        } catch (error) {
            // Clear invalid token
            setAuthToken(null);
            apiHelpers.clearAuth();
            localStorage.removeItem('adminToken');
            localStorage.removeItem('authToken');

            const message = error.response?.data?.message || 'Token verification failed';
            return rejectWithValue(message);
        }
    }
);

// Get current admin thunk
export const getCurrentAdmin = createAsyncThunk(
    'auth/getCurrentAdmin',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authService.getCurrentAdmin();
            const { admin } = response.data;
            return { user: admin };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to get admin info';
            return rejectWithValue(message);
        }
    }
);

// Update profile thunk
export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await authService.updateProfile(profileData);
            const { admin } = response.data;
            return { user: admin };
        } catch (error) {
            const message = error.response?.data?.message || 'Profile update failed';
            return rejectWithValue(message);
        }
    }
);

// Change password thunk
export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async (passwordData, { rejectWithValue }) => {
        try {
            const response = await authService.changePassword(passwordData);
            return response;
        } catch (error) {
            const message = error.response?.data?.message || 'Password change failed';
            return rejectWithValue(message);
        }
    }
);