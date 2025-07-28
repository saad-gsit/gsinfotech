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
    Fab,
    Badge,
    Paper,
    Skeleton
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    MoreVert,
    Visibility,
    Link,
    GitHub,
    Launch,
    Search,
    GridView,
    ViewList,
    Work,
    Upload,
    Image,
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
    Error as ErrorIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { projectsAPI } from '../../services/projectsAPI';
import { usePermissions } from './AuthGuard';

// Validation Schema
const projectSchema = yup.object({
    title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
    description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
    shortDescription: yup.string().max(500, 'Short description must be less than 500 characters'),
    category: yup.string().required('Category is required'),
    status: yup.string().required('Status is required'),
    technologies: yup.array().min(1, 'At least one technology is required'),
    projectUrl: yup.string().url('Must be a valid URL').nullable(),
    githubUrl: yup.string().url('Must be a valid URL').nullable(),
    client: yup.string(),
    startDate: yup.date().nullable(),
    endDate: yup.date().nullable().min(yup.ref('startDate'), 'End date must be after start date')
});

// Image Upload Component
const ImageUpload = ({ onImagesChange, existingImages = [] }) => {
    const [images, setImages] = useState(existingImages);
    const [uploading, setUploading] = useState(false);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        multiple: true,
        maxFiles: 10,
        maxSize: 5 * 1024 * 1024, // 5MB
        onDrop: async (acceptedFiles) => {
            setUploading(true);
            try {
                const formData = new FormData();
                acceptedFiles.forEach(file => {
                    formData.append('images', file);
                });

                // Simulate upload - replace with actual API call
                const uploadedImages = acceptedFiles.map(file => ({
                    id: Date.now() + Math.random(),
                    url: URL.createObjectURL(file),
                    name: file.name,
                    size: file.size
                }));

                const newImages = [...images, ...uploadedImages];
                setImages(newImages);
                onImagesChange(newImages);
            } catch (error) {
                console.error('Upload failed:', error);
            } finally {
                setUploading(false);
            }
        }
    });

    const removeImage = (imageId) => {
        const newImages = images.filter(img => img.id !== imageId);
        setImages(newImages);
        onImagesChange(newImages);
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
                <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                    {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    or click to select files (max 5MB each)
                </Typography>
                {uploading && <CircularProgress sx={{ mt: 2 }} />}
            </Paper>

            {images.length > 0 && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    {images.map((image) => (
                        <Grid item xs={6} sm={4} md={3} key={image.id}>
                            <Card>
                                <Box sx={{ position: 'relative' }}>
                                    <img
                                        src={image.url}
                                        alt={image.name}
                                        style={{
                                            width: '100%',
                                            height: 120,
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={() => removeImage(image.id)}
                                        sx={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 4,
                                            bgcolor: 'rgba(255,255,255,0.8)',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                                        }}
                                    >
                                        <Close fontSize="small" />
                                    </IconButton>
                                </Box>
                                <CardContent sx={{ p: 1 }}>
                                    <Typography variant="caption" noWrap>
                                        {image.name}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

const ProjectsManager = () => {
    // State management
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [bulkActionAnchor, setBulkActionAnchor] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', action: null });

    const { canWrite, canDelete } = usePermissions();

    // Form setup with React Hook Form
    const { control, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = useForm({
        resolver: yupResolver(projectSchema),
        defaultValues: {
            title: '',
            description: '',
            shortDescription: '',
            technologies: [],
            status: 'draft',
            category: '',
            client: '',
            projectUrl: '',
            githubUrl: '',
            startDate: '',
            endDate: '',
            featured: false,
            images: []
        }
    });

    const watchedImages = watch('images');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const response = await projectsAPI.getAllProjects();

            // Check if response has a data property with projects array
            let projectsData = [];

            if (Array.isArray(response)) {
                projectsData = response;
            } else if (response.data && Array.isArray(response.data)) {
                projectsData = response.data;
            } else if (response.data && response.data.projects && Array.isArray(response.data.projects)) {
                projectsData = response.data.projects;
            } else if (response.projects && Array.isArray(response.projects)) {
                projectsData = response.projects;
            } else {
                console.error('Unexpected response structure:', response);
                projectsData = [];
            }

            setProjects(projectsData);
        } catch (error) {
            console.error('Error loading projects:', error);
            showSnackbar('Failed to load projects', 'error');
            // Fallback to empty array instead of mock data
            setProjects([]);
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
    const handleOpenDialog = (project = null) => {
        if (project) {
            setEditingProject(project);
            reset({
                ...project,
                startDate: project.startDate ? project.startDate.split('T')[0] : '',
                endDate: project.endDate ? project.endDate.split('T')[0] : ''
            });
        } else {
            setEditingProject(null);
            reset({
                title: '',
                description: '',
                shortDescription: '',
                technologies: [],
                status: 'draft',
                category: '',
                client: '',
                projectUrl: '',
                githubUrl: '',
                startDate: '',
                endDate: '',
                featured: false,
                images: []
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingProject(null);
    };

    const onSubmit = async (data) => {
        try {
            if (editingProject) {
                await projectsAPI.updateProject(editingProject.id, data);
                setProjects(projects.map(p =>
                    p.id === editingProject.id ? { ...data, id: editingProject.id } : p
                ));
                showSnackbar('Project updated successfully');
            } else {
                const response = await projectsAPI.createProject(data);
                setProjects([response.data || { ...data, id: Date.now() }, ...projects]);
                showSnackbar('Project created successfully');
            }
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving project:', error);
            showSnackbar('Failed to save project', 'error');
        }
    };

    const handleDeleteProject = async (projectId) => {
        showConfirmDialog(
            'Delete Project',
            'Are you sure you want to delete this project? This action cannot be undone.',
            async () => {
                try {
                    await projectsAPI.deleteProject(projectId);
                    setProjects(projects.filter(p => p.id !== projectId));
                    showSnackbar('Project deleted successfully');
                } catch (error) {
                    console.error('Error deleting project:', error);
                    showSnackbar('Failed to delete project', 'error');
                }
            }
        );
        setAnchorEl(null);
    };

    const handleBulkAction = async (action) => {
        const count = selectedProjects.length;

        showConfirmDialog(
            `${action} ${count} Projects`,
            `Are you sure you want to ${action.toLowerCase()} ${count} selected project(s)?`,
            async () => {
                try {
                    if (action === 'Delete') {
                        await Promise.all(selectedProjects.map(id => projectsAPI.deleteProject(id)));
                        setProjects(projects.filter(p => !selectedProjects.includes(p.id)));
                    } else if (action === 'Publish') {
                        await Promise.all(selectedProjects.map(id =>
                            projectsAPI.updateProject(id, { status: 'published' })
                        ));
                        setProjects(projects.map(p =>
                            selectedProjects.includes(p.id) ? { ...p, status: 'published' } : p
                        ));
                    } else if (action === 'Archive') {
                        await Promise.all(selectedProjects.map(id =>
                            projectsAPI.updateProject(id, { status: 'archived' })
                        ));
                        setProjects(projects.map(p =>
                            selectedProjects.includes(p.id) ? { ...p, status: 'archived' } : p
                        ));
                    }
                    setSelectedProjects([]);
                    showSnackbar(`${count} project(s) ${action.toLowerCase()}ed successfully`);
                } catch (error) {
                    console.error(`Error ${action.toLowerCase()}ing projects:`, error);
                    showSnackbar(`Failed to ${action.toLowerCase()} projects`, 'error');
                }
            }
        );
        setBulkActionAnchor(null);
    };

    // Selection handlers
    const handleSelectProject = (projectId) => {
        setSelectedProjects(prev =>
            prev.includes(projectId)
                ? prev.filter(id => id !== projectId)
                : [...prev, projectId]
        );
    };

    const handleSelectAll = () => {
        setSelectedProjects(
            selectedProjects.length === filteredProjects.length
                ? []
                : filteredProjects.map(p => p.id)
        );
    };

    // Filter and search logic
    const filteredProjects = Array.isArray(projects) ? projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.technologies.some(tech =>
                tech.toLowerCase().includes(searchTerm.toLowerCase())
            );

        const matchesFilter = filterStatus === 'all' || project.status === filterStatus;

        return matchesSearch && matchesFilter;
    }) : [];

    // Status color mapping
    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'success';
            case 'draft': return 'warning';
            case 'archived': return 'error';
            default: return 'default';
        }
    };

    const availableTechnologies = [
        'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL',
        'MySQL', 'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C#', '.NET',
        'PHP', 'Laravel', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'SASS',
        'Tailwind CSS', 'Bootstrap', 'React Native', 'Flutter', 'Swift', 'Kotlin',
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Firebase'
    ];

    const categories = [
        'Web Development',
        'Mobile Development',
        'Desktop Application',
        'E-Commerce',
        'CMS',
        'API Development',
        'Data Science',
        'DevOps',
        'UI/UX Design'
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
                        Projects Manager
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your portfolio projects and showcase your work
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    {selectedProjects.length > 0 && (
                        <Badge badgeContent={selectedProjects.length} color="primary">
                            <Button
                                variant="outlined"
                                onClick={(e) => setBulkActionAnchor(e.currentTarget)}
                                startIcon={<DeleteSweep />}
                            >
                                Bulk Actions
                            </Button>
                        </Badge>
                    )}

                    {canWrite('projects') && (
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
                            Add Project
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
                                Total Projects
                            </Typography>
                            <Typography variant="h4">
                                {projects.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Published
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                {projects.filter(p => p.status === 'published').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Draft
                            </Typography>
                            <Typography variant="h4" color="warning.main">
                                {projects.filter(p => p.status === 'draft').length}
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
                                {projects.filter(p => p.featured).length}
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
                            placeholder="Search projects..."
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
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Filter by Status</InputLabel>
                            <Select
                                value={filterStatus}
                                label="Filter by Status"
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="published">Published</MenuItem>
                                <MenuItem value="draft">Draft</MenuItem>
                                <MenuItem value="archived">Archived</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Tooltip title="Select All">
                                <Checkbox
                                    checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                                    indeterminate={selectedProjects.length > 0 && selectedProjects.length < filteredProjects.length}
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
                            {filteredProjects.length} project(s)
                        </Typography>
                    </Grid>
                </Grid>
            </Card>

            {/* Projects Grid */}
            <Grid container spacing={3}>
                <AnimatePresence>
                    {filteredProjects.map((project) => (
                        <Grid item xs={12} sm={6} lg={4} key={project.id}>
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
                                        border: selectedProjects.includes(project.id) ? 2 : 1,
                                        borderColor: selectedProjects.includes(project.id) ? 'primary.main' : 'divider',
                                        '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.2s' }
                                    }}
                                >
                                    {/* Selection Checkbox */}
                                    <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
                                        <Checkbox
                                            checked={selectedProjects.includes(project.id)}
                                            onChange={() => handleSelectProject(project.id)}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.8)' }}
                                        />
                                    </Box>

                                    {project.images && project.images.length > 0 && (
                                        <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                                            <img
                                                src={project.images[0]}
                                                alt={project.title}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            {project.featured && (
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
                                        </Box>
                                    )}

                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                            <Typography variant="h6" component="h2" gutterBottom>
                                                {project.title}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    setAnchorEl(e.currentTarget);
                                                    setSelectedProject(project);
                                                }}
                                            >
                                                <MoreVert />
                                            </IconButton>
                                        </Box>

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {project.shortDescription || project.description?.substring(0, 100) + '...'}
                                        </Typography>

                                        <Box sx={{ mb: 2 }}>
                                            <Chip
                                                label={project.status.replace('-', ' ')}
                                                size="small"
                                                color={getStatusColor(project.status)}
                                                sx={{ mr: 1, mb: 1 }}
                                            />
                                            <Chip
                                                label={project.category}
                                                size="small"
                                                variant="outlined"
                                                sx={{ mb: 1 }}
                                            />
                                        </Box>

                                        <Box sx={{ mb: 2 }}>
                                            {project.technologies.slice(0, 3).map((tech, index) => (
                                                <Chip
                                                    key={index}
                                                    label={tech}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ mr: 0.5, mb: 0.5, fontSize: '0.75rem' }}
                                                />
                                            ))}
                                            {project.technologies.length > 3 && (
                                                <Chip
                                                    label={`+${project.technologies.length - 3}`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ mr: 0.5, mb: 0.5, fontSize: '0.75rem' }}
                                                />
                                            )}
                                        </Box>

                                        {project.client && (
                                            <Typography variant="body2" color="text.secondary">
                                                Client: {project.client}
                                            </Typography>
                                        )}
                                    </CardContent>

                                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                                        <Box>
                                            {project.projectUrl && (
                                                <IconButton size="small" href={project.projectUrl} target="_blank">
                                                    <Launch />
                                                </IconButton>
                                            )}
                                            {project.githubUrl && (
                                                <IconButton size="small" href={project.githubUrl} target="_blank">
                                                    <GitHub />
                                                </IconButton>
                                            )}
                                        </Box>

                                        {canWrite('projects') && (
                                            <Button
                                                size="small"
                                                onClick={() => handleOpenDialog(project)}
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
            {filteredProjects.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Work sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No projects found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {searchTerm || filterStatus !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Get started by adding your first project'
                        }
                    </Typography>
                    {!searchTerm && filterStatus === 'all' && canWrite('projects') && (
                        <Button
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={() => handleOpenDialog()}
                        >
                            Add Your First Project
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
                {canWrite('projects') && (
                    <MenuOption onClick={() => {
                        handleOpenDialog(selectedProject);
                        setAnchorEl(null);
                    }}>
                        <Edit sx={{ mr: 1 }} />
                        Edit
                    </MenuOption>
                )}
                <MenuOption onClick={() => {
                    // View project details - you can implement a view modal
                    setAnchorEl(null);
                }}>
                    <Visibility sx={{ mr: 1 }} />
                    View Details
                </MenuOption>
                {canDelete('projects') && (
                    <MenuOption
                        onClick={() => {
                            handleDeleteProject(selectedProject?.id);
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
                <MenuOption onClick={() => handleBulkAction('Publish')}>
                    <Publish sx={{ mr: 1 }} />
                    Publish Selected
                </MenuOption>
                <MenuOption onClick={() => handleBulkAction('Archive')}>
                    <Archive sx={{ mr: 1 }} />
                    Archive Selected
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
                        {editingProject ? 'Edit Project' : 'Add New Project'}
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            {/* Basic Information */}
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    Basic Information
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={8}>
                                <Controller
                                    name="title"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Project Title"
                                            error={!!errors.title}
                                            helperText={errors.title?.message}
                                            required
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Controller
                                    name="client"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Client"
                                            error={!!errors.client}
                                            helperText={errors.client?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Controller
                                    name="shortDescription"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Short Description"
                                            error={!!errors.shortDescription}
                                            helperText={errors.shortDescription?.message || 'Brief summary for cards'}
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

                            {/* Project Details */}
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Project Details
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
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
                                                {categories.map((category) => (
                                                    <MenuItem key={category} value={category}>
                                                        {category}
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

                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.status}>
                                            <InputLabel>Status</InputLabel>
                                            <Select
                                                {...field}
                                                label="Status"
                                            >
                                                <MenuItem value="draft">Draft</MenuItem>
                                                <MenuItem value="published">Published</MenuItem>
                                                <MenuItem value="archived">Archived</MenuItem>
                                            </Select>
                                        </FormControl>
                                    )}
                                />
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

                            {/* URLs */}
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Links
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="projectUrl"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Project URL"
                                            type="url"
                                            error={!!errors.projectUrl}
                                            helperText={errors.projectUrl?.message}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Launch />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="githubUrl"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="GitHub URL"
                                            type="url"
                                            error={!!errors.githubUrl}
                                            helperText={errors.githubUrl?.message}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <GitHub />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Dates */}
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Timeline
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="startDate"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Start Date"
                                            type="date"
                                            InputLabelProps={{ shrink: true }}
                                            error={!!errors.startDate}
                                            helperText={errors.startDate?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="endDate"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="End Date"
                                            type="date"
                                            InputLabelProps={{ shrink: true }}
                                            error={!!errors.endDate}
                                            helperText={errors.endDate?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Settings */}
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Settings
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Controller
                                    name="featured"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                />
                                            }
                                            label="Featured Project"
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Image Upload */}
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Project Images
                                </Typography>
                                <ImageUpload
                                    onImagesChange={(images) => setValue('images', images)}
                                    existingImages={watchedImages}
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
                                editingProject ? 'Update Project' : 'Add Project'
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

export default ProjectsManager;