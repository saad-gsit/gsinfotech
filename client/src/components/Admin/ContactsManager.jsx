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
    InputAdornment,
    Alert,
    Snackbar,
    Checkbox,
    Divider,
    Tooltip,
    Badge,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    Avatar
} from '@mui/material';
import {
    Email,
    Phone,
    Business,
    Subject,
    Message,
    MoreVert,
    Visibility,
    Reply,
    Delete,
    Search,
    FilterList,
    Sort,
    Download,
    ContactSupport,
    CheckCircle,
    Schedule,
    Cancel,
    Assignment,
    Person,
    LocationOn,
    AccessTime,
    AttachMoney,
    Timeline,
    Star,
    StarBorder,
    Warning,
    Error as ErrorIcon,
    TrendingUp,
    Today,
    DateRange,
    Refresh,
    Archive,
    Unarchive,
    Flag,
    PhoneCallback,
    MailOutline
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { contactAPI } from '../../services/contactAPI';
import { usePermissions } from './AuthGuard';

// Validation Schema for response
const responseSchema = yup.object({
    response: yup.string().required('Response is required').min(10, 'Response must be at least 10 characters'),
    notes: yup.string().max(500, 'Notes must be less than 500 characters')
});

const ContactsManager = () => {
    // State management
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterService, setFilterService] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [selectedSubmissions, setSelectedSubmissions] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [detailDialog, setDetailDialog] = useState(false);
    const [responseDialog, setResponseDialog] = useState(false);
    const [bulkActionAnchor, setBulkActionAnchor] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', action: null });
    const [pagination, setPagination] = useState({
        page: 0,
        rowsPerPage: 10,
        total: 0
    });
    const [orderBy, setOrderBy] = useState('created_at'); // Use snake_case to match database
    const [order, setOrder] = useState('DESC');
    const [stats, setStats] = useState({
        total: 0,
        new: 0,
        in_progress: 0,
        responded: 0,
        closed: 0
    });

    const { canWrite, canDelete } = usePermissions();

    // Form setup for response
    const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        resolver: yupResolver(responseSchema),
        defaultValues: {
            response: '',
            notes: ''
        }
    });

    useEffect(() => {
        loadSubmissions();
        loadStats();
    }, [pagination.page, pagination.rowsPerPage, orderBy, order, searchTerm, filterStatus, filterService, filterPriority]);
    // Replace the loadSubmissions function in your ContactsManager.jsx:



    const loadSubmissions = async () => {
        try {
            setLoading(true);

            // Map frontend sort fields to actual database column names
            const sortFieldMapping = {
                'created_at': 'created_at',     // Keep snake_case for database
                'updated_at': 'updated_at',     // Keep snake_case for database
                'name': 'name',
                'subject': 'subject',           // Use 'subject' not 'title'
                'status': 'status',
                'email': 'email'
            };

            const params = {
                page: pagination.page + 1,
                limit: pagination.rowsPerPage,
                sort: sortFieldMapping[orderBy] || 'created_at', // Default to created_at
                order: order.toUpperCase(),
                search: searchTerm || undefined,
                status: filterStatus !== 'all' ? filterStatus : undefined,
                service_interest: filterService !== 'all' ? filterService : undefined,
                priority: filterPriority !== 'all' ? filterPriority : undefined
            };

            console.log('📤 Loading submissions with params:', params);

            const response = await contactAPI.getAllSubmissions(params);
            console.log('📥 API Response:', response);

            let submissionsData = [];
            let totalCount = 0;

            if (response && response.submissions && Array.isArray(response.submissions)) {
                submissionsData = response.submissions;
                totalCount = response.pagination?.totalSubmissions || response.submissions.length;
            } else if (Array.isArray(response)) {
                submissionsData = response;
                totalCount = response.length;
            } else if (response.data && Array.isArray(response.data)) {
                submissionsData = response.data;
                totalCount = response.total || response.data.length;
            } else {
                console.error('Unexpected response structure:', response);
                submissionsData = [];
                totalCount = 0;
            }

            console.log('📊 Final data:', {
                count: submissionsData.length,
                total: totalCount
            });

            setSubmissions(submissionsData);
            setPagination(prev => ({ ...prev, total: totalCount }));

        } catch (error) {
            console.error('Error loading submissions:', error);
            console.error('Error response:', error.response?.data);
            showSnackbar(`Failed to load submissions: ${error.response?.data?.message || error.message}`, 'error');
            setSubmissions([]);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await contactAPI.getContactStats();
            if (response.stats) {
                setStats({
                    total: response.stats.overview?.totalSubmissions || 0,
                    new: response.stats.breakdown?.byStatus?.new || 0,
                    in_progress: response.stats.breakdown?.byStatus?.in_progress || 0,
                    responded: response.stats.breakdown?.byStatus?.responded || 0,
                    closed: response.stats.breakdown?.byStatus?.closed || 0
                });
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const showConfirmDialog = (title, message, action) => {
        setConfirmDialog({ open: true, title, message, action });
    };

    // Handlers
    const handleViewDetails = (submission) => {
        setSelectedSubmission(submission);
        setDetailDialog(true);
    };

    const handleOpenResponse = (submission) => {
        setSelectedSubmission(submission);
        reset({ response: '', notes: '' });
        setResponseDialog(true);
        setAnchorEl(null);
    };

    const handleUpdateStatus = async (submissionId, status) => {
        try {
            await contactAPI.updateSubmissionStatus(submissionId, status);
            setSubmissions(submissions.map(s =>
                s.id === submissionId ? { ...s, status } : s
            ));
            showSnackbar('Status updated successfully');
            loadStats(); // Refresh stats
        } catch (error) {
            console.error('Error updating status:', error);
            showSnackbar('Failed to update status', 'error');
        }
        setAnchorEl(null);
    };

    const handleDeleteSubmission = async (submissionId) => {
        showConfirmDialog(
            'Delete Submission',
            'Are you sure you want to delete this submission? This action cannot be undone.',
            async () => {
                try {
                    await contactAPI.deleteSubmission(submissionId);
                    setSubmissions(submissions.filter(s => s.id !== submissionId));
                    showSnackbar('Submission deleted successfully');
                    loadStats();
                } catch (error) {
                    console.error('Error deleting submission:', error);
                    showSnackbar('Failed to delete submission', 'error');
                }
            }
        );
        setAnchorEl(null);
    };

    const onSubmitResponse = async (data) => {
        try {
            await contactAPI.addResponse(selectedSubmission.id, data);
            await handleUpdateStatus(selectedSubmission.id, 'responded');
            setResponseDialog(false);
            showSnackbar('Response sent successfully');
        } catch (error) {
            console.error('Error sending response:', error);
            showSnackbar('Failed to send response', 'error');
        }
    };

    const handleBulkAction = async (action) => {
        const count = selectedSubmissions.length;

        showConfirmDialog(
            `${action} ${count} Submissions`,
            `Are you sure you want to ${action.toLowerCase()} ${count} selected submission(s)?`,
            async () => {
                try {
                    if (action === 'Delete') {
                        await Promise.all(selectedSubmissions.map(id => contactAPI.deleteSubmission(id)));
                        setSubmissions(submissions.filter(s => !selectedSubmissions.includes(s.id)));
                    } else {
                        const statusMap = {
                            'Mark as New': 'new',
                            'Mark as In Progress': 'in_progress',
                            'Mark as Responded': 'responded',
                            'Mark as Closed': 'closed'
                        };
                        const status = statusMap[action];
                        if (status) {
                            await Promise.all(selectedSubmissions.map(id =>
                                contactAPI.updateSubmissionStatus(id, status)
                            ));
                            setSubmissions(submissions.map(s =>
                                selectedSubmissions.includes(s.id) ? { ...s, status } : s
                            ));
                        }
                    }
                    setSelectedSubmissions([]);
                    showSnackbar(`${count} submission(s) ${action.toLowerCase()}ed successfully`);
                    loadStats();
                } catch (error) {
                    console.error(`Error ${action.toLowerCase()}ing submissions:`, error);
                    showSnackbar(`Failed to ${action.toLowerCase()} submissions`, 'error');
                }
            }
        );
        setBulkActionAnchor(null);
    };

    // Selection handlers
    const handleSelectSubmission = (submissionId) => {
        setSelectedSubmissions(prev =>
            prev.includes(submissionId)
                ? prev.filter(id => id !== submissionId)
                : [...prev, submissionId]
        );
    };

    const handleSelectAll = () => {
        setSelectedSubmissions(
            selectedSubmissions.length === submissions.length
                ? []
                : submissions.map(s => s.id)
        );
    };

    // Table handlers
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'ASC';
        setOrder(isAsc ? 'DESC' : 'ASC');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleChangeRowsPerPage = (event) => {
        setPagination(prev => ({
            ...prev,
            rowsPerPage: parseInt(event.target.value, 10),
            page: 0
        }));
    };

    // Status color mapping
    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'info';
            case 'in_progress': return 'warning';
            case 'responded': return 'success';
            case 'closed': return 'default';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    const serviceOptions = [
        'web_development',
        'mobile_development',
        'custom_software',
        'ui_ux_design',
        'enterprise_solutions',
        'consultation',
        'other'
    ];

    const getServiceLabel = (service) => {
        const labels = {
            'web_development': 'Web Development',
            'mobile_development': 'Mobile Development',
            'custom_software': 'Custom Software',
            'ui_ux_design': 'UI/UX Design',
            'enterprise_solutions': 'Enterprise Solutions',
            'consultation': 'Consultation',
            'other': 'Other'
        };
        return labels[service] || service;
    };

    if (loading && submissions.length === 0) {
        return (
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Skeleton variant="text" width={300} height={40} />
                    <Skeleton variant="rectangular" width={150} height={40} />
                </Box>
                <Grid container spacing={3}>
                    {[1, 2, 3, 4].map((i) => (
                        <Grid item xs={12} sm={6} lg={3} key={i}>
                            <Skeleton variant="rectangular" height={100} />
                        </Grid>
                    ))}
                </Grid>
                <Skeleton variant="rectangular" height={400} sx={{ mt: 3 }} />
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        Contact Manager
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage contact submissions and customer inquiries
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    {selectedSubmissions.length > 0 && (
                        <Badge badgeContent={selectedSubmissions.length} color="primary">
                            <Button
                                variant="outlined"
                                onClick={(e) => setBulkActionAnchor(e.currentTarget)}
                                startIcon={<Assignment />}
                            >
                                Bulk Actions
                            </Button>
                        </Badge>
                    )}

                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => {
                            // Export functionality
                            showSnackbar('Export feature coming soon');
                        }}
                    >
                        Export
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<Refresh />}
                        onClick={() => {
                            loadSubmissions();
                            loadStats();
                        }}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46a1 100%)',
                            }
                        }}
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        Total
                                    </Typography>
                                    <Typography variant="h4">
                                        {stats.total}
                                    </Typography>
                                </Box>
                                <ContactSupport sx={{ fontSize: 40, color: 'primary.main' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        New
                                    </Typography>
                                    <Typography variant="h4" color="info.main">
                                        {stats.new}
                                    </Typography>
                                </Box>
                                <Star sx={{ fontSize: 40, color: 'info.main' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        In Progress
                                    </Typography>
                                    <Typography variant="h4" color="warning.main">
                                        {stats.in_progress}
                                    </Typography>
                                </Box>
                                <Schedule sx={{ fontSize: 40, color: 'warning.main' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        Responded
                                    </Typography>
                                    <Typography variant="h4" color="success.main">
                                        {stats.responded}
                                    </Typography>
                                </Box>
                                <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        Closed
                                    </Typography>
                                    <Typography variant="h4" color="text.secondary">
                                        {stats.closed}
                                    </Typography>
                                </Box>
                                <Archive sx={{ fontSize: 40, color: 'text.secondary' }} />
                            </Box>
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
                            placeholder="Search submissions..."
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
                    <Grid item xs={12} sm={4} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filterStatus}
                                label="Status"
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="new">New</MenuItem>
                                <MenuItem value="in_progress">In Progress</MenuItem>
                                <MenuItem value="responded">Responded</MenuItem>
                                <MenuItem value="closed">Closed</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Service</InputLabel>
                            <Select
                                value={filterService}
                                label="Service"
                                onChange={(e) => setFilterService(e.target.value)}
                            >
                                <MenuItem value="all">All</MenuItem>
                                {serviceOptions.map((service) => (
                                    <MenuItem key={service} value={service}>
                                        {getServiceLabel(service)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Priority</InputLabel>
                            <Select
                                value={filterPriority}
                                label="Priority"
                                onChange={(e) => setFilterPriority(e.target.value)}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="low">Low</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Tooltip title="Select All">
                                <Checkbox
                                    checked={selectedSubmissions.length === submissions.length && submissions.length > 0}
                                    indeterminate={selectedSubmissions.length > 0 && selectedSubmissions.length < submissions.length}
                                    onChange={handleSelectAll}
                                />
                            </Tooltip>
                            <Typography variant="body2" color="text.secondary">
                                {submissions.length} submission(s)
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Card>

            {/* Submissions Table */}
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedSubmissions.length === submissions.length && submissions.length > 0}
                                        indeterminate={selectedSubmissions.length > 0 && selectedSubmissions.length < submissions.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'name'}
                                        direction={orderBy === 'name' ? order : 'asc'}
                                        onClick={() => handleRequestSort('name')}
                                    >
                                        Contact
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'subject'}
                                        direction={orderBy === 'subject' ? order : 'asc'}
                                        onClick={() => handleRequestSort('subject')}
                                    >
                                        Subject
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>Service</TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'status'}
                                        direction={orderBy === 'status' ? order : 'asc'}
                                        onClick={() => handleRequestSort('status')}
                                    >
                                        Status
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'created_at'}
                                        direction={orderBy === 'created_at' ? order : 'asc'}
                                        onClick={() => handleRequestSort('created_at')}
                                    >
                                        Date
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {submissions.map((submission) => (
                                <TableRow
                                    key={submission.id}
                                    hover
                                    selected={selectedSubmissions.includes(submission.id)}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedSubmissions.includes(submission.id)}
                                            onChange={() => handleSelectSubmission(submission.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                {submission.name.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2">
                                                    {submission.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {submission.email}
                                                </Typography>
                                                {submission.company && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {submission.company}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2">
                                            {submission.subject || 'No Subject'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                                            {submission.message}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {submission.service_interest && (
                                            <Chip
                                                label={getServiceLabel(submission.service_interest)}
                                                size="small"
                                                variant="outlined"
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={submission.status.replace('_', ' ')}
                                            size="small"
                                            color={getStatusColor(submission.status)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={submission.priority || 'medium'}
                                            size="small"
                                            color={getPriorityColor(submission.priority)}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {new Date(submission.created_at).toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(submission.created_at).toLocaleTimeString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                setAnchorEl(e.currentTarget);
                                                setSelectedSubmission(submission);
                                            }}
                                        >
                                            <MoreVert />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={pagination.total}
                    rowsPerPage={pagination.rowsPerPage}
                    page={pagination.page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            {/* Empty State */}
            {submissions.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <ContactSupport sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No submissions found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {searchTerm || filterStatus !== 'all' || filterService !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Contact submissions will appear here'
                        }
                    </Typography>
                </Box>
            )}

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                <MenuOption onClick={() => {
                    handleViewDetails(selectedSubmission);
                    setAnchorEl(null);
                }}>
                    <Visibility sx={{ mr: 1 }} />
                    View Details
                </MenuOption>
                {canWrite('contact') && (
                    <MenuOption onClick={() => handleOpenResponse(selectedSubmission)}>
                        <Reply sx={{ mr: 1 }} />
                        Send Response
                    </MenuOption>
                )}
                <Divider />
                {canWrite('contact') && (
                    <>
                        <MenuOption onClick={() => handleUpdateStatus(selectedSubmission?.id, 'in_progress')}>
                            <Schedule sx={{ mr: 1 }} />
                            Mark In Progress
                        </MenuOption>
                        <MenuOption onClick={() => handleUpdateStatus(selectedSubmission?.id, 'responded')}>
                            <CheckCircle sx={{ mr: 1 }} />
                            Mark Responded
                        </MenuOption>
                        <MenuOption onClick={() => handleUpdateStatus(selectedSubmission?.id, 'closed')}>
                            <Archive sx={{ mr: 1 }} />
                            Mark Closed
                        </MenuOption>
                        <Divider />
                    </>
                )}
                {canDelete('contact') && (
                    <MenuOption
                        onClick={() => handleDeleteSubmission(selectedSubmission?.id)}
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
                <MenuOption onClick={() => handleBulkAction('Mark as New')}>
                    <Star sx={{ mr: 1 }} />
                    Mark as New
                </MenuOption>
                <MenuOption onClick={() => handleBulkAction('Mark as In Progress')}>
                    <Schedule sx={{ mr: 1 }} />
                    Mark as In Progress
                </MenuOption>
                <MenuOption onClick={() => handleBulkAction('Mark as Responded')}>
                    <CheckCircle sx={{ mr: 1 }} />
                    Mark as Responded
                </MenuOption>
                <MenuOption onClick={() => handleBulkAction('Mark as Closed')}>
                    <Archive sx={{ mr: 1 }} />
                    Mark as Closed
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

            {/* Detail Dialog */}
            <Dialog
                open={detailDialog}
                onClose={() => setDetailDialog(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedSubmission && (
                    <>
                        <DialogTitle>
                            Contact Submission Details
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={3} sx={{ mt: 1 }}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>
                                        Contact Information
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Name
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedSubmission.name}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Email
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedSubmission.email}
                                        </Typography>
                                    </Box>
                                    {selectedSubmission.phone && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Phone
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedSubmission.phone}
                                            </Typography>
                                        </Box>
                                    )}
                                    {selectedSubmission.company && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Company
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedSubmission.company}
                                            </Typography>
                                        </Box>
                                    )}
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>
                                        Submission Details
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Subject
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedSubmission.subject || 'No Subject'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Service Interest
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedSubmission.service_interest
                                                ? getServiceLabel(selectedSubmission.service_interest)
                                                : 'Not specified'
                                            }
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Status
                                        </Typography>
                                        <Chip
                                            label={selectedSubmission.status.replace('_', ' ')}
                                            size="small"
                                            color={getStatusColor(selectedSubmission.status)}
                                        />
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Submitted
                                        </Typography>
                                        <Typography variant="body1">
                                            {new Date(selectedSubmission.created_at).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>
                                        Message
                                    </Typography>
                                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                        <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                                            {selectedSubmission.message}
                                        </Typography>
                                    </Paper>
                                </Grid>

                                {selectedSubmission.budget_range && (
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Budget Range
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedSubmission.budget_range.replace('_', ' ')}
                                        </Typography>
                                    </Grid>
                                )}

                                {selectedSubmission.timeline && (
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Timeline
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedSubmission.timeline.replace('_', ' ')}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDetailDialog(false)}>
                                Close
                            </Button>
                            {canWrite('contact') && (
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        setDetailDialog(false);
                                        handleOpenResponse(selectedSubmission);
                                    }}
                                    startIcon={<Reply />}
                                >
                                    Send Response
                                </Button>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Response Dialog */}
            <Dialog
                open={responseDialog}
                onClose={() => setResponseDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <form onSubmit={handleSubmit(onSubmitResponse)}>
                    <DialogTitle>
                        Send Response
                    </DialogTitle>
                    <DialogContent>
                        {selectedSubmission && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Responding to: {selectedSubmission.name} ({selectedSubmission.email})
                                </Typography>
                            </Box>
                        )}

                        <Controller
                            name="response"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Response Message"
                                    multiline
                                    rows={6}
                                    error={!!errors.response}
                                    helperText={errors.response?.message}
                                    required
                                    sx={{ mb: 2 }}
                                />
                            )}
                        />

                        <Controller
                            name="notes"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Internal Notes"
                                    multiline
                                    rows={3}
                                    error={!!errors.notes}
                                    helperText={errors.notes?.message || 'Internal notes (not visible to customer)'}
                                />
                            )}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setResponseDialog(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            startIcon={<Reply />}
                        >
                            {isSubmitting ? <CircularProgress size={20} /> : 'Send Response'}
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

export default ContactsManager;