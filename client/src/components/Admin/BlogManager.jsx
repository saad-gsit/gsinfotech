import React, { useState, useEffect, useRef } from 'react';
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
    Tab,
    Tabs,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    MoreVert,
    Visibility,
    Publish,
    Schedule,
    Save,
    Preview,
    Article,
    Search,
    GridView,
    ViewList,
    FilterList,
    ExpandMore,
    TrendingUp,
    Visibility as Views,
    Comment,
    Share,
    Timer,
    CalendarToday,
    Category,
    Tag,
    Warning,
    Check,
    SaveAs, // Changed from AutoSave to SaveAs
    
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Editor } from '@tinymce/tinymce-react';
import { blogAPI } from '../../services/blogAPI';
import { usePermissions } from './AuthGuard';
import FileUpload from '../Forms/FileUpload';

// Validation Schema
const blogSchema = yup.object({
    title: yup.string().required('Title is required').min(5, 'Title must be at least 5 characters'),
    excerpt: yup.string().required('Excerpt is required').max(300, 'Excerpt must be less than 300 characters'),
    content: yup.string().required('Content is required').min(100, 'Content must be at least 100 characters'),
    category: yup.string().required('Category is required'),
    tags: yup.array().min(1, 'At least one tag is required'),
    status: yup.string().required('Status is required'),
    publishDate: yup.date().nullable(),
    seoTitle: yup.string().max(60, 'SEO Title must be less than 60 characters'),
    seoDescription: yup.string().max(160, 'SEO Description must be less than 160 characters'),
    seoKeywords: yup.array()
});

