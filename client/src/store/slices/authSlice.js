// client/src/store/slices/authSlice.js (Fixed Version)
import { createSlice, createSelector } from '@reduxjs/toolkit';
import {
    loginAdmin,
    logoutAdmin,
    verifyToken,
    getCurrentAdmin,
    updateProfile,
    changePassword
} from './authThunks';

const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    permissions: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true
            state.error = null
        },
        loginSuccess: (state, action) => {
            state.loading = false
            state.isAuthenticated = true
            state.user = action.payload.user
            state.token = action.payload.token
            state.permissions = action.payload.user?.permissions
        },
        loginFailure: (state, action) => {
            state.loading = false
            state.error = action.payload
        },
        logout: (state) => {
            state.user = null
            state.token = null
            state.isAuthenticated = false
            state.error = null
            state.permissions = null
        },
        clearError: (state) => {
            state.error = null
        },
        setUser: (state, action) => {
            state.user = action.payload.user
            state.permissions = action.payload.user?.permissions
        }
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginAdmin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.permissions = action.payload.user?.permissions;
                state.error = null;
            })
            .addCase(loginAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.permissions = null;
            })

        // Logout
        builder
            .addCase(logoutAdmin.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutAdmin.fulfilled, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.permissions = null;
                state.error = null;
            })
            .addCase(logoutAdmin.rejected, (state) => {
                // Even if logout fails on server, clear local state
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.permissions = null;
                state.error = null;
            })

        // Verify Token
        builder
            .addCase(verifyToken.pending, (state) => {
                state.loading = true;
            })
            .addCase(verifyToken.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.permissions = action.payload.user?.permissions;
                state.error = null;
            })
            .addCase(verifyToken.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.permissions = null;
                state.error = action.payload;
            })

        // Get Current Admin
        builder
            .addCase(getCurrentAdmin.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.permissions = action.payload.user?.permissions;
            })

        // Update Profile
        builder
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.permissions = action.payload.user?.permissions;
                state.error = null;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

        // Change Password
        builder
            .addCase(changePassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
})

export const { loginStart, loginSuccess, loginFailure, logout, clearError, setUser } = authSlice.actions

// Basic selectors (these are fine - they return primitive values or stable references)
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectLoading = (state) => state.auth.loading;
export const selectError = (state) => state.auth.error;
export const selectPermissions = (state) => state.auth.permissions;

// NEW: Add these stable selectors for user properties
export const selectUserRole = (state) => state.auth.user?.role;
export const selectUserPermissions = (state) => state.auth.user?.permissions;
export const selectUserEmail = (state) => state.auth.user?.email;
export const selectUserName = (state) => state.auth.user?.name;

// FIXED: Memoized selectors using createSelector (these won't cause re-renders)
export const selectIsSuperAdmin = createSelector(
    [selectUserRole],
    (userRole) => userRole === 'super_admin'
);

// Helper function to create memoized permission checker
export const createPermissionSelector = (resource, action = 'read') =>
    createSelector(
        [selectPermissions, selectUserRole],
        (permissions, userRole) => {
            if (userRole === 'super_admin') return true;
            if (!permissions) return false;
            const resourcePermissions = permissions[resource];
            return resourcePermissions && resourcePermissions[action];
        }
    );

// Helper function to create memoized role checker
export const createRoleSelector = (role) =>
    createSelector(
        [selectUserRole],
        (userRole) => userRole === role || userRole === 'super_admin'
    );

// DEPRECATED: Remove these functions that were causing re-renders
// export const selectHasPermission = (state) => (resource, action = 'read') => { ... }
// export const selectHasRole = (state) => (role) => { ... }

export default authSlice.reducer