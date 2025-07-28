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
    Avatar,
    Link
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    MoreVert,
    Visibility,
    Person,
    Email,
    Phone,
    LinkedIn,
    GitHub,
    Twitter,
    Language,
    Work,
    Search,
    GridView,
    ViewList,
    Groups,
    Upload,
    Close,
    SelectAll,
    DeleteSweep,
    PersonAdd,
    FilterList,
    Sort,
    CloudUpload,
    Check,
    Warning,
    Error as ErrorIcon,
    BusinessCenter,
    Star,
    StarBorder
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { teamAPI } from '../../services/teamAPI';
import { usePermissions } from './AuthGuard';

// Validation Schema
const teamMemberSchema = yup.object({
    name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
    position: yup.string().required('Position is required'),
    department: yup.string().required('Department is required'),
    email: yup.string().email('Invalid email format').nullable(),
    phone: yup.string().nullable(),
    bio: yup.string().max(1000, 'Bio must be less than 1000 characters'),
    short_bio: yup.string().max(200, 'Short bio must be less than 200 characters'),
    expertise_level: yup.string().required('Expertise level is required'),
    years_experience: yup.number().min(0, 'Experience cannot be negative').max(50, 'Experience cannot exceed 50 years').nullable(),
    skills: yup.array().min(1, 'At least one skill is required'),
    hire_date: yup.date().nullable()
});

