import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardActions,
    Typography,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
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
    ListItemText,
    OutlinedInput,
    Divider,
    Tooltip,
    Badge,
    Paper,
    Skeleton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText as MuiListItemText,
    Avatar
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    MoreVert,
    Visibility,
    Business,
    Code,
    Design,
    Cloud,
    Search,
    GridView,
    ViewList,
    Build,
    Upload,
    Close,
    SelectAll,
    DeleteSweep,
    Publish,
    Archive,
    FilterList,
    Sort,
    CloudUpload,
    Check,
    Warning,
    Error as ErrorIcon,
    Star,
    StarBorder,
    AttachMoney,
    Schedule,
    CheckCircle,
    Featured,
    DragHandle,
    Apps,
    Devices,
    Web,
    PhoneAndroid,
    Computer,
    Palette,
    Engineering,
    Launch
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { servicesAPI } from '../../services/servicesAPI';
import { usePermissions } from './AuthGuard';

// Validation Schema
const serviceSchema = yup.object({
    name: yup.string().required('Service name is required').min(3, 'Name must be at least 3 characters'),
    short_description: yup.string().required('Short description is required').max(500, 'Short description must be less than 500 characters'),
    description: yup.string().required('Description is required').min(50, 'Description must be at least 50 characters'),
    category: yup.string().required('Category is required'),
    features: yup.array().min(1, 'At least one feature is required'),
    technologies: yup.array().min(1, 'At least one technology is required'),
    pricing_model: yup.string().nullable(),
    starting_price: yup.number().min(0, 'Price cannot be negative').nullable(),
    estimated_timeline: yup.string().nullable()
});

