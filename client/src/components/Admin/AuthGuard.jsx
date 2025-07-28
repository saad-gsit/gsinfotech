// client/src/components/Admin/AuthGuard.jsx (Updated Version)
import React, { useEffect, useState, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import {
    selectAuth,
    selectUser,
    selectUserRole,
    selectPermissions,
    selectIsAuthenticated,
    selectLoading
} from '../../store/slices/authSlice';
import { verifyToken } from '../../store/slices/authThunks';

const AuthGuard = ({
    children,
    requireAuth = true,
    roles = [],
    permissions = null,
    fallback = null
}) => {
    const location = useLocation();
    const dispatch = useDispatch();

    // Use individual selectors for better performance
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const loading = useSelector(selectLoading);
    const user = useSelector(selectUser);
    const userRole = useSelector(selectUserRole);
    const userPermissions = useSelector(selectPermissions);

    const [isInitialized, setIsInitialized] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Memoize permission checking functions to match your existing permissions structure
    const permissionHelpers = useMemo(() => {
        const hasRole = (role) => {
            if (!userRole) return false;
            if (userRole === 'super_admin') return true; // Super admin has all roles
            return userRole === role;
        };

        const hasPermission = (resource, action = 'read') => {
            if (userRole === 'super_admin') return true; // Super admin has all permissions
            if (!userPermissions) return false;

            // Match your existing permissions structure: permissions[resource][action]
            const resourcePermissions = userPermissions[resource];
            return resourcePermissions && resourcePermissions[action];
        };

        const canRead = (resource) => hasPermission(resource, 'read');
        const canWrite = (resource) => hasPermission(resource, 'write');
        const canDelete = (resource) => hasPermission(resource, 'delete');

        return {
            hasRole,
            hasPermission,
            canRead,
            canWrite,
            canDelete,
            isSuperAdmin: userRole === 'super_admin'
        };
    }, [userRole, userPermissions]);

    useEffect(() => {
        const initializeAuth = async () => {
            // Check if we have a token before verifying
            const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');

            if (!token && requireAuth) {
                // No token and auth is required, skip verification
                setIsInitialized(true);
                return;
            }

            if (token && !isAuthenticated && !isVerifying) {
                // We have a token but not authenticated, verify it
                setIsVerifying(true);
                try {
                    await dispatch(verifyToken()).unwrap();
                } catch (error) {
                    console.error('Auth verification failed:', error);
                } finally {
                    setIsVerifying(false);
                    setIsInitialized(true);
                }
            } else {
                // Already authenticated or no token
                setIsInitialized(true);
            }
        };

        if (!isInitialized && !loading) {
            initializeAuth();
        }
    }, [dispatch, isInitialized, isAuthenticated, requireAuth, loading, isVerifying]);

    // Show loading spinner while initializing
    if (loading || !isInitialized || isVerifying) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Box
                        sx={{
                            textAlign: 'center',
                            color: 'white',
                        }}
                    >
                        <CircularProgress
                            size={60}
                            thickness={4}
                            sx={{
                                color: 'white',
                                mb: 3,
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                            }}
                        />
                        <Typography variant="h6" sx={{ opacity: 0.9 }}>
                            Verifying authentication...
                        </Typography>
                    </Box>
                </motion.div>
            </Box>
        );
    }

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
        return (
            <Navigate
                to="/admin/login"
                state={{ from: location }}
                replace
            />
        );
    }

    // If authentication is not required and user is authenticated, redirect to dashboard
    if (!requireAuth && isAuthenticated) {
        const redirectTo = location.state?.from?.pathname || '/admin/dashboard';
        return <Navigate to={redirectTo} replace />;
    }

    // Check role-based access
    if (requireAuth && roles.length > 0) {
        const hasRequiredRole = roles.some(role => permissionHelpers.hasRole(role));

        if (!hasRequiredRole) {
            return fallback || (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        textAlign: 'center',
                        px: 3,
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Typography variant="h4" gutterBottom color="error">
                            Access Denied
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            You don't have permission to access this area.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Required roles: {roles.join(', ')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Your role: {userRole || 'Unknown'}
                        </Typography>
                    </motion.div>
                </Box>
            );
        }
    }

    // Check permission-based access
    if (requireAuth && permissions) {
        const { resource, action = 'read' } = permissions;

        if (!permissionHelpers.hasPermission(resource, action)) {
            return fallback || (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        textAlign: 'center',
                        px: 3,
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Typography variant="h4" gutterBottom color="error">
                            Access Denied
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            You don't have permission to {action} {resource}.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Contact your administrator for access.
                        </Typography>
                    </motion.div>
                </Box>
            );
        }
    }

    // All checks passed, render children
    return <>{children}</>;
};

// Higher-order component for route protection
export const withAuthGuard = (Component, options = {}) => {
    return (props) => (
        <AuthGuard {...options}>
            <Component {...props} />
        </AuthGuard>
    );
};

// Optimized hook for checking permissions in components - matches your existing structure
export const usePermissions = () => {
    const user = useSelector(selectUser);
    const userRole = useSelector(selectUserRole);
    const userPermissions = useSelector(selectPermissions);

    // Memoize the permission functions to prevent unnecessary re-renders
    return useMemo(() => {
        const hasRole = (role) => {
            if (!userRole) return false;
            if (userRole === 'super_admin') return true;
            return userRole === role;
        };

        const hasPermission = (resource, action = 'read') => {
            if (userRole === 'super_admin') return true;
            if (!userPermissions) return false;

            // Match your existing permissions structure: permissions[resource][action]
            const resourcePermissions = userPermissions[resource];
            return resourcePermissions && resourcePermissions[action];
        };

        const canRead = (resource) => hasPermission(resource, 'read');
        const canWrite = (resource) => hasPermission(resource, 'write');
        const canDelete = (resource) => hasPermission(resource, 'delete');

        return {
            admin: user, // Keep this for backward compatibility
            user,
            userRole,
            userPermissions,
            hasRole,
            hasPermission,
            canRead,
            canWrite,
            canDelete,
            isSuperAdmin: userRole === 'super_admin'
        };
    }, [user, userRole, userPermissions]);
};

export default AuthGuard;