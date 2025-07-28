// client/src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Avatar,
    LinearProgress,
    Chip,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    IconButton,
    Alert
} from '@mui/material';
import {
    TrendingUp,
    Work,
    Group,
    Article,
    ContactMail,
    Visibility,
    Edit,
    Add,
    Analytics,
    Schedule,
    Notifications
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { usePermissions } from '../../components/Admin/AuthGuard';
import { useNavigate } from 'react-router-dom';

// Import API services for stats
import { projectsAPI } from '../../services/projectsAPI';
import { teamAPI } from '../../services/teamAPI';
import { blogAPI } from '../../services/blogAPI';
import { contactAPI } from '../../services/contactAPI';

// Stats Card Component
const StatsCard = ({ title, value, icon, trend, color = 'primary', loading = false, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        <Card
            sx={{
                height: '100%',
                position: 'relative',
                overflow: 'visible',
                background: `linear-gradient(135deg, ${color === 'primary' ? '#667eea 0%, #764ba2' :
                    color === 'success' ? '#11998e 0%, #38ef7d' :
                        color === 'warning' ? '#f093fb 0%, #f5576c' :
                            '#4facfe 0%, #00f2fe'} 100%)`,
                color: 'white',
                cursor: onClick ? 'pointer' : 'default',
                '&:hover': {
                    transform: onClick ? 'translateY(-4px)' : 'none',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.3s ease',
            }}
            onClick={onClick}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                            {title}
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                            {loading ? '-' : value}
                        </Typography>
                        {trend && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TrendingUp sx={{ fontSize: 16 }} />
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    {trend}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        {icon}
                    </Box>
                </Box>
                {loading && (
                    <LinearProgress
                        sx={{
                            mt: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: 'rgba(255, 255, 255, 0.8)',
                            },
                        }}
                    />
                )}
            </CardContent>
        </Card>
    </motion.div>
);

// Quick Actions Component
const QuickActions = ({ hasPermission, navigate }) => {
    const actions = [
        {
            label: 'Add Project',
            icon: <Work />,
            path: '/admin/projects',
            action: () => navigate('/admin/projects'),
            permission: { resource: 'projects', action: 'write' },
            color: 'primary'
        },
        {
            label: 'Write Blog Post',
            icon: <Article />,
            path: '/admin/blog',
            action: () => navigate('/admin/blog'),
            permission: { resource: 'blog', action: 'write' },
            color: 'secondary'
        },
        {
            label: 'Add Team Member',
            icon: <Group />,
            path: '/admin/team',
            action: () => navigate('/admin/team'),
            permission: { resource: 'team', action: 'write' },
            color: 'success'
        },
        {
            label: 'View Analytics',
            icon: <Analytics />,
            path: '/admin/analytics',
            action: () => navigate('/admin/analytics'),
            permission: { resource: 'analytics', action: 'read' },
            color: 'info'
        }
    ];

    const availableActions = actions.filter(action =>
        hasPermission(action.permission.resource, action.permission.action)
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
        >
            <Card>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Quick Actions
                    </Typography>
                    <Grid container spacing={2}>
                        {availableActions.map((action, index) => (
                            <Grid item xs={12} sm={6} key={action.label}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={action.icon}
                                    onClick={action.action}
                                    sx={{
                                        py: 1.5,
                                        justifyContent: 'flex-start',
                                        borderColor: `${action.color}.main`,
                                        color: `${action.color}.main`,
                                        '&:hover': {
                                            bgcolor: `${action.color}.main`,
                                            color: 'white',
                                            transform: 'translateY(-2px)',
                                        },
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    {action.label}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>
        </motion.div>
    );
};

// Recent Activity Component
const RecentActivity = () => {
    const [activities] = useState([
        {
            id: 1,
            type: 'project',
            title: 'New project "E-commerce Platform" added',
            time: '2 hours ago',
            avatar: 'P',
            color: 'primary'
        },
        {
            id: 2,
            type: 'blog',
            title: 'Blog post "React Best Practices" published',
            time: '5 hours ago',
            avatar: 'B',
            color: 'secondary'
        },
        {
            id: 3,
            type: 'team',
            title: 'New team member "John Doe" added',
            time: '1 day ago',
            avatar: 'T',
            color: 'success'
        },
        {
            id: 4,
            type: 'contact',
            title: '3 new contact inquiries received',
            time: '2 days ago',
            avatar: 'C',
            color: 'warning'
        }
    ]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
        >
            <Card>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                            Recent Activity
                        </Typography>
                        <Button size="small" endIcon={<Visibility />}>
                            View All
                        </Button>
                    </Box>
                    <List sx={{ p: 0 }}>
                        {activities.map((activity, index) => (
                            <ListItem
                                key={activity.id}
                                sx={{
                                    px: 0,
                                    borderBottom: index < activities.length - 1 ? '1px solid' : 'none',
                                    borderColor: 'divider',
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        sx={{
                                            bgcolor: `${activity.color}.main`,
                                            width: 40,
                                            height: 40,
                                        }}
                                    >
                                        {activity.avatar}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={activity.title}
                                    secondary={activity.time}
                                    primaryTypographyProps={{
                                        variant: 'body2',
                                        fontWeight: 500,
                                    }}
                                    secondaryTypographyProps={{
                                        variant: 'caption',
                                        color: 'text.secondary',
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>
        </motion.div>
    );
};

// System Status Component
const SystemStatus = () => {
    const [systemHealth] = useState({
        server: { status: 'healthy', uptime: '99.9%' },
        database: { status: 'healthy', connections: 12 },
        cache: { status: 'healthy', hitRate: '94%' },
        storage: { status: 'warning', usage: '78%' }
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy': return 'success';
            case 'warning': return 'warning';
            case 'error': return 'error';
            default: return 'default';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
        >
            <Card>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        System Status
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {Object.entries(systemHealth).map(([key, value]) => (
                            <Box key={key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                    {key}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {key === 'server' ? value.uptime :
                                            key === 'database' ? `${value.connections} conn` :
                                                key === 'cache' ? value.hitRate :
                                                    value.usage}
                                    </Typography>
                                    <Chip
                                        label={value.status}
                                        size="small"
                                        color={getStatusColor(value.status)}
                                        sx={{ minWidth: 70 }}
                                    />
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const AdminDashboard = () => {
    const admin = useSelector(selectUser);
    const { hasPermission } = usePermissions();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        projects: 0,
        team: 0,
        blog: 0,
        contacts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);

            // Load stats from APIs
            const [projectsData, teamData, blogData, contactsData] = await Promise.allSettled([
                projectsAPI.getProjectStats(),
                teamAPI.getTeamStats(),
                blogAPI.getBlogStats(),
                contactAPI.getContactStats()
            ]);

            setStats({
                projects: projectsData.status === 'fulfilled' ? projectsData.value.total : 0,
                team: teamData.status === 'fulfilled' ? teamData.value.total : 0,
                blog: blogData.status === 'fulfilled' ? blogData.value.total : 0,
                contacts: contactsData.status === 'fulfilled' ? contactsData.value.total : 0
            });
        } catch (error) {
            console.error('Error loading stats:', error);
            // Fallback to mock data
            setStats({
                projects: 12,
                team: 8,
                blog: 24,
                contacts: 156
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                        Welcome back, {admin?.firstName}! 👋
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Here's what's happening with your website today.
                    </Typography>
                </Box>
            </motion.div>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Total Projects"
                        value={stats.projects}
                        icon={<Work sx={{ fontSize: 24 }} />}
                        trend="+12% from last month"
                        color="primary"
                        loading={loading}
                        onClick={() => navigate('/admin/projects')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Team Members"
                        value={stats.team}
                        icon={<Group sx={{ fontSize: 24 }} />}
                        trend="+2 new this month"
                        color="success"
                        loading={loading}
                        onClick={() => navigate('/admin/team')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Blog Posts"
                        value={stats.blog}
                        icon={<Article sx={{ fontSize: 24 }} />}
                        trend="+8 published"
                        color="warning"
                        loading={loading}
                        onClick={() => navigate('/admin/blog')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Contact Inquiries"
                        value={stats.contacts}
                        icon={<ContactMail sx={{ fontSize: 24 }} />}
                        trend="+23 this week"
                        color="info"
                        loading={loading}
                        onClick={() => navigate('/admin/contacts')}
                    />
                </Grid>
            </Grid>

            {/* Main Content Grid */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <QuickActions hasPermission={hasPermission} navigate={navigate} />
                        <RecentActivity />
                    </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                    <SystemStatus />
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;