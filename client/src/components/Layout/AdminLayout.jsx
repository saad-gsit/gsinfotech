// client/src/components/Layout/AdminLayout.jsx
import React, { useState, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Badge,
    Tooltip,
    useTheme,
    useMediaQuery,
    Chip,
    Breadcrumbs,
    Link,
    CircularProgress
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    Work,
    Group,
    Article,
    ContactMail,
    Build,
    Analytics,
    Settings,
    Logout,
    Person,
    Security,
    Notifications,
    AdminPanelSettings,
    Home,
    NavigateNext
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectLoading } from '../../store/slices/authSlice';
import { logoutAdmin } from '../../store/slices/authThunks';
import { usePermissions } from '../Admin/AuthGuard';

const DRAWER_WIDTH = 280;

const AdminLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const admin = useSelector(selectUser);
    const loading = useSelector(selectLoading);
    const { hasPermission } = usePermissions();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    // Navigation items - Updated with new pages
    const navigationItems = [
        {
            path: '/admin/dashboard',
            label: 'Dashboard',
            icon: 'Dashboard',
            permission: null
        },
        {
            path: '/admin/projects',
            label: 'Projects',
            icon: 'Work',
            permission: { resource: 'projects', action: 'read' }
        },
        {
            path: '/admin/team',
            label: 'Team',
            icon: 'Group',
            permission: { resource: 'team', action: 'read' }
        },
        {
            path: '/admin/blog',
            label: 'Blog',
            icon: 'Article',
            permission: { resource: 'blog', action: 'read' }
        },
        {
            path: '/admin/services',
            label: 'Services',
            icon: 'Build',
            permission: { resource: 'services', action: 'read' }
        },
        {
            path: '/admin/contacts',
            label: 'Contacts',
            icon: 'ContactMail',
            permission: { resource: 'contact', action: 'read' }
        },
        {
            path: '/admin/analytics',
            label: 'Analytics',
            icon: 'Analytics',
            permission: { resource: 'analytics', action: 'read' }
        },
        {
            path: '/admin/settings',
            label: 'Settings',
            icon: 'Settings',
            permission: { resource: 'settings', action: 'read' }
        }
    ];

    // Icon mapping
    const iconMap = {
        'Dashboard': <Dashboard />,
        'Work': <Work />,
        'Group': <Group />,
        'Article': <Article />,
        'Build': <Build />,
        'ContactMail': <ContactMail />,
        'Analytics': <Analytics />,
        'Settings': <Settings />
    };

    // Convert navigation items to the format used in the component
    const processedNavItems = useMemo(() => {
        return navigationItems.map((item, index) => ({
            id: item.label.toLowerCase(),
            path: item.path,
            label: item.label,
            icon: iconMap[item.icon],
            permission: item.permission
        }));
    }, []);

    // Filter navigation items based on permissions
    const filteredNavItems = useMemo(() => {
        return processedNavItems.filter(item => {
            if (!item.permission) return true;
            return hasPermission(item.permission.resource, item.permission.action);
        });
    }, [processedNavItems, hasPermission]);

    // Helper function to check if path is active - MOVED BEFORE currentPage
    const isActivePath = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    // Get current page info
    const currentPage = useMemo(() => {
        return filteredNavItems.find(item => isActivePath(item.path));
    }, [filteredNavItems, location.pathname]);

    // Generate breadcrumbs with better page titles
    const breadcrumbs = useMemo(() => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const crumbs = [
            { label: 'Admin', path: '/admin/dashboard', icon: <Home sx={{ fontSize: 16 }} /> }
        ];

        if (currentPage && currentPage.path !== '/admin/dashboard') {
            crumbs.push({
                label: currentPage.label,
                path: currentPage.path,
                icon: currentPage.icon
            });

            // Add specific page breadcrumbs for detail pages
            if (pathSegments.length > 2) {
                const action = pathSegments[2];
                if (action === 'new' || action === 'add') {
                    crumbs.push({
                        label: `Add ${currentPage.label.slice(0, -1)}`, // Remove 's' from plural
                        path: location.pathname,
                        icon: currentPage.icon
                    });
                } else if (action === 'edit') {
                    crumbs.push({
                        label: `Edit ${currentPage.label.slice(0, -1)}`,
                        path: location.pathname,
                        icon: currentPage.icon
                    });
                }
            }
        }

        return crumbs;
    }, [location.pathname, currentPage]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            await dispatch(logoutAdmin());
            navigate('/admin/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Still navigate to login even if logout fails
            navigate('/admin/login');
        } finally {
            handleProfileMenuClose();
        }
    };

    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    // Format user role for display
    const formatRole = (role) => {
        if (!role) return 'User';
        return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Get user initials
    const getUserInitials = () => {
        const firstName = admin?.firstName || '';
        const lastName = admin?.lastName || '';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
    };

    // Sidebar content
    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo/Brand */}
            <Box
                sx={{
                    p: 3,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    cursor: 'pointer'
                }}
                onClick={() => handleNavigation('/admin/dashboard')}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AdminPanelSettings sx={{ fontSize: 32 }} />
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            Admin Panel
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            GS Infotech
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Navigation */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                <List sx={{ p: 2 }}>
                    {filteredNavItems.map((item) => (
                        <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
                            <Tooltip title={item.label} placement="right" arrow>
                                <ListItemButton
                                    onClick={() => handleNavigation(item.path)}
                                    selected={isActivePath(item.path)}
                                    sx={{
                                        borderRadius: 2,
                                        minHeight: 48,
                                        transition: 'all 0.2s ease-in-out',
                                        '&.Mui-selected': {
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            transform: 'translateX(4px)',
                                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46a1 100%)',
                                            },
                                            '& .MuiListItemIcon-root': {
                                                color: 'white',
                                            },
                                        },
                                        '&:hover': {
                                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                            transform: 'translateX(2px)',
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 40,
                                            color: isActivePath(item.path) ? 'white' : 'text.secondary',
                                            transition: 'color 0.2s ease-in-out',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{
                                            fontWeight: isActivePath(item.path) ? 600 : 400,
                                        }}
                                    />
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* User info */}
            <Box
                sx={{
                    p: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    background: 'rgba(102, 126, 234, 0.05)',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                        }}
                    >
                        {getUserInitials()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" noWrap fontWeight="500">
                            {admin?.firstName} {admin?.lastName}
                        </Typography>
                        <Chip
                            label={formatRole(admin?.role)}
                            size="small"
                            sx={{
                                height: 20,
                                fontSize: '0.75rem',
                                bgcolor: 'rgba(102, 126, 234, 0.1)',
                                color: 'primary.main',
                                fontWeight: 500,
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* App Bar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    ml: { md: `${DRAWER_WIDTH}px` },
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" noWrap component="div">
                            {currentPage?.label || 'Dashboard'}
                        </Typography>

                        {/* Breadcrumbs */}
                        <Breadcrumbs
                            separator={<NavigateNext fontSize="small" />}
                            sx={{
                                mt: 0.5,
                                '& .MuiBreadcrumbs-separator': {
                                    mx: 1
                                }
                            }}
                        >
                            {breadcrumbs.map((crumb, index) => (
                                <Link
                                    key={crumb.path}
                                    color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (index < breadcrumbs.length - 1) {
                                            handleNavigation(crumb.path);
                                        }
                                    }}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        textDecoration: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: index === breadcrumbs.length - 1 ? 500 : 400,
                                        cursor: index === breadcrumbs.length - 1 ? 'default' : 'pointer',
                                        '&:hover': {
                                            textDecoration: index === breadcrumbs.length - 1 ? 'none' : 'underline',
                                        },
                                    }}
                                >
                                    {React.cloneElement(crumb.icon, { sx: { fontSize: 16 } })}
                                    {crumb.label}
                                </Link>
                            ))}
                        </Breadcrumbs>
                    </Box>

                    {/* Header actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Notifications">
                            <IconButton color="inherit">
                                <Badge badgeContent={0} color="error">
                                    <Notifications />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Profile">
                            <IconButton
                                color="inherit"
                                onClick={handleProfileMenuOpen}
                                sx={{ ml: 1 }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    <Avatar
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            bgcolor: 'primary.main',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        {getUserInitials()}
                                    </Avatar>
                                )}
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Profile Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                onClick={handleProfileMenuClose}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                        mt: 1.5,
                        minWidth: 220,
                        borderRadius: 2,
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ px: 3, py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Avatar
                            sx={{
                                width: 40,
                                height: 40,
                                bgcolor: 'primary.main',
                            }}
                        >
                            {getUserInitials()}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                                {admin?.firstName} {admin?.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {admin?.email}
                            </Typography>
                        </Box>
                    </Box>
                    <Chip
                        label={formatRole(admin?.role)}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                    />
                </Box>
                <Divider />
                <MenuItem
                    onClick={() => navigate('/admin/profile')}
                    sx={{ py: 1.5 }}
                >
                    <ListItemIcon>
                        <Person fontSize="small" />
                    </ListItemIcon>
                    Profile Settings
                </MenuItem>
                <MenuItem
                    onClick={() => navigate('/admin/security')}
                    sx={{ py: 1.5 }}
                >
                    <ListItemIcon>
                        <Security fontSize="small" />
                    </ListItemIcon>
                    Security
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={handleLogout}
                    sx={{
                        color: 'error.main',
                        py: 1.5,
                        '&:hover': {
                            bgcolor: 'error.light',
                            color: 'error.contrastText'
                        }
                    }}
                    disabled={loading}
                >
                    <ListItemIcon>
                        <Logout fontSize="small" color="error" />
                    </ListItemIcon>
                    {loading ? 'Logging out...' : 'Logout'}
                </MenuItem>
            </Menu>

            {/* Sidebar */}
            <Box
                component="nav"
                sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
            >
                {/* Mobile drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH,
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>

                {/* Desktop drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH,
                            borderRight: '1px solid',
                            borderColor: 'divider',
                        },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                <Toolbar /> {/* Spacer for fixed AppBar */}

                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </Box>
            </Box>
        </Box>
    );
};

export default AdminLayout;