// SEO Preview Component
const SEOPreview = ({ title, description, slug, publishDate }) => {
    const baseUrl = 'https://gsinfotech.com';
    const fullUrl = `${baseUrl}/blog/${slug || 'your-blog-post'}`;

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    SEO Preview
                </Typography>

                {/* Google Search Preview */}
                <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                        Google Search Result
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#1a0dab',
                                fontSize: '20px',
                                fontWeight: 400,
                                lineHeight: 1.3,
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            {title || 'Your Blog Post Title Here'}
                        </Typography>
                        <Typography variant="body2" color="success.main" sx={{ mt: 0.5, mb: 1 }}>
                            {fullUrl}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                            {publishDate && new Intl.DateTimeFormat('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            }).format(new Date(publishDate)) + ' — '}
                            {description || 'Your meta description will appear here. Make it compelling to encourage clicks from search results.'}
                        </Typography>
                    </Box>
                </Paper>

                {/* Social Media Preview */}
                <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                        Social Media Preview
                    </Typography>
                    <Box sx={{ mt: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            gsinfotech.com
                        </Typography>
                        <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, mb: 1 }}>
                            {title || 'Your Blog Post Title'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {description || 'Your meta description for social sharing'}
                        </Typography>
                    </Box>
                </Paper>
            </CardContent>
        </Card>
    );
};

// Reading Time Calculator
const calculateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.ceil(words / wordsPerMinute);
    return readingTime;
};

const BlogManager = () => {
    // State management
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [selectedPosts, setSelectedPosts] = useState([]);
    const [bulkActionAnchor, setBulkActionAnchor] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', action: null });
    const [activeTab, setActiveTab] = useState(0);
    const [autoSaving, setAutoSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    const editorRef = useRef(null);
    const autoSaveRef = useRef(null);
    const { canWrite, canDelete } = usePermissions();

    // Form setup
    const { control, handleSubmit, formState: { errors, isSubmitting, isDirty }, reset, watch, setValue, getValues } = useForm({
        resolver: yupResolver(blogSchema),
        defaultValues: {
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            category: '',
            tags: [],
            status: 'draft',
            publishDate: '',
            featuredImage: null,
            seoTitle: '',
            seoDescription: '',
            seoKeywords: [],
            allowComments: true,
            featured: false
        }
    });

    const watchedFields = watch(['title', 'seoDescription', 'slug', 'publishDate']);

    useEffect(() => {
        loadPosts();
    }, []);

    // Auto-save functionality
    useEffect(() => {
        if (isDirty && editingPost) {
            if (autoSaveRef.current) {
                clearTimeout(autoSaveRef.current);
            }

            autoSaveRef.current = setTimeout(() => {
                handleAutoSave();
            }, 30000); // Auto-save every 30 seconds
        }

        return () => {
            if (autoSaveRef.current) {
                clearTimeout(autoSaveRef.current);
            }
        };
    }, [isDirty, editingPost]);

    // Auto-generate slug from title
    useEffect(() => {
        const title = watchedFields[0];
        if (title && !editingPost) {
            const slug = title.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim('-');
            setValue('slug', slug);
        }
    }, [watchedFields[0], editingPost, setValue]);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const response = await blogAPI.getAllPosts();

            // Check if response has the correct structure
            let postsData = [];

            if (Array.isArray(response)) {
                postsData = response;
            } else if (response.data && Array.isArray(response.data)) {
                postsData = response.data;
            } else if (response.data && response.data.posts && Array.isArray(response.data.posts)) {
                postsData = response.data.posts;
            } else if (response.posts && Array.isArray(response.posts)) {
                postsData = response.posts;
            } else {
                console.error('Unexpected response structure:', response);
                postsData = [];
            }

            setPosts(postsData);
        } catch (error) {
            console.error('Error loading posts:', error);
            showSnackbar('Failed to load blog posts', 'error');
            // Set to empty array instead of mock data in production
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAutoSave = async () => {
        if (!editingPost || !isDirty) return;

        try {
            setAutoSaving(true);
            const formData = getValues();
            await blogAPI.updatePost(editingPost.id, { ...formData, status: 'draft' });
            setLastSaved(new Date());
            showSnackbar('Auto-saved draft', 'info');
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            setAutoSaving(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const showConfirmDialog = (title, message, action) => {
        setConfirmDialog({ open: true, title, message, action });
    };

    const handleOpenDialog = (post = null) => {
        if (post) {
            setEditingPost(post);
            reset({
                ...post,
                publishDate: post.publishDate ? post.publishDate.split('T')[0] : '',
                tags: post.tags || [],
                seoKeywords: post.seoKeywords || []
            });
        } else {
            setEditingPost(null);
            reset({
                title: '',
                slug: '',
                excerpt: '',
                content: '',
                category: '',
                tags: [],
                status: 'draft',
                publishDate: '',
                featuredImage: null,
                seoTitle: '',
                seoDescription: '',
                seoKeywords: [],
                allowComments: true,
                featured: false
            });
        }
        setOpenDialog(true);
        setActiveTab(0);
    };

    const handleCloseDialog = () => {
        if (isDirty) {
            showConfirmDialog(
                'Unsaved Changes',
                'You have unsaved changes. Are you sure you want to close?',
                () => {
                    setOpenDialog(false);
                    setEditingPost(null);
                    setActiveTab(0);
                }
            );
        } else {
            setOpenDialog(false);
            setEditingPost(null);
            setActiveTab(0);
        }
    };

    const onSubmit = async (data) => {
        try {
            // Calculate reading time
            const readingTime = calculateReadingTime(data.content);
            const postData = { ...data, readingTime };

            if (editingPost) {
                await blogAPI.updatePost(editingPost.id, postData);
                setPosts(prevPosts => Array.isArray(prevPosts) ?
                    prevPosts.map(p => p.id === editingPost.id ? { ...postData, id: editingPost.id } : p) :
                    []
                );
                showSnackbar('Blog post updated successfully');
            } else {
                const response = await blogAPI.createPost(postData);
                const newPost = response.data || { ...postData, id: Date.now() };
                setPosts(prevPosts => Array.isArray(prevPosts) ? [newPost, ...prevPosts] : [newPost]);
                showSnackbar('Blog post created successfully');
            }
            setOpenDialog(false);
            setEditingPost(null);
        } catch (error) {
            console.error('Error saving post:', error);
            showSnackbar('Failed to save blog post', 'error');
        }
    };

    const handleDeletePost = async (postId) => {
        showConfirmDialog(
            'Delete Blog Post',
            'Are you sure you want to delete this blog post? This action cannot be undone.',
            async () => {
                try {
                    await blogAPI.deletePost(postId);
                    setPosts(prevPosts => Array.isArray(prevPosts) ?
                        prevPosts.filter(p => p.id !== postId) :
                        []
                    );
                    showSnackbar('Blog post deleted successfully');
                } catch (error) {
                    console.error('Error deleting post:', error);
                    showSnackbar('Failed to delete blog post', 'error');
                }
            }
        );
        setAnchorEl(null);
    };

    const handleBulkAction = async (action) => {
        const count = selectedPosts.length;

        showConfirmDialog(
            `${action} ${count} Posts`,
            `Are you sure you want to ${action.toLowerCase()} ${count} selected post(s)?`,
            async () => {
                try {
                    if (action === 'Delete') {
                        await Promise.all(selectedPosts.map(id => blogAPI.deletePost(id)));
                        setPosts(prevPosts => Array.isArray(prevPosts) ?
                            prevPosts.filter(p => !selectedPosts.includes(p.id)) :
                            []
                        );
                    } else if (action === 'Publish') {
                        await Promise.all(selectedPosts.map(id =>
                            blogAPI.updatePost(id, { status: 'published', publishDate: new Date().toISOString() })
                        ));
                        setPosts(prevPosts => Array.isArray(prevPosts) ?
                            prevPosts.map(p => selectedPosts.includes(p.id) ?
                                { ...p, status: 'published', publishDate: new Date().toISOString() } : p
                            ) :
                            []
                        );
                    }
                    setSelectedPosts([]);
                    showSnackbar(`${count} post(s) ${action.toLowerCase()}ed successfully`);
                } catch (error) {
                    console.error(`Error ${action.toLowerCase()}ing posts:`, error);
                    showSnackbar(`Failed to ${action.toLowerCase()} posts`, 'error');
                }
            }
        );
        setBulkActionAnchor(null);
    };

    // Selection handlers
    const handleSelectPost = (postId) => {
        setSelectedPosts(prev =>
            prev.includes(postId)
                ? prev.filter(id => id !== postId)
                : [...prev, postId]
        );
    };

    const handleSelectAll = () => {
        setSelectedPosts(
            selectedPosts.length === filteredPosts.length
                ? []
                : filteredPosts.map(p => p.id)
        );
    };

    // Filter and search logic
    const filteredPosts = Array.isArray(posts) ? posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (post.tags && Array.isArray(post.tags) && post.tags.some(tag =>
                tag.toLowerCase().includes(searchTerm.toLowerCase())
            ));

        const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
        const matchesCategory = filterCategory === 'all' || post.category === filterCategory;

        return matchesSearch && matchesStatus && matchesCategory;
    }) : [];

    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'success';
            case 'draft': return 'warning';
            case 'scheduled': return 'info';
            case 'archived': return 'error';
            default: return 'default';
        }
    };

    const categories = [
        'Development', 'Design', 'Backend', 'Frontend', 'Mobile', 'DevOps',
        'Tutorial', 'News', 'Tips', 'Case Study', 'Technology'
    ];

    const availableTags = [
        'React', 'Node.js', 'JavaScript', 'TypeScript', 'Python', 'PHP',
        'UI/UX', 'Design', 'Tutorial', 'Best Practices', 'Performance',
        'Security', 'Database', 'API', 'Cloud', 'DevOps', 'Testing'
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
                        Blog Manager
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Create and manage your blog content
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    {selectedPosts.length > 0 && (
                        <Badge badgeContent={selectedPosts.length} color="primary">
                            <Button
                                variant="outlined"
                                onClick={(e) => setBulkActionAnchor(e.currentTarget)}
                                startIcon={<FilterList />}
                            >
                                Bulk Actions
                            </Button>
                        </Badge>
                    )}

                    {canWrite('blog') && (
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
                            New Post
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
                                Total Posts
                            </Typography>
                            <Typography variant="h4">
                                {posts.length}
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
                                {posts.filter(p => p.status === 'published').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Drafts
                            </Typography>
                            <Typography variant="h4" color="warning.main">
                                {posts.filter(p => p.status === 'draft').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Total Views
                            </Typography>
                            <Typography variant="h4" color="primary.main">
                                {posts.reduce((total, post) => total + (post.views || 0), 0)}
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
                            placeholder="Search posts..."
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
                                <MenuItem value="published">Published</MenuItem>
                                <MenuItem value="draft">Draft</MenuItem>
                                <MenuItem value="scheduled">Scheduled</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={filterCategory}
                                label="Category"
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <MenuItem value="all">All</MenuItem>
                                {categories.map(cat => (
                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4} md={2}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Tooltip title="Select All">
                                <Checkbox
                                    checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                                    indeterminate={selectedPosts.length > 0 && selectedPosts.length < filteredPosts.length}
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
                            {filteredPosts.length} post(s)
                        </Typography>
                    </Grid>
                </Grid>
            </Card>

            {/* Posts Grid */}
            <Grid container spacing={3}>
                <AnimatePresence>
                    {filteredPosts.map((post) => (
                        <Grid item xs={12} sm={6} lg={4} key={post.id}>
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
                                        border: selectedPosts.includes(post.id) ? 2 : 1,
                                        borderColor: selectedPosts.includes(post.id) ? 'primary.main' : 'divider',
                                        '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.2s' }
                                    }}
                                >
                                    {/* Selection Checkbox */}
                                    <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
                                        <Checkbox
                                            checked={selectedPosts.includes(post.id)}
                                            onChange={() => handleSelectPost(post.id)}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.8)' }}
                                        />
                                    </Box>

                                    {post.featuredImage && (
                                        <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                                            <img
                                                src={post.featuredImage}
                                                alt={post.title}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            {post.featured && (
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
                                                {post.title}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    setAnchorEl(e.currentTarget);
                                                    setSelectedPost(post);
                                                }}
                                            >
                                                <MoreVert />
                                            </IconButton>
                                        </Box>

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {post.excerpt}
                                        </Typography>

                                        <Box sx={{ mb: 2 }}>
                                            <Chip
                                                label={post.status}
                                                size="small"
                                                color={getStatusColor(post.status)}
                                                sx={{ mr: 1, mb: 1 }}
                                            />
                                            <Chip
                                                label={post.category}
                                                size="small"
                                                variant="outlined"
                                                sx={{ mb: 1 }}
                                            />
                                        </Box>

                                        <Box sx={{ mb: 2 }}>
                                            {post.tags.slice(0, 3).map((tag, index) => (
                                                <Chip
                                                    key={index}
                                                    label={tag}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ mr: 0.5, mb: 0.5, fontSize: '0.75rem' }}
                                                />
                                            ))}
                                            {post.tags.length > 3 && (
                                                <Chip
                                                    label={`+${post.tags.length - 3}`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ mr: 0.5, mb: 0.5, fontSize: '0.75rem' }}
                                                />
                                            )}
                                        </Box>

                                        {/* Post Meta */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Timer fontSize="small" color="action" />
                                                <Typography variant="caption" color="text.secondary">
                                                    {post.readingTime}min read
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Views fontSize="small" color="action" />
                                                <Typography variant="caption" color="text.secondary">
                                                    {post.views || 0}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Comment fontSize="small" color="action" />
                                                <Typography variant="caption" color="text.secondary">
                                                    {post.comments || 0}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Typography variant="caption" color="text.secondary">
                                            {post.publishDate
                                                ? `Published ${new Date(post.publishDate).toLocaleDateString()}`
                                                : `Created ${new Date(post.createdAt).toLocaleDateString()}`
                                            }
                                        </Typography>
                                    </CardContent>

                                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                                                {post.author?.[0] || 'A'}
                                            </Avatar>
                                            <Typography variant="caption" color="text.secondary">
                                                {post.author || 'Anonymous'}
                                            </Typography>
                                        </Box>

                                        {canWrite('blog') && (
                                            <Button
                                                size="small"
                                                onClick={() => handleOpenDialog(post)}
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
            {filteredPosts.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Article sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No blog posts found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Get started by creating your first blog post'
                        }
                    </Typography>
                    {!searchTerm && filterStatus === 'all' && filterCategory === 'all' && canWrite('blog') && (
                        <Button
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={() => handleOpenDialog()}
                        >
                            Create Your First Post
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
                {canWrite('blog') && (
                    <MenuOption onClick={() => {
                        handleOpenDialog(selectedPost);
                        setAnchorEl(null);
                    }}>
                        <Edit sx={{ mr: 1 }} />
                        Edit
                    </MenuOption>
                )}
                <MenuOption onClick={() => {
                    // Preview functionality
                    window.open(`/blog/${selectedPost?.slug}`, '_blank');
                    setAnchorEl(null);
                }}>
                    <Preview sx={{ mr: 1 }} />
                    Preview
                </MenuOption>
                {canDelete('blog') && (
                    <MenuOption
                        onClick={() => {
                            handleDeletePost(selectedPost?.id);
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
                maxWidth="xl"
                fullWidth
                PaperProps={{
                    sx: { height: '90vh' }
                }}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">
                            {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {autoSaving && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SaveAs fontSize="small" color="action" />
                                    <Typography variant="caption" color="text.secondary">
                                        Auto-saving...
                                    </Typography>
                                </Box>
                            )}
                            {lastSaved && (
                                <Typography variant="caption" color="text.secondary">
                                    Last saved: {lastSaved.toLocaleTimeString()}
                                </Typography>
                            )}
                        </Box>
                    </DialogTitle>

                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                            <Tab label="Content" />
                            <Tab label="SEO & Settings" />
                            <Tab label="Preview" />
                        </Tabs>
                    </Box>

                    <DialogContent sx={{ p: 0, height: 'calc(90vh - 120px)', overflow: 'hidden' }}>
                        {/* Content Tab */}
                        {activeTab === 0 && (
                            <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={8}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Controller
                                                    name="title"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            fullWidth
                                                            label="Post Title"
                                                            error={!!errors.title}
                                                            helperText={errors.title?.message}
                                                            required
                                                        />
                                                    )}
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={8}>
                                                <Controller
                                                    name="slug"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            fullWidth
                                                            label="URL Slug"
                                                            helperText="Auto-generated from title"
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        /blog/
                                                                    </InputAdornment>
                                                                )
                                                            }}
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

                                            <Grid item xs={12}>
                                                <Controller
                                                    name="excerpt"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            fullWidth
                                                            label="Excerpt"
                                                            multiline
                                                            rows={3}
                                                            error={!!errors.excerpt}
                                                            helperText={errors.excerpt?.message || 'Brief summary of the post'}
                                                            required
                                                        />
                                                    )}
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Typography variant="h6" gutterBottom>
                                                    Content
                                                </Typography>
                                                <Controller
                                                    name="content"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
                                                            <Editor
                                                                ref={editorRef}
                                                                value={field.value}
                                                                onEditorChange={field.onChange}
                                                                init={{
                                                                    height: 400,
                                                                    menubar: true,
                                                                    plugins: [
                                                                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                                                                        'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
                                                                        'fullscreen', 'insertdatetime', 'media', 'table', 'help',
                                                                        'wordcount', 'codesample'
                                                                    ],
                                                                    toolbar: 'undo redo | blocks | ' +
                                                                        'bold italic forecolor | alignleft aligncenter ' +
                                                                        'alignright alignjustify | bullist numlist outdent indent | ' +
                                                                        'removeformat | help | link image media | codesample',
                                                                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                                                                }}
                                                            />
                                                        </Box>
                                                    )}
                                                />
                                                {errors.content && (
                                                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                                        {errors.content.message}
                                                    </Typography>
                                                )}
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <Card sx={{ mb: 2 }}>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    Publish Settings
                                                </Typography>

                                                <Controller
                                                    name="status"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                                            <InputLabel>Status</InputLabel>
                                                            <Select
                                                                {...field}
                                                                label="Status"
                                                            >
                                                                <MenuItem value="draft">Draft</MenuItem>
                                                                <MenuItem value="published">Published</MenuItem>
                                                                <MenuItem value="scheduled">Scheduled</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    )}
                                                />

                                                <Controller
                                                    name="publishDate"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            fullWidth
                                                            label="Publish Date"
                                                            type="datetime-local"
                                                            InputLabelProps={{ shrink: true }}
                                                            sx={{ mb: 2 }}
                                                        />
                                                    )}
                                                />

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
                                                            label="Featured Post"
                                                            sx={{ mb: 1 }}
                                                        />
                                                    )}
                                                />

                                                <Controller
                                                    name="allowComments"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <FormControlLabel
                                                            control={
                                                                <Switch
                                                                    checked={field.value}
                                                                    onChange={field.onChange}
                                                                />
                                                            }
                                                            label="Allow Comments"
                                                        />
                                                    )}
                                                />
                                            </CardContent>
                                        </Card>

                                        <Card sx={{ mb: 2 }}>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    Tags
                                                </Typography>
                                                <Controller
                                                    name="tags"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <FormControl fullWidth error={!!errors.tags}>
                                                            <InputLabel>Select Tags</InputLabel>
                                                            <Select
                                                                {...field}
                                                                multiple
                                                                input={<OutlinedInput label="Select Tags" />}
                                                                renderValue={(selected) => (
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                        {selected.map((value) => (
                                                                            <Chip key={value} label={value} size="small" />
                                                                        ))}
                                                                    </Box>
                                                                )}
                                                            >
                                                                {availableTags.map((tag) => (
                                                                    <MenuItem key={tag} value={tag}>
                                                                        <Checkbox checked={field.value.indexOf(tag) > -1} />
                                                                        <ListItemText primary={tag} />
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                            {errors.tags && (
                                                                <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                                                                    {errors.tags.message}
                                                                </Typography>
                                                            )}
                                                        </FormControl>
                                                    )}
                                                />
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    Featured Image
                                                </Typography>
                                                <FileUpload
                                                    onFilesChange={(files) => setValue('featuredImage', files[0]?.url)}
                                                    maxFiles={1}
                                                    showPreview={true}
                                                    enableCrop={true}
                                                />
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {/* SEO & Settings Tab */}
                        {activeTab === 1 && (
                            <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={8}>
                                        <Typography variant="h6" gutterBottom>
                                            SEO Settings
                                        </Typography>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Controller
                                                    name="seoTitle"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            fullWidth
                                                            label="SEO Title"
                                                            error={!!errors.seoTitle}
                                                            helperText={errors.seoTitle?.message || `${field.value?.length || 0}/60 characters`}
                                                        />
                                                    )}
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Controller
                                                    name="seoDescription"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            fullWidth
                                                            label="SEO Description"
                                                            multiline
                                                            rows={3}
                                                            error={!!errors.seoDescription}
                                                            helperText={errors.seoDescription?.message || `${field.value?.length || 0}/160 characters`}
                                                        />
                                                    )}
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Controller
                                                    name="seoKeywords"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <FormControl fullWidth>
                                                            <InputLabel>SEO Keywords</InputLabel>
                                                            <Select
                                                                {...field}
                                                                multiple
                                                                input={<OutlinedInput label="SEO Keywords" />}
                                                                renderValue={(selected) => (
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                        {selected.map((value) => (
                                                                            <Chip key={value} label={value} size="small" />
                                                                        ))}
                                                                    </Box>
                                                                )}
                                                            >
                                                                {availableTags.map((keyword) => (
                                                                    <MenuItem key={keyword} value={keyword}>
                                                                        <Checkbox checked={field.value?.indexOf(keyword) > -1} />
                                                                        <ListItemText primary={keyword} />
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    )}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <SEOPreview
                                            title={watchedFields[0] || 'Your Blog Post Title'}
                                            description={watchedFields[1] || 'Your meta description'}
                                            slug={watchedFields[2]}
                                            publishDate={watchedFields[3]}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {/* Preview Tab */}
                        {activeTab === 2 && (
                            <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
                                <Typography variant="h6" gutterBottom>
                                    Post Preview
                                </Typography>
                                <Paper sx={{ p: 3, border: 1, borderColor: 'divider' }}>
                                    <Typography variant="h4" gutterBottom>
                                        {watch('title') || 'Post Title'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {watch('excerpt') || 'Post excerpt...'}
                                    </Typography>
                                    <Divider sx={{ my: 2 }} />
                                    <Box
                                        dangerouslySetInnerHTML={{
                                            __html: watch('content') || '<p>Post content will appear here...</p>'
                                        }}
                                        sx={{ '& img': { maxWidth: '100%', height: 'auto' } }}
                                    />
                                </Paper>
                            </Box>
                        )}
                    </DialogContent>

                    <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
                        <Button onClick={handleCloseDialog} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                setValue('status', 'draft');
                                handleSubmit(onSubmit)();
                            }}
                            disabled={isSubmitting}
                            startIcon={<Save />}
                        >
                            Save Draft
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            onClick={() => setValue('status', 'published')}
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
                                editingPost ? 'Update Post' : 'Publish Post'
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

export default BlogManager;