// Photo Upload Component
const PhotoUpload = ({ onPhotoChange, existingPhoto = null }) => {
    const [photo, setPhoto] = useState(existingPhoto);
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
                const photoUrl = URL.createObjectURL(file);
                setPhoto(photoUrl);
                onPhotoChange(file);
            } catch (error) {
                console.error('Upload failed:', error);
            } finally {
                setUploading(false);
            }
        }
    });

    const removePhoto = () => {
        setPhoto(null);
        onPhotoChange(null);
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
                {photo ? (
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Avatar
                            src={photo}
                            sx={{ width: 120, height: 120, mb: 2 }}
                        />
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                removePhoto();
                            }}
                            sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
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
                            {isDragActive ? 'Drop photo here' : 'Upload team member photo'}
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

const TeamManager = () => {
    // State management
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('all');
    const [filterExpertise, setFilterExpertise] = useState('all');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [bulkActionAnchor, setBulkActionAnchor] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', action: null });
    const [uploadedPhoto, setUploadedPhoto] = useState(null);

    const { canWrite, canDelete } = usePermissions();

    // Form setup with React Hook Form
    const { control, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = useForm({
        resolver: yupResolver(teamMemberSchema),
        defaultValues: {
            name: '',
            position: '',
            department: '',
            email: '',
            phone: '',
            bio: '',
            short_bio: '',
            expertise_level: 'mid',
            years_experience: '',
            skills: [],
            hire_date: '',
            is_featured: false,
            is_active: true,
            show_in_about: true,
            social_links: {
                linkedin: '',
                github: '',
                twitter: '',
                portfolio: '',
                behance: '',
                dribbble: ''
            }
        }
    });

    useEffect(() => {
        loadTeamMembers();
    }, []);

    const loadTeamMembers = async () => {
        try {
            setLoading(true);
            const response = await teamAPI.getAllTeamMembers();

            let membersData = [];
            if (Array.isArray(response)) {
                membersData = response;
            } else if (response.data && Array.isArray(response.data)) {
                membersData = response.data;
            } else if (response.members && Array.isArray(response.members)) {
                membersData = response.members;
            } else {
                console.error('Unexpected response structure:', response);
                membersData = [];
            }

            setTeamMembers(membersData);
        } catch (error) {
            console.error('Error loading team members:', error);
            showSnackbar('Failed to load team members', 'error');
            setTeamMembers([]);
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
    const handleOpenDialog = (member = null) => {
        if (member) {
            setEditingMember(member);
            reset({
                ...member,
                hire_date: member.hire_date ? member.hire_date.split('T')[0] : '',
                social_links: member.social_links || {
                    linkedin: '',
                    github: '',
                    twitter: '',
                    portfolio: '',
                    behance: '',
                    dribbble: ''
                }
            });
        } else {
            setEditingMember(null);
            reset({
                name: '',
                position: '',
                department: '',
                email: '',
                phone: '',
                bio: '',
                short_bio: '',
                expertise_level: 'mid',
                years_experience: '',
                skills: [],
                hire_date: '',
                is_featured: false,
                is_active: true,
                show_in_about: true,
                social_links: {
                    linkedin: '',
                    github: '',
                    twitter: '',
                    portfolio: '',
                    behance: '',
                    dribbble: ''
                }
            });
        }
        setUploadedPhoto(null);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingMember(null);
        setUploadedPhoto(null);
    };

    const onSubmit = async (data) => {
        try {
            if (editingMember) {
                await teamAPI.updateTeamMember(editingMember.id, data, uploadedPhoto);
                setTeamMembers(teamMembers.map(m =>
                    m.id === editingMember.id ? { ...data, id: editingMember.id } : m
                ));
                showSnackbar('Team member updated successfully');
            } else {
                const response = await teamAPI.createTeamMember(data, uploadedPhoto);
                setTeamMembers([response.member || { ...data, id: Date.now() }, ...teamMembers]);
                showSnackbar('Team member added successfully');
            }
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving team member:', error);
            showSnackbar('Failed to save team member', 'error');
        }
    };

    const handleDeleteMember = async (memberId) => {
        showConfirmDialog(
            'Delete Team Member',
            'Are you sure you want to delete this team member? This action cannot be undone.',
            async () => {
                try {
                    await teamAPI.deleteTeamMember(memberId);
                    setTeamMembers(teamMembers.filter(m => m.id !== memberId));
                    showSnackbar('Team member deleted successfully');
                } catch (error) {
                    console.error('Error deleting team member:', error);
                    showSnackbar('Failed to delete team member', 'error');
                }
            }
        );
        setAnchorEl(null);
    };

    const handleBulkAction = async (action) => {
        const count = selectedMembers.length;

        showConfirmDialog(
            `${action} ${count} Team Members`,
            `Are you sure you want to ${action.toLowerCase()} ${count} selected team member(s)?`,
            async () => {
                try {
                    if (action === 'Delete') {
                        await Promise.all(selectedMembers.map(id => teamAPI.deleteTeamMember(id)));
                        setTeamMembers(teamMembers.filter(m => !selectedMembers.includes(m.id)));
                    } else if (action === 'Activate') {
                        await Promise.all(selectedMembers.map(id =>
                            teamAPI.updateTeamMember(id, { is_active: true })
                        ));
                        setTeamMembers(teamMembers.map(m =>
                            selectedMembers.includes(m.id) ? { ...m, is_active: true } : m
                        ));
                    } else if (action === 'Deactivate') {
                        await Promise.all(selectedMembers.map(id =>
                            teamAPI.updateTeamMember(id, { is_active: false })
                        ));
                        setTeamMembers(teamMembers.map(m =>
                            selectedMembers.includes(m.id) ? { ...m, is_active: false } : m
                        ));
                    }
                    setSelectedMembers([]);
                    showSnackbar(`${count} team member(s) ${action.toLowerCase()}ed successfully`);
                } catch (error) {
                    console.error(`Error ${action.toLowerCase()}ing team members:`, error);
                    showSnackbar(`Failed to ${action.toLowerCase()} team members`, 'error');
                }
            }
        );
        setBulkActionAnchor(null);
    };

    // Selection handlers
    const handleSelectMember = (memberId) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleSelectAll = () => {
        setSelectedMembers(
            selectedMembers.length === filteredMembers.length
                ? []
                : filteredMembers.map(m => m.id)
        );
    };

    // Filter and search logic
    const filteredMembers = Array.isArray(teamMembers) ? teamMembers.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (member.skills && member.skills.some(skill =>
                skill.toLowerCase().includes(searchTerm.toLowerCase())
            ));

        const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;
        const matchesExpertise = filterExpertise === 'all' || member.expertise_level === filterExpertise;

        return matchesSearch && matchesDepartment && matchesExpertise;
    }) : [];

    const availableSkills = [
        'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java', 'C#', 'PHP',
        'JavaScript', 'TypeScript', 'HTML', 'CSS', 'SASS', 'MongoDB', 'PostgreSQL',
        'MySQL', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'DevOps', 'UI/UX Design',
        'Figma', 'Adobe Creative Suite', 'Project Management', 'Agile', 'Scrum'
    ];

    const departments = [
        'Engineering',
        'Design',
        'Product',
        'Marketing',
        'Sales',
        'Operations',
        'HR',
        'Finance'
    ];

    const expertiseLevels = [
        { value: 'junior', label: 'Junior' },
        { value: 'mid', label: 'Mid-Level' },
        { value: 'senior', label: 'Senior' },
        { value: 'lead', label: 'Lead' },
        { value: 'architect', label: 'Architect' }
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
                        Team Manager
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your team members and showcase your talent
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    {selectedMembers.length > 0 && (
                        <Badge badgeContent={selectedMembers.length} color="primary">
                            <Button
                                variant="outlined"
                                onClick={(e) => setBulkActionAnchor(e.currentTarget)}
                                startIcon={<DeleteSweep />}
                            >
                                Bulk Actions
                            </Button>
                        </Badge>
                    )}

                    {canWrite('team') && (
                        <Button
                            variant="contained"
                            startIcon={<PersonAdd />}
                            onClick={() => handleOpenDialog()}
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46a1 100%)',
                                }
                            }}
                        >
                            Add Team Member
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
                                Total Members
                            </Typography>
                            <Typography variant="h4">
                                {teamMembers.length}
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
                                {teamMembers.filter(m => m.is_active).length}
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
                                {teamMembers.filter(m => m.is_featured).length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Departments
                            </Typography>
                            <Typography variant="h4" color="warning.main">
                                {new Set(teamMembers.map(m => m.department)).size}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters and Search */}
            <Card sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            placeholder="Search team members..."
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
                            <InputLabel>Department</InputLabel>
                            <Select
                                value={filterDepartment}
                                label="Department"
                                onChange={(e) => setFilterDepartment(e.target.value)}
                            >
                                <MenuItem value="all">All</MenuItem>
                                {departments.map((dept) => (
                                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Expertise</InputLabel>
                            <Select
                                value={filterExpertise}
                                label="Expertise"
                                onChange={(e) => setFilterExpertise(e.target.value)}
                            >
                                <MenuItem value="all">All</MenuItem>
                                {expertiseLevels.map((level) => (
                                    <MenuItem key={level.value} value={level.value}>
                                        {level.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Tooltip title="Select All">
                                <Checkbox
                                    checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                                    indeterminate={selectedMembers.length > 0 && selectedMembers.length < filteredMembers.length}
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
                            {filteredMembers.length} member(s)
                        </Typography>
                    </Grid>
                </Grid>
            </Card>

            {/* Team Members Grid */}
            <Grid container spacing={3}>
                <AnimatePresence>
                    {filteredMembers.map((member) => (
                        <Grid item xs={12} sm={6} lg={4} key={member.id}>
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
                                        border: selectedMembers.includes(member.id) ? 2 : 1,
                                        borderColor: selectedMembers.includes(member.id) ? 'primary.main' : 'divider',
                                        '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.2s' }
                                    }}
                                >
                                    {/* Selection Checkbox */}
                                    <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
                                        <Checkbox
                                            checked={selectedMembers.includes(member.id)}
                                            onChange={() => handleSelectMember(member.id)}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.8)' }}
                                        />
                                    </Box>

                                    {/* Featured Badge */}
                                    {member.is_featured && (
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

                                    <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 6 }}>
                                        {/* Profile Photo */}
                                        <Avatar
                                            src={member.profile_image || member.photo}
                                            sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                                        >
                                            {member.name.charAt(0)}
                                        </Avatar>

                                        {/* Menu Button */}
                                        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    setAnchorEl(e.currentTarget);
                                                    setSelectedMember(member);
                                                }}
                                            >
                                                <MoreVert />
                                            </IconButton>
                                        </Box>

                                        {/* Member Info */}
                                        <Typography variant="h6" gutterBottom>
                                            {member.name}
                                        </Typography>

                                        <Typography variant="body1" color="primary" gutterBottom>
                                            {member.position}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {member.department}
                                        </Typography>

                                        {member.short_bio && (
                                            <Typography variant="body2" sx={{ mb: 2 }}>
                                                {member.short_bio}
                                            </Typography>
                                        )}

                                        {/* Status Badges */}
                                        <Box sx={{ mb: 2 }}>
                                            <Chip
                                                label={member.expertise_level}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ mr: 1, mb: 1 }}
                                            />
                                            <Chip
                                                label={member.is_active ? 'Active' : 'Inactive'}
                                                size="small"
                                                color={member.is_active ? 'success' : 'error'}
                                                sx={{ mb: 1 }}
                                            />
                                        </Box>

                                        {/* Skills */}
                                        {member.skills && member.skills.length > 0 && (
                                            <Box sx={{ mb: 2 }}>
                                                {member.skills.slice(0, 3).map((skill, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={skill}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ mr: 0.5, mb: 0.5, fontSize: '0.75rem' }}
                                                    />
                                                ))}
                                                {member.skills.length > 3 && (
                                                    <Chip
                                                        label={`+${member.skills.length - 3}`}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ mr: 0.5, mb: 0.5, fontSize: '0.75rem' }}
                                                    />
                                                )}
                                            </Box>
                                        )}

                                        {/* Experience */}
                                        {member.years_experience && (
                                            <Typography variant="body2" color="text.secondary">
                                                {member.years_experience} years experience
                                            </Typography>
                                        )}
                                    </CardContent>

                                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                                        {/* Social Links */}
                                        <Box>
                                            {member.social_links?.linkedin && (
                                                <IconButton size="small" href={member.social_links.linkedin} target="_blank">
                                                    <LinkedIn />
                                                </IconButton>
                                            )}
                                            {member.social_links?.github && (
                                                <IconButton size="small" href={member.social_links.github} target="_blank">
                                                    <GitHub />
                                                </IconButton>
                                            )}
                                            {member.social_links?.twitter && (
                                                <IconButton size="small" href={member.social_links.twitter} target="_blank">
                                                    <Twitter />
                                                </IconButton>
                                            )}
                                            {member.email && (
                                                <IconButton size="small" href={`mailto:${member.email}`}>
                                                    <Email />
                                                </IconButton>
                                            )}
                                        </Box>

                                        {canWrite('team') && (
                                            <Button
                                                size="small"
                                                onClick={() => handleOpenDialog(member)}
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
            {filteredMembers.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Groups sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No team members found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {searchTerm || filterDepartment !== 'all' || filterExpertise !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Get started by adding your first team member'
                        }
                    </Typography>
                    {!searchTerm && filterDepartment === 'all' && filterExpertise === 'all' && canWrite('team') && (
                        <Button
                            variant="outlined"
                            startIcon={<PersonAdd />}
                            onClick={() => handleOpenDialog()}
                        >
                            Add Your First Team Member
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
                {canWrite('team') && (
                    <MenuOption onClick={() => {
                        handleOpenDialog(selectedMember);
                        setAnchorEl(null);
                    }}>
                        <Edit sx={{ mr: 1 }} />
                        Edit
                    </MenuOption>
                )}
                <MenuOption onClick={() => {
                    // View member details - you can implement a view modal
                    setAnchorEl(null);
                }}>
                    <Visibility sx={{ mr: 1 }} />
                    View Details
                </MenuOption>
                {canDelete('team') && (
                    <MenuOption
                        onClick={() => {
                            handleDeleteMember(selectedMember?.id);
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
                    <Check sx={{ mr: 1 }} />
                    Activate Selected
                </MenuOption>
                <MenuOption onClick={() => handleBulkAction('Deactivate')}>
                    <Close sx={{ mr: 1 }} />
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
                        {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            {/* Photo Upload */}
                            <Grid item xs={12} md={4}>
                                <Typography variant="h6" gutterBottom>
                                    Profile Photo
                                </Typography>
                                <PhotoUpload
                                    onPhotoChange={setUploadedPhoto}
                                    existingPhoto={editingMember?.profile_image || editingMember?.photo}
                                />
                            </Grid>

                            {/* Basic Information */}
                            <Grid item xs={12} md={8}>
                                <Typography variant="h6" gutterBottom>
                                    Basic Information
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Controller
                                            name="name"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    label="Full Name"
                                                    error={!!errors.name}
                                                    helperText={errors.name?.message}
                                                    required
                                                />
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Controller
                                            name="position"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    label="Position/Title"
                                                    error={!!errors.position}
                                                    helperText={errors.position?.message}
                                                    required
                                                />
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Controller
                                            name="department"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl fullWidth error={!!errors.department}>
                                                    <InputLabel>Department</InputLabel>
                                                    <Select
                                                        {...field}
                                                        label="Department"
                                                    >
                                                        {departments.map((dept) => (
                                                            <MenuItem key={dept} value={dept}>
                                                                {dept}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    {errors.department && (
                                                        <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                                                            {errors.department.message}
                                                        </Typography>
                                                    )}
                                                </FormControl>
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Controller
                                            name="expertise_level"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl fullWidth error={!!errors.expertise_level}>
                                                    <InputLabel>Expertise Level</InputLabel>
                                                    <Select
                                                        {...field}
                                                        label="Expertise Level"
                                                    >
                                                        {expertiseLevels.map((level) => (
                                                            <MenuItem key={level.value} value={level.value}>
                                                                {level.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Controller
                                            name="years_experience"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    label="Years of Experience"
                                                    type="number"
                                                    error={!!errors.years_experience}
                                                    helperText={errors.years_experience?.message}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Controller
                                            name="hire_date"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    fullWidth
                                                    label="Hire Date"
                                                    type="date"
                                                    InputLabelProps={{ shrink: true }}
                                                    error={!!errors.hire_date}
                                                    helperText={errors.hire_date?.message}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Contact Information */}
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Contact Information
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Email Address"
                                            type="email"
                                            error={!!errors.email}
                                            helperText={errors.email?.message}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Email />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Phone Number"
                                            error={!!errors.phone}
                                            helperText={errors.phone?.message}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Phone />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Bio Information */}
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Bio Information
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Controller
                                    name="short_bio"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Short Bio"
                                            error={!!errors.short_bio}
                                            helperText={errors.short_bio?.message || 'Brief summary for cards (max 200 characters)'}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Controller
                                    name="bio"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Full Bio"
                                            multiline
                                            rows={4}
                                            error={!!errors.bio}
                                            helperText={errors.bio?.message || 'Detailed biography'}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Skills */}
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Skills & Expertise
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Controller
                                    name="skills"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.skills}>
                                            <InputLabel>Skills</InputLabel>
                                            <Select
                                                {...field}
                                                multiple
                                                input={<OutlinedInput label="Skills" />}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((value) => (
                                                            <Chip key={value} label={value} size="small" />
                                                        ))}
                                                    </Box>
                                                )}
                                            >
                                                {availableSkills.map((skill) => (
                                                    <MenuItem key={skill} value={skill}>
                                                        <Checkbox checked={field.value.indexOf(skill) > -1} />
                                                        <ListItemText primary={skill} />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.skills && (
                                                <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                                                    {errors.skills.message}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    )}
                                />
                            </Grid>

                            {/* Social Links */}
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Social Media Links
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="social_links.linkedin"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="LinkedIn URL"
                                            type="url"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LinkedIn />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="social_links.github"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="GitHub URL"
                                            type="url"
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

                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="social_links.twitter"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Twitter URL"
                                            type="url"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Twitter />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="social_links.portfolio"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Portfolio URL"
                                            type="url"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Language />
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
                                            label="Featured Member"
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
                                            label="Active Member"
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Controller
                                    name="show_in_about"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                />
                                            }
                                            label="Show in About Page"
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
                                editingMember ? 'Update Member' : 'Add Member'
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

export default TeamManager;