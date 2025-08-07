// Updated ProjectDetail.jsx - Structured Content Display
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
    Container,
    Typography,
    Box,
    Chip,
    Stack,
    Button,
    Alert,
    Skeleton,
    Grid,
    Card,
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material'
import {
    ArrowBackOutlined,
    LaunchOutlined,
    CodeOutlined,
    CalendarTodayOutlined,
    BusinessOutlined,
    GroupOutlined,
    AccessTimeOutlined,
    CheckCircleOutlined,
    ArrowOutward,
    ShareOutlined,
    BookmarkBorderOutlined,
    VerifiedOutlined,
    BuildOutlined,
    VisibilityOutlined,
    IntegrationInstructionsOutlined,
    StarOutlined
} from '@mui/icons-material'

// Updated import - using React Query hook
import { useProject } from '@/hooks/useApi'

const ProjectDetail = () => {
    const { id } = useParams()

    // Updated hook usage - using React Query
    const { data, isLoading, error, isError } = useProject(id)

    // Loading state with enhanced skeletons
    if (isLoading) {
        return (
            <Box sx={{ backgroundColor: 'white', minHeight: '100vh' }}>
                {/* Hero Skeleton */}
                <Box sx={{ pt: 12, pb: 8, background: 'linear-gradient(135deg, var(--sage-50) 0%, var(--sand-50) 100%)' }}>
                    <Container maxWidth="xl">
                        <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
                            <Skeleton variant="rectangular" width={120} height={40} sx={{ mb: 4, borderRadius: '20px' }} />
                            <Grid container spacing={6}>
                                <Grid item xs={12} lg={8}>
                                    <Stack spacing={1} sx={{ mb: 3 }}>
                                        <Skeleton variant="rounded" width={100} height={28} />
                                        <Skeleton variant="rounded" width={80} height={28} />
                                    </Stack>
                                    <Skeleton variant="text" width="90%" height={80} sx={{ mb: 3 }} />
                                    <Skeleton variant="text" width="100%" height={60} sx={{ mb: 4 }} />
                                    <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                                        {[...Array(4)].map((_, i) => (
                                            <Skeleton key={i} variant="rounded" width={80} height={32} />
                                        ))}
                                    </Stack>
                                    <Stack direction="row" spacing={3}>
                                        <Skeleton variant="rounded" width={160} height={48} />
                                        <Skeleton variant="rounded" width={140} height={48} />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} lg={4}>
                                    <Card sx={{ p: 4, borderRadius: '24px' }}>
                                        <Skeleton variant="text" width="60%" height={28} sx={{ mb: 3 }} />
                                        {[...Array(4)].map((_, i) => (
                                            <Box key={i} sx={{ mb: 3 }}>
                                                <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
                                                <Skeleton variant="text" width="80%" height={24} />
                                            </Box>
                                        ))}
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    </Container>
                </Box>

                {/* Content Skeleton */}
                <Container maxWidth="xl" sx={{ py: 8 }}>
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} variant="rectangular" width="100%" height={200} sx={{ borderRadius: '24px', mb: 4 }} />
                    ))}
                </Container>
            </Box>
        )
    }

    // Enhanced error state
    if (isError || !data) {
        return (
            <Box sx={{ backgroundColor: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
                <Container maxWidth="md">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ textAlign: 'center' }}
                    >
                        <Box
                            sx={{
                                width: 120,
                                height: 120,
                                backgroundColor: 'var(--coral-50)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 4,
                            }}
                        >
                            <BusinessOutlined sx={{ fontSize: 48, color: 'var(--coral-400)' }} />
                        </Box>
                        <Typography variant="h3" sx={{ color: 'var(--stone-800)', fontWeight: 300, mb: 2 }}>
                            Project Not Found
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'var(--stone-600)', mb: 4, maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}>
                            {error?.response?.data?.message || "The project you're looking for doesn't exist or has been moved."}
                        </Typography>
                        <Link to="/projects" style={{ textDecoration: 'none' }}>
                            <Button
                                startIcon={<ArrowBackOutlined />}
                                sx={{
                                    backgroundColor: 'var(--sage-600)',
                                    color: 'white',
                                    borderRadius: '50px',
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 500,
                                    '&:hover': {
                                        backgroundColor: 'var(--sage-700)',
                                        transform: 'translateY(-2px)',
                                    }
                                }}
                            >
                                Back to Projects
                            </Button>
                        </Link>
                    </motion.div>
                </Container>
            </Box>
        )
    }

    // Handle different response structures
    const project = data.project || data

    const getCategoryColor = (category) => {
        const colorMap = {
            'web_application': 'var(--sage-500)',
            'mobile_application': 'var(--coral-500)',
            'e_commerce': 'var(--sand-600)',
            'ui_ux_design': 'var(--coral-400)',
            'api': 'var(--stone-700)',
            'desktop_application': 'var(--stone-600)'
        }
        return colorMap[category] || 'var(--sage-500)'
    }

    return (
        <>
            <Helmet>
                <title>{project.title} - GS Infotech | Case Study</title>
                <meta name="description" content={project.description || project.short_description} />
                <meta property="og:title" content={`${project.title} - GS Infotech Case Study`} />
                <meta property="og:description" content={project.description || project.short_description} />
                {project.featured_image && <meta property="og:image" content={project.featured_image} />}
            </Helmet>

            <Box sx={{ backgroundColor: 'white' }}>
                {/* Enhanced Hero Section */}
                <section
                    style={{
                        paddingTop: '6rem',
                        paddingBottom: '4rem',
                        background: 'linear-gradient(135deg, var(--sage-50) 0%, var(--sand-25) 100%)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Artistic Background Elements */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '20%',
                            right: '5%',
                            width: 300,
                            height: 300,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, var(--sage-200) 0%, transparent 70%)',
                            opacity: 0.4,
                            filter: 'blur(60px)',
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: '10%',
                            left: '8%',
                            width: 200,
                            height: 200,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, var(--coral-200) 0%, transparent 70%)',
                            opacity: 0.3,
                            filter: 'blur(40px)',
                        }}
                    />

                    <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10 }}>
                        <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                {/* Enhanced Breadcrumb */}
                                <Link to="/projects" style={{ textDecoration: 'none' }}>
                                    <motion.div
                                        whileHover={{ x: -4 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Button
                                            startIcon={<ArrowBackOutlined />}
                                            sx={{
                                                color: 'var(--stone-600)',
                                                fontWeight: 500,
                                                mb: 6,
                                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                borderRadius: '50px',
                                                px: 3,
                                                py: 1,
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                                '&:hover': {
                                                    backgroundColor: 'white',
                                                    color: 'var(--stone-800)',
                                                }
                                            }}
                                        >
                                            Back to Projects
                                        </Button>
                                    </motion.div>
                                </Link>

                                <Grid container spacing={8} alignItems="flex-start">
                                    <Grid item xs={12} lg={8}>
                                        {/* Project Meta */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: 0.1 }}
                                        >
                                            <Stack direction="row" spacing={2} sx={{ mb: 4, flexWrap: 'wrap', gap: 1 }}>
                                                {project.category && (
                                                    <Chip
                                                        label={project.category_display || project.category.replace('_', ' ').toUpperCase()}
                                                        sx={{
                                                            backgroundColor: getCategoryColor(project.category),
                                                            color: 'white',
                                                            fontWeight: 500,
                                                            fontSize: '0.75rem',
                                                            borderRadius: '12px',
                                                            px: 2,
                                                        }}
                                                    />
                                                )}
                                                {project.featured && (
                                                    <Chip
                                                        icon={<VerifiedOutlined sx={{ fontSize: 14 }} />}
                                                        label="Featured"
                                                        sx={{
                                                            backgroundColor: 'var(--sage-400)',
                                                            color: 'white',
                                                            fontWeight: 500,
                                                            fontSize: '0.75rem',
                                                            borderRadius: '12px',
                                                        }}
                                                    />
                                                )}
                                                {project.status === 'completed' && (
                                                    <Chip
                                                        icon={<CheckCircleOutlined sx={{ fontSize: 14 }} />}
                                                        label="Completed"
                                                        sx={{
                                                            backgroundColor: 'var(--sage-100)',
                                                            color: 'var(--sage-700)',
                                                            fontWeight: 500,
                                                            fontSize: '0.75rem',
                                                            borderRadius: '12px',
                                                        }}
                                                    />
                                                )}
                                            </Stack>
                                        </motion.div>

                                        {/* Enhanced Title */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: 0.2 }}
                                        >
                                            <Typography
                                                variant="h1"
                                                sx={{
                                                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' },
                                                    fontWeight: 300,
                                                    lineHeight: 0.9,
                                                    letterSpacing: '-0.02em',
                                                    mb: 4,
                                                    color: 'var(--stone-900)',
                                                    background: 'linear-gradient(135deg, var(--stone-900) 0%, var(--sage-600) 100%)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    backgroundClip: 'text',
                                                }}
                                            >
                                                {project.title}
                                            </Typography>
                                        </motion.div>

                                        {/* Enhanced Description */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: 0.3 }}
                                        >
                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    color: 'var(--stone-600)',
                                                    fontWeight: 300,
                                                    lineHeight: 1.6,
                                                    mb: 6,
                                                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                                                    maxWidth: '600px'
                                                }}
                                            >
                                                {project.description || project.short_description}
                                            </Typography>
                                        </motion.div>

                                        {/* Enhanced Technologies */}
                                        {project.technologies && project.technologies.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.6, delay: 0.4 }}
                                            >
                                                <Typography
                                                    variant="overline"
                                                    sx={{
                                                        color: 'var(--stone-500)',
                                                        fontWeight: 600,
                                                        letterSpacing: '0.1em',
                                                        mb: 2,
                                                        display: 'block'
                                                    }}
                                                >
                                                    Technologies Used
                                                </Typography>
                                                <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5, mb: 6 }}>
                                                    {project.technologies.map((tech, index) => (
                                                        <motion.div
                                                            key={index}
                                                            whileHover={{ scale: 1.05 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <Chip
                                                                label={tech}
                                                                sx={{
                                                                    backgroundColor: 'var(--sand-50)',
                                                                    color: 'var(--sand-700)',
                                                                    fontSize: '0.8rem',
                                                                    height: 36,
                                                                    borderRadius: '18px',
                                                                    fontWeight: 500,
                                                                    border: '1px solid var(--sand-100)',
                                                                    '&:hover': {
                                                                        backgroundColor: 'var(--sand-100)',
                                                                    }
                                                                }}
                                                            />
                                                        </motion.div>
                                                    ))}
                                                </Stack>
                                            </motion.div>
                                        )}

                                        {/* Enhanced Action Buttons */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: 0.5 }}
                                        >
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                                {project.project_url && (
                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                                                        <Button
                                                            variant="contained"
                                                            size="large"
                                                            endIcon={<LaunchOutlined />}
                                                            href={project.project_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            sx={{
                                                                background: 'linear-gradient(135deg, var(--sage-500) 0%, var(--sage-600) 100%)',
                                                                color: 'white',
                                                                borderRadius: '50px',
                                                                px: 6,
                                                                py: 2,
                                                                fontWeight: 500,
                                                                fontSize: '1rem',
                                                                letterSpacing: '0.025em',
                                                                boxShadow: '0 8px 24px -8px rgba(139, 148, 113, 0.4)',
                                                                transition: 'all 0.4s ease',
                                                                '&:hover': {
                                                                    background: 'linear-gradient(135deg, var(--sage-600) 0%, var(--sage-700) 100%)',
                                                                    transform: 'translateY(-2px)',
                                                                    boxShadow: '0 12px 32px -8px rgba(139, 148, 113, 0.5)',
                                                                }
                                                            }}
                                                        >
                                                            View Live Project
                                                        </Button>
                                                    </motion.div>
                                                )}
                                                {project.github_url && (
                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                                                        <Button
                                                            variant="outlined"
                                                            size="large"
                                                            startIcon={<CodeOutlined />}
                                                            href={project.github_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            sx={{
                                                                borderColor: 'var(--sage-400)',
                                                                color: 'var(--sage-600)',
                                                                borderRadius: '50px',
                                                                px: 6,
                                                                py: 2,
                                                                fontWeight: 500,
                                                                fontSize: '1rem',
                                                                letterSpacing: '0.025em',
                                                                borderWidth: 2,
                                                                '&:hover': {
                                                                    backgroundColor: 'var(--sage-50)',
                                                                    borderColor: 'var(--sage-500)',
                                                                    transform: 'translateY(-2px)',
                                                                }
                                                            }}
                                                        >
                                                            Source Code
                                                        </Button>
                                                    </motion.div>
                                                )}
                                            </Stack>
                                        </motion.div>
                                    </Grid>

                                    {/* Enhanced Project Info Sidebar */}
                                    <Grid item xs={12} lg={4}>
                                        <motion.div
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.8, delay: 0.3 }}
                                        >
                                            <Card
                                                sx={{
                                                    p: 4,
                                                    borderRadius: '24px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    backdropFilter: 'blur(20px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                                    boxShadow: '0 16px 40px -12px rgba(139, 148, 113, 0.2)',
                                                    position: 'sticky',
                                                    top: 100,
                                                }}
                                            >
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 500,
                                                        mb: 4,
                                                        color: 'var(--stone-800)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}
                                                >
                                                    <BusinessOutlined sx={{ fontSize: 20, color: 'var(--sage-400)' }} />
                                                    Project Details
                                                </Typography>

                                                <Stack spacing={4}>
                                                    {(project.client_name || project.client) && (
                                                        <Box>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: 'var(--stone-500)',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.1em',
                                                                    fontWeight: 600,
                                                                    display: 'block',
                                                                    mb: 1
                                                                }}
                                                            >
                                                                Client
                                                            </Typography>
                                                            <Typography
                                                                variant="body1"
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    color: 'var(--stone-800)'
                                                                }}
                                                            >
                                                                {project.client_name || project.client}
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    {(project.completion_date || project.end_date || project.start_date || project.created_at) && (
                                                        <Box>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: 'var(--stone-500)',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.1em',
                                                                    fontWeight: 600,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 0.5,
                                                                    mb: 1
                                                                }}
                                                            >
                                                                <CalendarTodayOutlined sx={{ fontSize: 14 }} />
                                                                Completed
                                                            </Typography>
                                                            <Typography
                                                                variant="body1"
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    color: 'var(--stone-800)'
                                                                }}
                                                            >
                                                                {new Date(
                                                                    project.completion_date ||
                                                                    project.end_date ||
                                                                    project.start_date ||
                                                                    project.created_at
                                                                ).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    {/* Project Status */}
                                                    <Box>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: 'var(--stone-500)',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.1em',
                                                                fontWeight: 600,
                                                                display: 'block',
                                                                mb: 1
                                                            }}
                                                        >
                                                            Status
                                                        </Typography>
                                                        <Chip
                                                            icon={<CheckCircleOutlined sx={{ fontSize: 16 }} />}
                                                            label={project.status === 'published' ? 'Successfully Delivered' : 'In Progress'}
                                                            sx={{
                                                                backgroundColor: project.status === 'published' ? 'var(--sage-100)' : 'var(--sand-100)',
                                                                color: project.status === 'published' ? 'var(--sage-700)' : 'var(--sand-700)',
                                                                fontWeight: 500,
                                                                fontSize: '0.75rem',
                                                                borderRadius: '12px',
                                                            }}
                                                        />
                                                    </Box>
                                                </Stack>

                                                <Divider sx={{ my: 4, borderColor: 'var(--stone-100)' }} />

                                                {/* Share Actions */}
                                                <Box>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: 'var(--stone-500)',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.1em',
                                                            fontWeight: 600,
                                                            display: 'block',
                                                            mb: 2
                                                        }}
                                                    >
                                                        Actions
                                                    </Typography>
                                                    <Stack direction="row" spacing={2}>
                                                        <Button
                                                            startIcon={<ShareOutlined />}
                                                            size="small"
                                                            sx={{
                                                                color: 'var(--stone-600)',
                                                                backgroundColor: 'var(--stone-50)',
                                                                borderRadius: '12px',
                                                                px: 2,
                                                                py: 1,
                                                                fontSize: '0.75rem',
                                                                fontWeight: 500,
                                                                '&:hover': {
                                                                    backgroundColor: 'var(--stone-100)',
                                                                }
                                                            }}
                                                            onClick={() => {
                                                                if (navigator.share) {
                                                                    navigator.share({
                                                                        title: project.title,
                                                                        text: project.description,
                                                                        url: window.location.href,
                                                                    });
                                                                } else {
                                                                    navigator.clipboard.writeText(window.location.href);
                                                                }
                                                            }}
                                                        >
                                                            Share
                                                        </Button>
                                                        <Button
                                                            startIcon={<BookmarkBorderOutlined />}
                                                            size="small"
                                                            sx={{
                                                                color: 'var(--stone-600)',
                                                                backgroundColor: 'var(--stone-50)',
                                                                borderRadius: '12px',
                                                                px: 2,
                                                                py: 1,
                                                                fontSize: '0.75rem',
                                                                fontWeight: 500,
                                                                '&:hover': {
                                                                    backgroundColor: 'var(--stone-100)',
                                                                }
                                                            }}
                                                        >
                                                            Save
                                                        </Button>
                                                    </Stack>
                                                </Box>
                                            </Card>
                                        </motion.div>
                                    </Grid>
                                </Grid>
                            </motion.div>
                        </Box>
                    </Container>
                </section>

                {/* Enhanced Project Images Gallery */}
                {project.featured_image && (
                    <section style={{ padding: '6rem 0', backgroundColor: 'white' }}>
                        <Container maxWidth="xl">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                                style={{ maxWidth: '1400px', margin: '0 auto' }}
                            >
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontSize: { xs: '2rem', md: '2.5rem' },
                                        fontWeight: 300,
                                        mb: 6,
                                        color: 'var(--stone-800)',
                                        textAlign: 'center',
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    Project Showcase
                                </Typography>

                                <Box
                                    sx={{
                                        position: 'relative',
                                        borderRadius: '24px',
                                        overflow: 'hidden',
                                        boxShadow: '0 32px 64px -12px rgba(139, 148, 113, 0.2)',
                                        '&:hover img': {
                                            transform: 'scale(1.02)',
                                        }
                                    }}
                                >
                                    <motion.img
                                        src={project.featured_image}
                                        alt={project.title}
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            minHeight: '600px',
                                            maxHeight: '800px',
                                            objectFit: 'cover',
                                            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}
                                        onError={(e) => {
                                            e.target.style.display = 'none'
                                        }}
                                    />

                                    {/* Image Overlay with Project Info */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                                            p: 4,
                                            color: 'white',
                                        }}
                                    >
                                        <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                                            {project.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                            Full-scale implementation showcasing responsive design and user experience
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Additional Images Grid (if available) */}
                                {project.images && project.images.length > 1 && (
                                    <Grid container spacing={3} sx={{ mt: 4 }}>
                                        {project.images.slice(1, 4).map((image, index) => (
                                            <Grid item xs={12} sm={6} md={4} key={index}>
                                                <Box
                                                    sx={{
                                                        borderRadius: '16px',
                                                        overflow: 'hidden',
                                                        boxShadow: '0 8px 24px -8px rgba(139, 148, 113, 0.15)',
                                                        transition: 'all 0.4s ease',
                                                        '&:hover': {
                                                            transform: 'translateY(-4px)',
                                                            boxShadow: '0 16px 32px -8px rgba(139, 148, 113, 0.2)',
                                                        }
                                                    }}
                                                >
                                                    <img
                                                        src={image}
                                                        alt={`${project.title} - View ${index + 2}`}
                                                        style={{
                                                            width: '100%',
                                                            height: '240px',
                                                            objectFit: 'cover',
                                                        }}
                                                    />
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </motion.div>
                        </Container>
                    </section>
                )}

                {/* NEW: Project Overview Section */}
                {project.overview && (
                    <section style={{ padding: '6rem 0', backgroundColor: '#fafafa' }}>
                        <Container maxWidth="lg">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                                style={{ maxWidth: '900px', margin: '0 auto' }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
                                    <VisibilityOutlined sx={{ fontSize: 32, color: 'var(--sage-500)', mr: 2 }} />
                                    <Typography
                                        variant="h3"
                                        sx={{
                                            fontSize: { xs: '2rem', md: '2.5rem' },
                                            fontWeight: 300,
                                            color: 'var(--stone-800)',
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        Project Overview
                                    </Typography>
                                </Box>

                                <Card
                                    sx={{
                                        p: { xs: 4, md: 6 },
                                        borderRadius: '24px',
                                        backgroundColor: 'white',
                                        boxShadow: '0 16px 40px -12px rgba(139, 148, 113, 0.15)',
                                        border: '1px solid var(--stone-100)',
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontSize: '1.1rem',
                                            lineHeight: 1.8,
                                            color: 'var(--stone-600)',
                                            textAlign: 'justify'
                                        }}
                                    >
                                        {project.overview}
                                    </Typography>
                                </Card>
                            </motion.div>
                        </Container>
                    </section>
                )}

                {/* NEW: Key Features Section */}
                {project.key_features && project.key_features.length > 0 && (
                    <section style={{ padding: '6rem 0', backgroundColor: 'white' }}>
                        <Container maxWidth="lg">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 6 }}>
                                    <StarOutlined sx={{ fontSize: 32, color: 'var(--sage-500)', mr: 2 }} />
                                    <Typography
                                        variant="h3"
                                        sx={{
                                            fontSize: { xs: '2rem', md: '2.5rem' },
                                            fontWeight: 300,
                                            color: 'var(--stone-800)',
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        Key Features
                                    </Typography>
                                </Box>

                                <Grid container spacing={4}>
                                    {project.key_features.map((feature, index) => (
                                        <Grid item xs={12} md={6} key={index}>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                                viewport={{ once: true }}
                                            >
                                                <Card
                                                    sx={{
                                                        p: 4,
                                                        borderRadius: '20px',
                                                        border: '1px solid var(--stone-100)',
                                                        backgroundColor: 'white',
                                                        boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.08)',
                                                        transition: 'all 0.4s ease',
                                                        height: '100%',
                                                        '&:hover': {
                                                            transform: 'translateY(-8px)',
                                                            boxShadow: '0 16px 40px -8px rgba(139, 148, 113, 0.2)',
                                                            borderColor: 'var(--sage-200)',
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                                                        <Box
                                                            sx={{
                                                                width: 48,
                                                                height: 48,
                                                                borderRadius: '12px',
                                                                backgroundColor: 'var(--sage-100)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexShrink: 0,
                                                                mt: 0.5
                                                            }}
                                                        >
                                                            <CheckCircleOutlined sx={{ fontSize: 24, color: 'var(--sage-500)' }} />
                                                        </Box>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography
                                                                variant="h6"
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    mb: 2,
                                                                    color: 'var(--stone-800)',
                                                                    fontSize: '1.1rem'
                                                                }}
                                                            >
                                                                Feature {index + 1}
                                                            </Typography>
                                                            <Typography
                                                                variant="body1"
                                                                sx={{
                                                                    color: 'var(--stone-600)',
                                                                    lineHeight: 1.6
                                                                }}
                                                            >
                                                                {feature}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Card>
                                            </motion.div>
                                        </Grid>
                                    ))}
                                </Grid>
                            </motion.div>
                        </Container>
                    </section>
                )}

                {/* NEW: Technical Implementation Section */}
                {project.technical_implementation && (
                    <section style={{ padding: '6rem 0', backgroundColor: '#fafafa' }}>
                        <Container maxWidth="lg">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                                style={{ maxWidth: '900px', margin: '0 auto' }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
                                    <IntegrationInstructionsOutlined sx={{ fontSize: 32, color: 'var(--sage-500)', mr: 2 }} />
                                    <Typography
                                        variant="h3"
                                        sx={{
                                            fontSize: { xs: '2rem', md: '2.5rem' },
                                            fontWeight: 300,
                                            color: 'var(--stone-800)',
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        Technical Implementation
                                    </Typography>
                                </Box>

                                <Card
                                    sx={{
                                        p: { xs: 4, md: 6 },
                                        borderRadius: '24px',
                                        backgroundColor: 'white',
                                        boxShadow: '0 16px 40px -12px rgba(139, 148, 113, 0.15)',
                                        border: '1px solid var(--stone-100)',
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontSize: '1.1rem',
                                            lineHeight: 1.8,
                                            color: 'var(--stone-600)',
                                            textAlign: 'justify',
                                            whiteSpace: 'pre-line'
                                        }}
                                    >
                                        {project.technical_implementation}
                                    </Typography>

                                    {/* Technical Highlights */}
                                    {project.technologies && project.technologies.length > 0 && (
                                        <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid var(--stone-100)' }}>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 500,
                                                    mb: 3,
                                                    color: 'var(--stone-800)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1
                                                }}
                                            >
                                                <BuildOutlined sx={{ fontSize: 20, color: 'var(--sage-400)' }} />
                                                Technology Stack
                                            </Typography>
                                            <Grid container spacing={2}>
                                                {project.technologies.map((tech, index) => (
                                                    <Grid item key={index}>
                                                        <Chip
                                                            label={tech}
                                                            sx={{
                                                                backgroundColor: 'var(--stone-100)',
                                                                color: 'var(--stone-700)',
                                                                fontWeight: 500,
                                                                fontSize: '0.85rem',
                                                                height: 36,
                                                                borderRadius: '18px',
                                                                border: '1px solid var(--stone-200)',
                                                            }}
                                                        />
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Box>
                                    )}
                                </Card>
                            </motion.div>
                        </Container>
                    </section>
                )}

                {/* FALLBACK: Legacy Content Section (for backward compatibility) */}
                {project.content && !project.overview && !project.technical_implementation && (
                    <section style={{ padding: '6rem 0', backgroundColor: '#fafafa' }}>
                        <Container maxWidth="lg">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                                style={{ maxWidth: '900px', margin: '0 auto' }}
                            >
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontSize: { xs: '2rem', md: '2.5rem' },
                                        fontWeight: 300,
                                        mb: 6,
                                        color: 'var(--stone-800)',
                                        textAlign: 'center',
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    Project Details
                                </Typography>

                                <Card
                                    sx={{
                                        p: { xs: 4, md: 6 },
                                        borderRadius: '24px',
                                        backgroundColor: 'white',
                                        boxShadow: '0 16px 40px -12px rgba(139, 148, 113, 0.15)',
                                        border: '1px solid var(--stone-100)',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            '& h1, & h2, & h3, & h4, & h5, & h6': {
                                                fontFamily: 'inherit',
                                                fontWeight: 500,
                                                color: 'var(--stone-800)',
                                                marginTop: '2.5rem',
                                                marginBottom: '1.5rem',
                                                lineHeight: 1.3,
                                                '&:first-of-type': {
                                                    marginTop: 0,
                                                }
                                            },
                                            '& h1': { fontSize: '2rem' },
                                            '& h2': { fontSize: '1.75rem' },
                                            '& h3': { fontSize: '1.5rem' },
                                            '& p': {
                                                marginBottom: '1.5rem',
                                                lineHeight: '1.8',
                                                color: 'var(--stone-600)',
                                                fontSize: '1.1rem',
                                            },
                                            '& img': {
                                                borderRadius: '16px',
                                                boxShadow: '0 12px 32px -8px rgba(139, 148, 113, 0.2)',
                                                margin: '3rem 0',
                                                width: '100%',
                                                height: 'auto',
                                            },
                                            '& ul, & ol': {
                                                paddingLeft: '1.5rem',
                                                marginBottom: '1.5rem',
                                                '& li': {
                                                    marginBottom: '0.5rem',
                                                    color: 'var(--stone-600)',
                                                    lineHeight: '1.7',
                                                }
                                            },
                                            '& blockquote': {
                                                borderLeft: '4px solid var(--sage-400)',
                                                paddingLeft: '1.5rem',
                                                margin: '2rem 0',
                                                fontStyle: 'italic',
                                                color: 'var(--stone-700)',
                                                backgroundColor: 'var(--sage-25)',
                                                padding: '1.5rem',
                                                borderRadius: '0 12px 12px 0',
                                            },
                                            '& code': {
                                                backgroundColor: 'var(--stone-100)',
                                                color: 'var(--stone-800)',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.9em',
                                                fontFamily: 'Monaco, Consolas, monospace',
                                            },
                                            '& pre': {
                                                backgroundColor: 'var(--stone-900)',
                                                color: 'var(--stone-100)',
                                                padding: '1.5rem',
                                                borderRadius: '12px',
                                                overflow: 'auto',
                                                margin: '2rem 0',
                                                '& code': {
                                                    backgroundColor: 'transparent',
                                                    color: 'inherit',
                                                    padding: 0,
                                                }
                                            }
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html: project.content
                                        }}
                                    />
                                </Card>
                            </motion.div>
                        </Container>
                    </section>
                )}

                {/* Enhanced CTA Section */}
                <section
                    style={{
                        padding: '8rem 0',
                        background: 'linear-gradient(135deg, var(--stone-900) 0%, var(--stone-800) 100%)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Artistic Background Elements */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '20%',
                            right: '10%',
                            width: 400,
                            height: 400,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, var(--sage-400) 0%, transparent 70%)',
                            opacity: 0.1,
                            filter: 'blur(80px)',
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: '10%',
                            left: '5%',
                            width: 300,
                            height: 300,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, var(--coral-400) 0%, transparent 70%)',
                            opacity: 0.08,
                            filter: 'blur(60px)',
                        }}
                    />

                    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center' }}
                        >
                            <Typography
                                variant="h2"
                                sx={{
                                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4.5rem' },
                                    fontWeight: 200,
                                    mb: 4,
                                    color: 'white',
                                    letterSpacing: '-0.02em',
                                    lineHeight: 0.9,
                                }}
                            >
                                Inspired by this
                                <br />
                                <span style={{ fontWeight: 400, fontStyle: 'italic', color: 'var(--sage-300)' }}>
                                    project?
                                </span>
                            </Typography>

                            <Typography
                                variant="h5"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    fontWeight: 300,
                                    mb: 8,
                                    maxWidth: '700px',
                                    mx: 'auto',
                                    lineHeight: 1.5,
                                    fontSize: { xs: '1.25rem', md: '1.5rem' }
                                }}
                            >
                                Let's create something equally extraordinary for your business.
                                Every great project starts with a conversation about possibilities.
                            </Typography>

                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={4}
                                justifyContent="center"
                                sx={{ mb: 10 }}
                            >
                                <Link to="/contact" style={{ textDecoration: 'none' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -3 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            background: 'linear-gradient(135deg, var(--sage-500) 0%, var(--sage-600) 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50px',
                                            padding: '20px 40px',
                                            fontSize: '1.1rem',
                                            fontWeight: 600,
                                            letterSpacing: '0.025em',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            boxShadow: '0 12px 32px -8px rgba(139, 148, 113, 0.4)',
                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            minWidth: '220px',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        Start Your Project
                                        <ArrowOutward sx={{ fontSize: 20 }} />
                                    </motion.button>
                                </Link>

                                <Link to="/projects" style={{ textDecoration: 'none' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -3 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            backgroundColor: 'transparent',
                                            color: 'white',
                                            border: '2px solid rgba(255, 255, 255, 0.3)',
                                            borderRadius: '50px',
                                            padding: '18px 40px',
                                            fontSize: '1.1rem',
                                            fontWeight: 500,
                                            letterSpacing: '0.025em',
                                            cursor: 'pointer',
                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            minWidth: '220px',
                                            backdropFilter: 'blur(10px)',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.borderColor = 'white'
                                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                                            e.target.style.boxShadow = '0 8px 24px -8px rgba(255, 255, 255, 0.2)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                                            e.target.style.backgroundColor = 'transparent'
                                            e.target.style.boxShadow = 'none'
                                        }}
                                    >
                                        View More Projects
                                    </motion.button>
                                </Link>
                            </Stack>
                        </motion.div>
                    </Container>
                </section>
            </Box>
        </>
    )
}

export default ProjectDetail