// client/src/components/Admin/ServicesManager.jsx - Updated without pricing
import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardActions,
    Typography,
    Grid,
    IconButton,
    Menu,
    MenuItem as MenuOption,
    CircularProgress,
    Switch,
    FormControlLabel,
    InputAdornment,
    Alert,
    Snackbar,
    Checkbox,
    OutlinedInput,
    Divider,
    Tooltip,
    Badge,
    Paper,
    Skeleton,
    Avatar,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    MoreVert,
    Visibility,
    Search,
    GridView,
    ViewList,
    Upload,
    SelectAll,
    DeleteSweep,
    CheckCircle,
    Cancel,
    FilterList,
    Schedule,
    Web,
    PhoneAndroid,
    Computer,
    Palette,
    Engineering,
    Warning
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { servicesAPI } from '../../services/servicesAPI';
import { usePermissions } from './AuthGuard';
import ServiceForm from '../Forms/ServiceForm';

const ServicesManager = () => {
    // State management
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedServices, setSelectedServices] = useState([]);
    const [bulkActionAnchor, setBulkActionAnchor] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', action: null });
    const [submitting, setSubmitting] = useState(false);

    const { canWrite, canDelete } = usePermissions();

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setLoading(true);
            const response = await servicesAPI.getAllServices();

            let servicesData = [];
            if (response.success && Array.isArray(response.data)) {
                servicesData = response.data;
            } else if (Array.isArray(response)) {
                servicesData = response;
            } else if (response.data && Array.isArray(response.data)) {
                servicesData = response.data;
            } else if (response.services && Array.isArray(response.services)) {
                servicesData = response.services;
            }

            setServices(servicesData);
        } catch (error) {
            console.error('Error loading services:', error);
            showSnackbar('Failed to load services', 'error');
            setServices([]);
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const showConfirmDialog = (title, message, action) => {
        setConfirmDialog({ open: true, title, message, action });
    };

    // Handlers
    const handleOpenDialog = (service = null) => {
        setEditingService(service);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingService(null);
    };

    const handleSubmitService = async (formData) => {
        try {
            setSubmitting(true);

            if (editingService) {
                const response = await servicesAPI.updateService(editingService.id, formData);
                setServices(services.map(s =>
                    s.id === editingService.id ? { ...response.data, id: editingService.id } : s
                ));
                showSnackbar('Service updated successfully');
            } else {
                const response = await servicesAPI.createService(formData);
                const newService = response.data || response.service || { ...Object.fromEntries(formData.entries()), id: Date.now() };
                setServices([newService, ...services]);
                showSnackbar('Service created successfully');
            }
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving service:', error);
            showSnackbar(error.message || 'Failed to save service', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteService = async (serviceId) => {
        showConfirmDialog(
            'Delete Service',
            'Are you sure you want to delete this service? This action cannot be undone.',
            async () => {
                try {
                    await servicesAPI.deleteService(serviceId);
                    setServices(services.filter(s => s.id !== serviceId));
                    showSnackbar('Service deleted successfully');
                } catch (error) {
                    console.error('Error deleting service:', error);
                    showSnackbar('Failed to delete service', 'error');
                }
            }
        );
        setAnchorEl(null);
    };

    const handleBulkAction = async (action) => {
        const count = selectedServices.length;

        showConfirmDialog(
            `${action} ${count} Services`,
            `Are you sure you want to ${action.toLowerCase()} ${count} selected service(s)?`,
            async () => {
                try {
                    if (action === 'Delete') {
                        await servicesAPI.bulkDeleteServices(selectedServices);
                        setServices(services.filter(s => !selectedServices.includes(s.id)));
                    } else if (action === 'Activate') {
                        const updates = selectedServices.map(id => ({ id, data: { is_active: true } }));
                        await servicesAPI.bulkUpdateServices(updates);
                        setServices(services.map(s =>
                            selectedServices.includes(s.id) ? { ...s, is_active: true } : s
                        ));
                    } else if (action === 'Deactivate') {
                        const updates = selectedServices.map(id => ({ id, data: { is_active: false } }));
                        await servicesAPI.bulkUpdateServices(updates);
                        setServices(services.map(s =>
                            selectedServices.includes(s.id) ? { ...s, is_active: false } : s
                        ));
                    }
                    setSelectedServices([]);
                    showSnackbar(`${count} service(s) ${action.toLowerCase()}ed successfully`);
                } catch (error) {
                    console.error(`Error ${action.toLowerCase()}ing services:`, error);
                    showSnackbar(`Failed to ${action.toLowerCase()} services`, 'error');
                }
            }
        );
        setBulkActionAnchor(null);
    };

    // Selection handlers
    const handleSelectService = (serviceId) => {
        setSelectedServices(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const handleSelectAll = () => {
        setSelectedServices(
            selectedServices.length === filteredServices.length
                ? []
                : filteredServices.map(s => s.id)
        );
    };

    // Filter and search logic
    const filteredServices = Array.isArray(services) ? services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (service.technologies && service.technologies.some(tech =>
                tech.toLowerCase().includes(searchTerm.toLowerCase())
            ));

        const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' ? service.is_active : !service.is_active);

        return matchesSearch && matchesCategory && matchesStatus;
    }) : [];

    const serviceCategories = [
        { value: 'web_development', label: 'Web Development', icon: <Web /> },
        { value: 'mobile_development', label: 'Mobile Development', icon: <PhoneAndroid /> },
        { value: 'custom_software', label: 'Custom Software', icon: <Computer /> },
        { value: 'ui_ux_design', label: 'UI/UX Design', icon: <Palette /> },
        { value: 'enterprise_solutions', label: 'Enterprise Solutions', icon: <Engineering /> }
    ];

    const getCategoryIcon = (category) => {
        const categoryData = serviceCategories.find(cat => cat.value === category);
        return categoryData ? categoryData.icon : <Web />;
    };

    const getCategoryLabel = (category) => {
        const categoryData = serviceCategories.find(cat => cat.value === category);
        return categoryData ? categoryData.label : category;
    };

    if (loading) {
        return (
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Skeleton variant="text" width={300} height={40} />
                    <Skeleton variant="rectangular" width={150} height={40} />
                </Box>
                <Grid container spacing={3}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Grid item xs={12} sm={6} lg={4} key={i}>
                            <Skeleton variant="rectangular" height={300} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        Services Manager
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your service offerings and showcase your capabilities
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    {selectedServices.length > 0 && (
                        <Badge badgeContent={selectedServices.length} color="primary">
                            <Button
                                variant="outlined"
                                onClick={(e) => setBulkActionAnchor(e.currentTarget)}
                                startIcon={<DeleteSweep />}
                            >
                                Bulk Actions
                            </Button>
                        </Badge>
                    )}

                    {canWrite('services') && (
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => handleOpenDialog()}
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46a1 100%)',
                                }
                            }}
                        >
                            Add Service
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Stats Cards - Updated without pricing stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Total Services
                            </Typography>
                            <Typography variant="h4">
                                {services.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Active
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                {services.filter(s => s.is_active).length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Categories
                            </Typography>
                            <Typography variant="h4" color="primary.main">
                                {new Set(services.map(s => s.category)).size}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                With Features
                            </Typography>
                            <Typography variant="h4" color="warning.main">
                                {services.filter(s => s.features && s.features.length > 0).length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters and Search */}
            <Card sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={filterCategory}
                                label="Category"
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <MenuItem value="all">All</MenuItem>
                                {serviceCategories.map((category) => (
                                    <MenuItem key={category.value} value={category.value}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {React.cloneElement(category.icon, { sx: { fontSize: 20 } })}
                                            {category.label}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filterStatus}
                                label="Status"
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Tooltip title="Select All">
                                <Checkbox
                                    checked={selectedServices.length === filteredServices.length && filteredServices.length > 0}
                                    indeterminate={selectedServices.length > 0 && selectedServices.length < filteredServices.length}
                                    onChange={handleSelectAll}
                                />
                            </Tooltip>
                            <IconButton
                                onClick={() => setViewMode('grid')}
                                color={viewMode === 'grid' ? 'primary' : 'default'}
                            >
                                <GridView />
                            </IconButton>
                            <IconButton
                                onClick={() => setViewMode('list')}
                                color={viewMode === 'list' ? 'primary' : 'default'}
                            >
                                <ViewList />
                            </IconButton>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Typography variant="body2" color="text.secondary">
                            {filteredServices.length} service(s)
                        </Typography>
                    </Grid>
                </Grid>
            </Card>

            {/* Services Grid */}
            <Grid container spacing={3}>
                <AnimatePresence>
                    {filteredServices.map((service) => (
                        <Grid item xs={12} sm={6} lg={4} key={service.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        border: selectedServices.includes(service.id) ? 2 : 1,
                                        borderColor: selectedServices.includes(service.id) ? 'primary.main' : 'divider',
                                        '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.2s' }
                                    }}
                                >
                                    {/* Selection Checkbox */}
                                    <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
                                        <Checkbox
                                            checked={selectedServices.includes(service.id)}
                                            onChange={() => handleSelectService(service.id)}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.8)' }}
                                        />
                                    </Box>

                                    {/* Service Image or Icon */}
                                    <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                                        {service.featured_image ? (
                                            <img
                                                src={service.featured_image}
                                                alt={service.name}
                                                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                                            />
                                        ) : (
                                            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mx: 'auto' }}>
                                                {React.cloneElement(getCategoryIcon(service.category), { sx: { fontSize: 40 } })}
                                            </Avatar>
                                        )}
                                    </Box>

                                    <CardContent sx={{ flexGrow: 1 }}>
                                        {/* Menu Button */}
                                        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    setAnchorEl(e.currentTarget);
                                                    setSelectedService(service);
                                                }}
                                            >
                                                <MoreVert />
                                            </IconButton>
                                        </Box>

                                        {/* Service Info */}
                                        <Typography variant="h6" gutterBottom>
                                            {service.name}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {service.short_description}
                                        </Typography>

                                        {/* Category and Status */}
                                        <Box sx={{ mb: 2 }}>
                                            <Chip
                                                label={getCategoryLabel(service.category)}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ mr: 1, mb: 1 }}
                                            />
                                            <Chip
                                                label={service.is_active ? 'Active' : 'Inactive'}
                                                size="small"
                                                color={service.is_active ? 'success' : 'error'}
                                                sx={{ mb: 1 }}
                                            />
                                        </Box>

                                        {/* Technologies */}
                                        {service.technologies && service.technologies.length > 0 && (
                                            <Box sx={{ mb: 2 }}>
                                                {service.technologies.slice(0, 3).map((tech, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={tech}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ mr: 0.5, mb: 0.5, fontSize: '0.75rem' }}
                                                    />
                                                ))}
                                                {service.technologies.length > 3 && (
                                                    <Chip
                                                        label={`+${service.technologies.length - 3}`}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ mr: 0.5, mb: 0.5, fontSize: '0.75rem' }}
                                                    />
                                                )}
                                            </Box>
                                        )}

                                        {/* Timeline */}
                                        {service.estimated_timeline && (
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Schedule sx={{ fontSize: 16, mr: 0.5 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {service.estimated_timeline}
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>

                                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                                        <Box>
                                            {service.features && service.features.length > 0 && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {service.features.length} feature(s)
                                                </Typography>
                                            )}
                                        </Box>

                                        {canWrite('services') && (
                                            <Button
                                                size="small"
                                                onClick={() => handleOpenDialog(service)}
                                                startIcon={<Edit />}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                    </CardActions>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </AnimatePresence>
            </Grid>

            {/* Empty State */}
            {filteredServices.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Web sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No services found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Get started by adding your first service'
                        }
                    </Typography>
                    {!searchTerm && filterCategory === 'all' && filterStatus === 'all' && canWrite('services') && (
                        <Button
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={() => handleOpenDialog()}
                        >
                            Add Your First Service
                        </Button>
                    )}
                </Box>
            )}

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                {canWrite('services') && (
                    <MenuOption onClick={() => {
                        handleOpenDialog(selectedService);
                        setAnchorEl(null);
                    }}>
                        <Edit sx={{ mr: 1 }} />
                        Edit
                    </MenuOption>
                )}
                <MenuOption onClick={() => {
                    // View service details
                    setAnchorEl(null);
                }}>
                    <Visibility sx={{ mr: 1 }} />
                    View Details
                </MenuOption>
                {canDelete('services') && (
                    <MenuOption
                        onClick={() => {
                            handleDeleteService(selectedService?.id);
                        }}
                        sx={{ color: 'error.main' }}
                    >
                        <Delete sx={{ mr: 1 }} />
                        Delete
                    </MenuOption>
                )}
            </Menu>

            {/* Bulk Actions Menu */}
            <Menu
                anchorEl={bulkActionAnchor}
                open={Boolean(bulkActionAnchor)}
                onClose={() => setBulkActionAnchor(null)}
            >
                <MenuOption onClick={() => handleBulkAction('Activate')}>
                    <CheckCircle sx={{ mr: 1 }} />
                    Activate Selected
                </MenuOption>
                <MenuOption onClick={() => handleBulkAction('Deactivate')}>
                    <Cancel sx={{ mr: 1 }} />
                    Deactivate Selected
                </MenuOption>
                <Divider />
                <MenuOption
                    onClick={() => handleBulkAction('Delete')}
                    sx={{ color: 'error.main' }}
                >
                    <Delete sx={{ mr: 1 }} />
                    Delete Selected
                </MenuOption>
            </Menu>

            {/* Service Form Dialog */}
            <ServiceForm
                open={openDialog}
                onClose={handleCloseDialog}
                onSubmit={handleSubmitService}
                editingService={editingService}
                loading={submitting}
            />

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning color="warning" />
                    {confirmDialog.title}
                </DialogTitle>
                <DialogContent>
                    <Typography>{confirmDialog.message}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
                        Cancel
                    </Button>
                    <Button
                        onClick={async () => {
                            if (confirmDialog.action) {
                                await confirmDialog.action();
                            }
                            setConfirmDialog({ ...confirmDialog, open: false });
                        }}
                        color="error"
                        variant="contained"
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ServicesManager;