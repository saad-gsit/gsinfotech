// client/src/components/Test/APITest.jsx - Enhanced version
import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Chip,
    CircularProgress,
    Alert,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    ExpandMore as ExpandMoreIcon,
    Storage as StorageIcon,
    Group as GroupIcon,
    Article as ArticleIcon,
    Email as EmailIcon,
    Dashboard as DashboardIcon,
    MonitorHeart as HealthIcon,
} from '@mui/icons-material';

// Import our API hooks
import {
    useServerHealth,
    useDatabaseConnection,
    useProjects,
    useTeam,
    useBlogPosts,
    useContactStats,
    useFeaturedProjects,
    useLeadershipTeam,
    useFeaturedPosts,
} from '../../hooks/useApi';

const APITest = () => {
    const [expandedSection, setExpandedSection] = useState('health');

    // System Health Checks
    const {
        data: serverHealth,
        isLoading: healthLoading,
        error: healthError
    } = useServerHealth();

    const {
        data: dbConnection,
        isLoading: dbLoading,
        error: dbError
    } = useDatabaseConnection();

    // Data Queries
    const {
        data: projects,
        isLoading: projectsLoading,
        error: projectsError
    } = useProjects();

    const {
        data: featuredProjects,
        isLoading: featuredProjectsLoading
    } = useFeaturedProjects(3);

    const {
        data: team,
        isLoading: teamLoading,
        error: teamError
    } = useTeam();

    const {
        data: leadershipTeam,
        isLoading: leadershipLoading
    } = useLeadershipTeam();

    const {
        data: blogPosts,
        isLoading: blogLoading,
        error: blogError
    } = useBlogPosts();

    const {
        data: featuredPosts,
        isLoading: featuredPostsLoading
    } = useFeaturedPosts(3);

    const {
        data: contactStats,
        isLoading: contactStatsLoading
    } = useContactStats();

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpandedSection(isExpanded ? panel : false);
    };

    const StatusChip = ({ loading, error, data, label }) => {
        if (loading) {
            return (
                <Chip
                    icon={<CircularProgress size={16} />}
                    label={`Loading ${label}...`}
                    color="default"
                    variant="outlined"
                    size="small"
                />
            );
        }

        if (error) {
            return (
                <Chip
                    icon={<ErrorIcon />}
                    label={`${label} Error`}
                    color="error"
                    size="small"
                />
            );
        }

        if (data) {
            return (
                <Chip
                    icon={<CheckCircleIcon />}
                    label={`${label} OK`}
                    color="success"
                    size="small"
                />
            );
        }

        return (
            <Chip
                label={`${label} Not Loaded`}
                color="default"
                size="small"
            />
        );
    };

    const DataDisplay = ({ data, loading, error, title, emptyMessage = "No data found" }) => {
        if (loading) {
            return (
                <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">Loading {title.toLowerCase()}...</Typography>
                </Box>
            );
        }

        if (error) {
            return (
                <Alert severity="error" size="small">
                    Error loading {title.toLowerCase()}: {error.message}
                </Alert>
            );
        }

        if (!data) {
            return (
                <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                </Typography>
            );
        }

        // Handle different data structures
        if (Array.isArray(data)) {
            return (
                <Typography variant="body2">
                    Found {data.length} {title.toLowerCase()}
                    {data.length > 0 && (
                        <Typography variant="caption" display="block" color="text.secondary">
                            Latest: {data[0]?.title || data[0]?.name || data[0]?.subject || 'Item 1'}
                        </Typography>
                    )}
                </Typography>
            );
        }

        if (typeof data === 'object') {
            return (
                <Box>
                    {Object.entries(data).slice(0, 3).map(([key, value]) => (
                        <Typography key={key} variant="caption" display="block">
                            {key}: {typeof value === 'object' ? JSON.stringify(value).substring(0, 50) + '...' : String(value)}
                        </Typography>
                    ))}
                </Box>
            );
        }

        return (
            <Typography variant="body2">
                {String(data).substring(0, 100)}
                {String(data).length > 100 && '...'}
            </Typography>
        );
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" gutterBottom align="center">
                🧪 API Integration Test Dashboard
            </Typography>

            <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
                Testing connection to GS Infotech backend API endpoints
            </Typography>

            {/* Quick Status Overview */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        🚀 Quick Status Overview
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                        <StatusChip loading={healthLoading} error={healthError} data={serverHealth} label="Server" />
                        <StatusChip loading={dbLoading} error={dbError} data={dbConnection} label="Database" />
                        <StatusChip loading={projectsLoading} error={projectsError} data={projects} label="Projects" />
                        <StatusChip loading={teamLoading} error={teamError} data={team} label="Team" />
                        <StatusChip loading={blogLoading} error={blogError} data={blogPosts} label="Blog" />
                        <StatusChip loading={contactStatsLoading} error={null} data={contactStats} label="Contact" />
                    </Box>
                </CardContent>
            </Card>

            {/* Detailed Test Results */}
            <Grid container spacing={2}>

                {/* System Health Section */}
                <Grid item xs={12}>
                    <Accordion
                        expanded={expandedSection === 'health'}
                        onChange={handleAccordionChange('health')}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <HealthIcon color="primary" />
                                <Typography variant="h6">System Health</Typography>
                                <StatusChip loading={healthLoading || dbLoading} error={healthError || dbError} data={serverHealth && dbConnection} label="System" />
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                🌐 Server Health
                                            </Typography>
                                            <DataDisplay
                                                data={serverHealth}
                                                loading={healthLoading}
                                                error={healthError}
                                                title="Server Health"
                                            />
                                            {serverHealth && (
                                                <Box mt={1}>
                                                    <Typography variant="caption" display="block">
                                                        Environment: {serverHealth.environment}
                                                    </Typography>
                                                    <Typography variant="caption" display="block">
                                                        Uptime: {Math.floor(serverHealth.uptime / 60)} minutes
                                                    </Typography>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                🗄️ Database Connection
                                            </Typography>
                                            <DataDisplay
                                                data={dbConnection}
                                                loading={dbLoading}
                                                error={dbError}
                                                title="Database"
                                            />
                                            {dbConnection && (
                                                <Box mt={1}>
                                                    <Typography variant="caption" display="block">
                                                        Database: {dbConnection.database?.name}
                                                    </Typography>
                                                    <Typography variant="caption" display="block">
                                                        MySQL: {dbConnection.database?.mysql_version?.substring(0, 20)}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>

                {/* Projects Section */}
                <Grid item xs={12}>
                    <Accordion
                        expanded={expandedSection === 'projects'}
                        onChange={handleAccordionChange('projects')}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <StorageIcon color="primary" />
                                <Typography variant="h6">Projects API</Typography>
                                <StatusChip loading={projectsLoading || featuredProjectsLoading} error={projectsError} data={projects} label="Projects" />
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                📁 All Projects
                                            </Typography>
                                            <DataDisplay
                                                data={projects}
                                                loading={projectsLoading}
                                                error={projectsError}
                                                title="Projects"
                                                emptyMessage="No projects found"
                                            />
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                ⭐ Featured Projects
                                            </Typography>
                                            <DataDisplay
                                                data={featuredProjects}
                                                loading={featuredProjectsLoading}
                                                error={null}
                                                title="Featured Projects"
                                            />
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>

                {/* Team Section */}
                <Grid item xs={12}>
                    <Accordion
                        expanded={expandedSection === 'team'}
                        onChange={handleAccordionChange('team')}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <GroupIcon color="primary" />
                                <Typography variant="h6">Team API</Typography>
                                <StatusChip loading={teamLoading || leadershipLoading} error={teamError} data={team} label="Team" />
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                👥 All Team Members
                                            </Typography>
                                            <DataDisplay
                                                data={team}
                                                loading={teamLoading}
                                                error={teamError}
                                                title="Team Members"
                                            />
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                👑 Leadership Team
                                            </Typography>
                                            <DataDisplay
                                                data={leadershipTeam}
                                                loading={leadershipLoading}
                                                error={null}
                                                title="Leadership"
                                            />
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>

                {/* Blog Section */}
                <Grid item xs={12}>
                    <Accordion
                        expanded={expandedSection === 'blog'}
                        onChange={handleAccordionChange('blog')}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <ArticleIcon color="primary" />
                                <Typography variant="h6">Blog API</Typography>
                                <StatusChip loading={blogLoading || featuredPostsLoading} error={blogError} data={blogPosts} label="Blog" />
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                📝 All Blog Posts
                                            </Typography>
                                            <DataDisplay
                                                data={blogPosts}
                                                loading={blogLoading}
                                                error={blogError}
                                                title="Blog Posts"
                                            />
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                🌟 Featured Posts
                                            </Typography>
                                            <DataDisplay
                                                data={featuredPosts}
                                                loading={featuredPostsLoading}
                                                error={null}
                                                title="Featured Posts"
                                            />
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>

                {/* Contact Section */}
                <Grid item xs={12}>
                    <Accordion
                        expanded={expandedSection === 'contact'}
                        onChange={handleAccordionChange('contact')}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <EmailIcon color="primary" />
                                <Typography variant="h6">Contact API</Typography>
                                <StatusChip loading={contactStatsLoading} error={null} data={contactStats} label="Contact" />
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                📊 Contact Statistics
                                            </Typography>
                                            <DataDisplay
                                                data={contactStats}
                                                loading={contactStatsLoading}
                                                error={null}
                                                title="Contact Stats"
                                                emptyMessage="No contact statistics available"
                                            />
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>

            </Grid>

            {/* API Endpoints Reference */}
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        🔗 API Endpoints Reference
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>Public Endpoints:</Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemText
                                        primary="GET /api/projects"
                                        secondary="Fetch all projects"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="GET /api/team"
                                        secondary="Fetch team members"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="GET /api/blog"
                                        secondary="Fetch blog posts"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="POST /api/contact"
                                        secondary="Submit contact form"
                                    />
                                </ListItem>
                            </List>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>System Endpoints:</Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemText
                                        primary="GET /api/health"
                                        secondary="Server health check"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="GET /api/db-test"
                                        secondary="Database connection test"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="GET /api/performance"
                                        secondary="Performance metrics"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="GET /api"
                                        secondary="API documentation"
                                    />
                                </ListItem>
                            </List>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Footer */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    🧪 API Integration Test Complete • GS Infotech • {new Date().toLocaleString()}
                </Typography>
                <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={() => window.location.reload()}
                >
                    Refresh Tests
                </Button>
            </Box>
        </Box>
    );
};

export default APITest;