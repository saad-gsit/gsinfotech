// Updated ProjectsManager.jsx - Clean and Modular
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
    IconButton,
    Menu,
    MenuItem as MenuOption,
    CircularProgress,
    InputAdornment,
    Alert,
    Snackbar,
    Checkbox,
    Divider,
    Tooltip,
    Badge,
    Paper,
    Skeleton,
    Stack,
    Avatar,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    MoreVert,
    Visibility,
    Launch,
    GitHub,
    Search,
    GridView,
    ViewList,
    Work,
    SelectAll,
    DeleteSweep,
    Publish,
    Archive,
    Check,
    Warning,
    Star,
    Business,
    DateRange,
    FilterList
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { projectsAPI } from '../../services/projectsAPI';
import ProjectForm from '../Forms/ProjectForm';

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
    const [filterCategory, setFilterCategory] = useState('all');
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [bulkActionAnchor, setBulkActionAnchor] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', action: null });
    const [formLoading, setFormLoading] = useState(false);
    const [projectStats, setProjectStats] = useState({
        total: 0,
        published: 0,
        draft: 0,
        featured: 0
    });

    // Categories for filtering
    const categories = [
        { value: 'web_application', label: 'Web Application' },
        { value: 'mobile_application', label: 'Mobile Application' },
        { value: 'desktop_application', label: 'Desktop Application' },
        { value: 'e_commerce', label: 'E-Commerce' },
        { value: 'cms', label: 'CMS' },
        { value: 'api', label: 'API Development' }
    ];

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        updateProjectStats();
    }, [projects]);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const response = await projectsAPI.getAllProjects({ status: 'all' });

            let projectsData = [];
            if (Array.isArray(response)) {
                projectsData = response;
            } else if (response.data && Array.isArray(response.data)) {
                projectsData = response.data;
            } else if (response.projects && Array.isArray(response.projects)) {
                projectsData = response.projects;
            }

            console.log('Loaded projects:', projectsData);
            setProjects(projectsData);
        } catch (error) {
            console.error('Error loading projects:', error);
            showSnackbar('Failed to load projects', 'error');
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const updateProjectStats = () => {
        setProjectStats({
            total: projects.length,
            published: projects.filter(p => p.status === 'published').length,
            draft: projects.filter(p => p.status === 'draft').length,
            featured: projects.filter(p => p.featured).length
        });
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const showConfirmDialog = (title, message, action) => {
        setConfirmDialog({ open: true, title, message, action });
    };

    const handleOpenDialog = (project = null) => {
        setEditingProject(project);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingProject(null);
        setFormLoading(false);
    };

    const handleFormSubmit = async (formData, imagesToUpload) => {
        try {
            setFormLoading(true);
            console.log('Form data submitted:', formData);
            console.log('Images to upload:', imagesToUpload);

            if (editingProject) {
                // Update existing project
                const response = await projectsAPI.updateProject(
                    editingProject.id,
                    formData,
                    imagesToUpload
                );
                console.log('Update response:', response);

                setProjects(projects.map(p =>
                    p.id === editingProject.id
                        ? { ...response.project || response.data || formData, id: editingProject.id }
                        : p
                ));
                showSnackbar('Project updated successfully');
            } else {
                // Create new project
                const response = await projectsAPI.createProject(formData, imagesToUpload);
                console.log('Create response:', response);

                const newProject = response.project || response.data || { ...formData, id: Date.now() };
                setProjects([newProject, ...projects]);
                showSnackbar('Project created successfully');
            }

            handleCloseDialog();

            // Refresh projects list after a short delay
            setTimeout(() => {
                loadProjects();
            }, 1000);

        } catch (error) {
            console.error('Error saving project:', error);
            console.error('Error details:', error.response?.data);

            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Failed to save project';
            showSnackbar(errorMessage, 'error');
        } finally {
            setFormLoading(false);
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

    const filteredProjects = Array.isArray(projects) ? projects.filter(project => {
        const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (project.technologies || []).some(tech =>
                tech.toLowerCase().includes(searchTerm.toLowerCase())
            );

        const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
        const matchesCategory = filterCategory === 'all' || project.category === filterCategory;

        return matchesSearch && matchesStatus && matchesCategory;
    }) : [];

    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'success';
            case 'draft': return 'warning';
            case 'archived': return 'error';
            default: return 'default';
        }
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
                </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: 'primary.50' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <Work />
                            </Avatar>
                            <Box>
                                <Typography color="text.secondary" variant="body2">
                                    Total Projects
                                </Typography>
                                <Typography variant="h4">
                                    {projectStats.total}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: 'success.50' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'success.main' }}>
                                <Check />
                            </Avatar>
                            <Box>
                                <Typography color="text.secondary" variant="body2">
                                    Published
                                </Typography>
                                <Typography variant="h4" color="success.main">
                                    {projectStats.published}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: 'warning.50' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'warning.main' }}>
                                <Edit />
                            </Avatar>
                            <Box>
                                <Typography color="text.secondary" variant="body2">
                                    Draft
                                </Typography>
                                <Typography variant="h4" color="warning.main">
                                    {projectStats.draft}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: 'info.50' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'info.main' }}>
                                <Star />
                            </Avatar>
                            <Box>
                                <Typography color="text.secondary" variant="body2">
                                    Featured
                                </Typography>
                                <Typography variant="h4" color="info.main">
                                    {projectStats.featured}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters and Search */}
            <Card sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3} alignItems="center">
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
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filterStatus}
                                label="Status"
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="published">Published</MenuItem>
                                <MenuItem value="draft">Draft</MenuItem>
                                <MenuItem value="archived">Archived</MenuItem>
                            </Select>
                        </FormControl>
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
                                {categories.map((category) => (
                                    <MenuItem key={category.value} value={category.value}>
                                        {category.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
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
                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
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
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            transition: 'all 0.2s',
                                            boxShadow: 4
                                        }
                                    }}
                                >
                                    {/* Selection Checkbox */}
                                    <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
                                        <Checkbox
                                            checked={selectedProjects.includes(project.id)}
                                            onChange={() => handleSelectProject(project.id)}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1 }}
                                        />
                                    </Box>

                                    {/* Project Image */}
                                    {project.featured_image && (
                                        <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                                            <img
                                                src={project.featured_image}
                                                alt={project.title}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            {project.featured && (
                                                <Chip
                                                    icon={<Star />}
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

                                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
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

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                                            {project.short_description || project.description?.substring(0, 100) + '...'}
                                        </Typography>

                                        <Box sx={{ mb: 2 }}>
                                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                                <Chip
                                                    label={project.status?.replace('_', ' ')}
                                                    size="small"
                                                    color={getStatusColor(project.status)}
                                                />
                                                <Chip
                                                    label={project.category?.replace('_', ' ')}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Stack>
                                        </Box>

                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                                Technologies:
                                            </Typography>
                                            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                                {(project.technologies || []).slice(0, 3).map((tech, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={tech}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ fontSize: '0.75rem', height: 24 }}
                                                    />
                                                ))}
                                                {(project.technologies || []).length > 3 && (
                                                    <Chip
                                                        label={`+${project.technologies.length - 3}`}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ fontSize: '0.75rem', height: 24 }}
                                                    />
                                                )}
                                            </Stack>
                                        </Box>

                                        {(project.client_name || project.client) && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                <Business sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                                Client: {project.client_name || project.client}
                                            </Typography>
                                        )}

                                        {project.completion_date && (
                                            <Typography variant="body2" color="text.secondary">
                                                <DateRange sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                                Completed: {new Date(project.completion_date).toLocaleDateString()}
                                            </Typography>
                                        )}
                                    </CardContent>

                                    <CardActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
                                        <Box>
                                            {project.project_url && (
                                                <Tooltip title="View Live Project">
                                                    <IconButton size="small" href={project.project_url} target="_blank">
                                                        <Launch />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {project.github_url && (
                                                <Tooltip title="View Source Code">
                                                    <IconButton size="small" href={project.github_url} target="_blank">
                                                        <GitHub />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>

                                        <Button
                                            size="small"
                                            onClick={() => handleOpenDialog(project)}
                                            startIcon={<Edit />}
                                            variant="contained"
                                            sx={{ minWidth: 100 }}
                                        >
                                            Edit
                                        </Button>
                                    </CardActions>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </AnimatePresence>
            </Grid>

            {/* Empty State */}
            {filteredProjects.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 3, bgcolor: 'grey.100' }}>
                        <Work sx={{ fontSize: 40, color: 'grey.400' }} />
                    </Avatar>
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                        No projects found
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Get started by adding your first project'
                        }
                    </Typography>
                    {!searchTerm && filterStatus === 'all' && filterCategory === 'all' && (
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
                            Add Your First Project
                        </Button>
                    )}
                </Box>
            )}

            {/* Project Form Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="xl"
                fullWidth
                PaperProps={{
                    sx: {
                        height: '95vh',
                        maxHeight: '95vh'
                    }
                }}
            >
                <ProjectForm
                    project={editingProject}
                    mode={editingProject ? 'edit' : 'create'}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCloseDialog}
                    isLoading={formLoading}
                />
            </Dialog>

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                <MenuOption onClick={() => {
                    handleOpenDialog(selectedProject);
                    setAnchorEl(null);
                }}>
                    <Edit sx={{ mr: 1 }} />
                    Edit Project
                </MenuOption>
                <MenuOption onClick={() => {
                    window.open(`/projects/${selectedProject?.id}`, '_blank');
                    setAnchorEl(null);
                }}>
                    <Visibility sx={{ mr: 1 }} />
                    View Details
                </MenuOption>
                <MenuOption onClick={() => {
                    if (selectedProject?.project_url) {
                        window.open(selectedProject.project_url, '_blank');
                    }
                    setAnchorEl(null);
                }} disabled={!selectedProject?.project_url}>
                    <Launch sx={{ mr: 1 }} />
                    Open Live Site
                </MenuOption>
                <Divider />
                <MenuOption
                    onClick={() => {
                        handleDeleteProject(selectedProject?.id);
                    }}
                    sx={{ color: 'error.main' }}
                >
                    <Delete sx={{ mr: 1 }} />
                    Delete Project
                </MenuOption>
            </Menu>

            {/* Bulk Actions Menu */}
            <Menu
                anchorEl={bulkActionAnchor}
                open={Boolean(bulkActionAnchor)}
                onClose={() => setBulkActionAnchor(null)}
            >
                <MenuOption onClick={() => handleBulkAction('Publish')}>
                    <Publish sx={{ mr: 1 }} />
                    Publish Selected ({selectedProjects.length})
                </MenuOption>
                <MenuOption onClick={() => handleBulkAction('Archive')}>
                    <Archive sx={{ mr: 1 }} />
                    Archive Selected ({selectedProjects.length})
                </MenuOption>
                <Divider />
                <MenuOption
                    onClick={() => handleBulkAction('Delete')}
                    sx={{ color: 'error.main' }}
                >
                    <Delete sx={{ mr: 1 }} />
                    Delete Selected ({selectedProjects.length})
                </MenuOption>
            </Menu>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
                maxWidth="sm"
                fullWidth
            >
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Warning color="warning" />
                        <Typography variant="h6">
                            {confirmDialog.title}
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        {confirmDialog.message}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
                            variant="outlined"
                        >
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
                    </Box>
                </Box>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ProjectsManager;