// Image Upload Component
const ServiceImageUpload = ({ onImageChange, existingImage = null }) => {
    const [image, setImage] = useState(existingImage);
    const [uploading, setUploading] = useState(false);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        multiple: false,
        maxSize: 5 * 1024 * 1024, // 5MB
        onDrop: async (acceptedFiles) => {
            setUploading(true);
            try {
                const file = acceptedFiles[0];
                const imageUrl = URL.createObjectURL(file);
                setImage(imageUrl);
                onImageChange(file);
            } catch (error) {
                console.error('Upload failed:', error);
            } finally {
                setUploading(false);
            }
        }
    });

    const removeImage = () => {
        setImage(null);
        onImageChange(null);
    };

    return (
        <Box>
            <Paper
                {...getRootProps()}
                sx={{
                    p: 3,
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    bgcolor: isDragActive ? 'primary.50' : 'grey.50',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.50'
                    }
                }}
            >
                <input {...getInputProps()} />
                {image ? (
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <img
                            src={image}
                            alt="Service"
                            style={{
                                width: 200,
                                height: 120,
                                objectFit: 'cover',
                                borderRadius: 8
                            }}
                        />
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeImage();
                            }}
                            sx={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                bgcolor: 'rgba(255,255,255,0.8)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                            }}
                        >
                            <Close fontSize="small" />
                        </IconButton>
                    </Box>
                ) : (
                    <>
                        <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            {isDragActive ? 'Drop service image here' : 'Upload service image'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            or click to select file (max 5MB)
                        </Typography>
                    </>
                )}
                {uploading && <CircularProgress sx={{ mt: 2 }} />}
            </Paper>
        </Box>
    );
};

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
    const [uploadedImage, setUploadedImage] = useState(null);

    const { canWrite, canDelete } = usePermissions();

    // Form setup with React Hook Form
    const { control, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = useForm({
        resolver: yupResolver(serviceSchema),
        defaultValues: {
            name: '',
            short_description: '',
            description: '',
            category: '',
            features: [],
            technologies: [],
            pricing_model: '',
            starting_price: '',
            price_currency: 'USD',
            estimated_timeline: '',
            is_featured: false,
            is_active: true,
            show_in_homepage: true,
            process_steps: []
        }
    });

    // Field arrays for dynamic lists
    const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
        control,
        name: 'features'
    });

    const { fields: processFields, append: appendProcess, remove: removeProcess } = useFieldArray({
        control,
        name: 'process_steps'
    });

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setLoading(true);
            const response = await servicesAPI.getAllServices();

            let servicesData = [];
            if (Array.isArray(response)) {
                servicesData = response;
            } else if (response.data && Array.isArray(response.data)) {
                servicesData = response.data;
            } else if (response.services && Array.isArray(response.services)) {
                servicesData = response.services;
            } else {
                console.error('Unexpected response structure:', response);
                servicesData = [];
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
        if (service) {
            setEditingService(service);
            reset({
                ...service,
                features: service.features || [],
                technologies: service.technologies || [],
                process_steps: service.process_steps || []
            });
        } else {
            setEditingService(null);
            reset({
                name: '',
                short_description: '',
                description: '',
                category: '',
                features: [],
                technologies: [],
                pricing_model: '',
                starting_price: '',
                price_currency: 'USD',
                estimated_timeline: '',
                is_featured: false,
                is_active: true,
                show_in_homepage: true,
                process_steps: []
            });
        }
        setUploadedImage(null);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingService(null);
        setUploadedImage(null);
    };

    const onSubmit = async (data) => {
        try {
            if (editingService) {
                await servicesAPI.updateService(editingService.id, data);
                setServices(services.map(s =>
                    s.id === editingService.id ? { ...data, id: editingService.id } : s
                ));
                showSnackbar('Service updated successfully');
            } else {
                const response = await servicesAPI.createService(data);
                setServices([response.service || { ...data, id: Date.now() }, ...services]);
                showSnackbar('Service created successfully');
            }
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving service:', error);
            showSnackbar('Failed to save service', 'error');
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
                        await Promise.all(selectedServices.map(id => servicesAPI.deleteService(id)));
                        setServices(services.filter(s => !selectedServices.includes(s.id)));
                    } else if (action === 'Activate') {
                        await Promise.all(selectedServices.map(id =>
                            servicesAPI.updateService(id, { is_active: true })
                        ));
                        setServices(services.map(s =>
                            selectedServices.includes(s.id) ? { ...s, is_active: true } : s
                        ));
                    } else if (action === 'Deactivate') {
                        await Promise.all(selectedServices.map(id =>
                            servicesAPI.updateService(id, { is_active: false })
                        ));
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
            service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        return categoryData ? categoryData.icon : <Build />;
    };

    const getCategoryLabel = (category) => {
        const categoryData = serviceCategories.find(cat => cat.value === category);
        return categoryData ? categoryData.label : category;
    };

    const availableTechnologies = [
        'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java', 'C#', 'PHP',
        'JavaScript', 'TypeScript', 'HTML', 'CSS', 'MongoDB', 'PostgreSQL',
        'MySQL', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Firebase',
        'Flutter', 'React Native', 'Swift', 'Kotlin', 'Figma', 'Adobe XD',
        'Sketch', 'Photoshop', 'Illustrator'
    ];

    const pricingModels = [
        { value: 'fixed', label: 'Fixed Price' },
        { value: 'hourly', label: 'Hourly Rate' },
        { value: 'project_based', label: 'Project Based' },
        { value: 'monthly', label: 'Monthly Retainer' },
        { value: 'custom', label: 'Custom Quote' }
    ];

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

            {/* Stats Cards */}
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
                                Featured
                            </Typography>
                            <Typography variant="h4" color="primary.main">
                                {services.filter(s => s.is_featured).length}
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
                            <Typography variant="h4" color="warning.main">
                                {new Set(services.map(s => s.category)).size}
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
                                        {category.label}
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

                                    {/* Featured Badge */}
                                    {service.is_featured && (
                                        <Chip
                                            label="Featured"
                                            size="small"
                                            color="primary"
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                zIndex: 1
                                            }}
                                        />
                                    )}

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
                                                {getCategoryIcon(service.category)}
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

                                        {/* Pricing */}
                                        {service.starting_price && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <AttachMoney sx={{ fontSize: 16, mr: 0.5 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Starting from ${service.starting_price}
                                                </Typography>
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
                    <Build sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
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

            {/* Add/Edit Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: { minHeight: '80vh' }
                }}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>
                        {editingService ? 'Edit Service' : 'Add New Service'}
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            {/* Service Image */}
                            <Grid item xs={12} md={4}>
                                <Typography variant="h6" gutterBottom>
                                    Service Image
                                </Typography>
                                <ServiceImageUpload
                                    onImageChange={setUploadedImage}
                                    existingImage={editingService?.featured_image}
                                />
                            </Grid>

                            {/* Basic Information */}
                            <Grid item xs={12} md={8}>
                                <Typography variant="h6" gutterBottom>
                                    Basic Information
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={8}>
                                        <Controller
                                            name="name"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    label="Service Name"
                                                    error={!!errors.name}
                                                    helperText={errors.name?.message}
                                                    required
                                                />
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <Controller
                                            name="category"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl fullWidth error={!!errors.category}>
                                                    <InputLabel>Category</InputLabel>
                                                    <Select
                                                        {...field}
                                                        label="Category"
                                                    >
                                                        {serviceCategories.map((category) => (
                                                            <MenuItem key={category.value} value={category.value}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    {category.icon}
                                                                    {category.label}
                                                                </Box>
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    {errors.category && (
                                                        <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                                                            {errors.category.message}
                                                        </Typography>
                                                    )}
                                                </FormControl>
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Controller
                                            name="short_description"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    label="Short Description"
                                                    error={!!errors.short_description}
                                                    helperText={errors.short_description?.message || 'Brief summary for cards (max 500 characters)'}
                                                    required
                                                />
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Controller
                                            name="description"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    label="Full Description"
                                                    multiline
                                                    rows={4}
                                                    error={!!errors.description}
                                                    helperText={errors.description?.message}
                                                    required
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Technologies */}
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Technologies & Skills
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Controller
                                    name="technologies"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.technologies}>
                                            <InputLabel>Technologies</InputLabel>
                                            <Select
                                                {...field}
                                                multiple
                                                input={<OutlinedInput label="Technologies" />}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((value) => (
                                                            <Chip key={value} label={value} size="small" />
                                                        ))}
                                                    </Box>
                                                )}
                                            >
                                                {availableTechnologies.map((tech) => (
                                                    <MenuItem key={tech} value={tech}>
                                                        <Checkbox checked={field.value.indexOf(tech) > -1} />
                                                        <ListItemText primary={tech} />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.technologies && (
                                                <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                                                    {errors.technologies.message}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    )}
                                />
                            </Grid>

                            {/* Features */}
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Service Features
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Add key features and benefits of this service
                                </Typography>

                                {featureFields.map((field, index) => (
                                    <Box key={field.id} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                        <TextField
                                            fullWidth
                                            label={`Feature ${index + 1}`}
                                            {...register(`features.${index}`)}
                                            error={!!errors.features?.[index]}
                                            helperText={errors.features?.[index]?.message}
                                        />
                                        <IconButton
                                            onClick={() => removeFeature(index)}
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                ))}

                                <Button
                                    variant="outlined"
                                    onClick={() => appendFeature('')}
                                    startIcon={<Add />}
                                >
                                    Add Feature
                                </Button>
                            </Grid>

                            {/* Process Steps */}
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Process Steps
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Outline your service delivery process
                                </Typography>

                                {processFields.map((field, index) => (
                                    <Box key={field.id} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                        <TextField
                                            fullWidth
                                            label={`Step ${index + 1}`}
                                            {...register(`process_steps.${index}`)}
                                        />
                                        <IconButton
                                            onClick={() => removeProcess(index)}
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                ))}

                                <Button
                                    variant="outlined"
                                    onClick={() => appendProcess('')}
                                    startIcon={<Add />}
                                >
                                    Add Step
                                </Button>
                            </Grid>

                            {/* Pricing */}
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Pricing Information
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="pricing_model"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth>
                                            <InputLabel>Pricing Model</InputLabel>
                                            <Select
                                                {...field}
                                                label="Pricing Model"
                                            >
                                                {pricingModels.map((model) => (
                                                    <MenuItem key={model.value} value={model.value}>
                                                        {model.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="starting_price"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Starting Price"
                                            type="number"
                                            error={!!errors.starting_price}
                                            helperText={errors.starting_price?.message}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <AttachMoney />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Controller
                                    name="estimated_timeline"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Estimated Timeline"
                                            placeholder="e.g., 2-4 weeks, 1-3 months"
                                            error={!!errors.estimated_timeline}
                                            helperText={errors.estimated_timeline?.message}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Schedule />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Settings */}
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Display Settings
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Controller
                                    name="is_featured"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                />
                                            }
                                            label="Featured Service"
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Controller
                                    name="is_active"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                />
                                            }
                                            label="Active Service"
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Controller
                                    name="show_in_homepage"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                />
                                            }
                                            label="Show in Homepage"
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={handleCloseDialog} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46a1 100%)',
                                }
                            }}
                        >
                            {isSubmitting ? (
                                <CircularProgress size={20} />
                            ) : (
                                editingService ? 'Update Service' : 'Add Service'
                            )}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

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