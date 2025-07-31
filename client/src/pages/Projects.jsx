import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
    Container,
    Typography,
    Box,
    Grid,
    Chip,
    Stack,
    IconButton,
    Skeleton,
    Alert,
    Card,
    Avatar,
    Badge
} from '@mui/material'
import {
    ViewModuleOutlined,
    ViewListOutlined,
    ArrowOutward,
    Refresh,
    WorkOutlined,
    TrendingUpOutlined,
    EmojiEventsOutlined,
    LaunchOutlined,
    CodeOutlined,
    DesignServicesOutlined,
    PhoneAndroidOutlined,
    WebOutlined,
    StorageOutlined
} from '@mui/icons-material'
import { Link } from 'react-router-dom'
import Button from '../components/UI/Button'

// Updated imports - using our new API hooks
import { useProjects, useProjectStats } from '../hooks/useAPI'

const Projects = () => {
    const [filters, setFilters] = useState({
        category: 'all',
        technology: 'all',
    })
    const [hoveredProject, setHoveredProject] = useState(null)

    // Build query parameters for API
    const queryParams = useMemo(() => {
        const params = {
            status: 'published'
        }
        if (filters.category !== 'all') params.category = filters.category
        if (filters.technology !== 'all') params.technology = filters.technology
        return params
    }, [filters])

    // Fetch projects using our new API hooks
    const {
        data: projectsData,
        isLoading,
        error,
        refetch,
        isError
    } = useProjects(queryParams)

    // Get project statistics
    const { data: projectStats } = useProjectStats()

    // Handle different response structures from backend
    const projects = useMemo(() => {
        if (!projectsData) return []

        if (Array.isArray(projectsData)) {
            return projectsData
        } else if (projectsData.projects && Array.isArray(projectsData.projects)) {
            return projectsData.projects
        } else if (projectsData.data && Array.isArray(projectsData.data)) {
            return projectsData.data
        }

        console.warn('Unexpected projects data structure:', projectsData)
        return []
    }, [projectsData])

    const categories = [
        {
            value: 'all',
            label: 'All Work',
            color: 'var(--stone-600)',
            icon: <WorkOutlined sx={{ fontSize: 16 }} />
        },
        {
            value: 'web_application',
            label: 'Web Apps',
            color: 'var(--sage-500)',
            icon: <WebOutlined sx={{ fontSize: 16 }} />
        },
        {
            value: 'mobile_application',
            label: 'Mobile',
            color: 'var(--coral-500)',
            icon: <PhoneAndroidOutlined sx={{ fontSize: 16 }} />
        },
        {
            value: 'e_commerce',
            label: 'E-Commerce',
            color: 'var(--sand-600)',
            icon: <StorageOutlined sx={{ fontSize: 16 }} />
        },
        {
            value: 'ui_ux_design',
            label: 'UI/UX',
            color: 'var(--coral-400)',
            icon: <DesignServicesOutlined sx={{ fontSize: 16 }} />
        },
        {
            value: 'api',
            label: 'Backend',
            color: 'var(--stone-700)',
            icon: <CodeOutlined sx={{ fontSize: 16 }} />
        }
    ]

    // Get featured project (first project or marked as featured)
    const featuredProject = projects.find(p => p.featured) || projects[0]
    const regularProjects = projects.filter(p => p.id !== featuredProject?.id)

    const getCategoryIcon = (category) => {
        const iconMap = {
            'web_application': <WebOutlined />,
            'mobile_application': <PhoneAndroidOutlined />,
            'e_commerce': <StorageOutlined />,
            'ui_ux_design': <DesignServicesOutlined />,
            'api': <CodeOutlined />,
            'desktop_application': <StorageOutlined />
        }
        return iconMap[category] || <WorkOutlined />
    }

    const ProjectShowcase = ({ project, index, size = 'regular' }) => {
        const isLarge = size === 'large'
        const isWide = size === 'wide'

        return (
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
                onHoverStart={() => setHoveredProject(project.id)}
                onHoverEnd={() => setHoveredProject(null)}
                style={{ height: '100%' }}
            >
                <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
                    <Card
                        sx={{
                            height: '100%',
                            border: 'none',
                            borderRadius: '28px',
                            backgroundColor: 'white',
                            boxShadow: '0 8px 32px -8px rgba(139, 148, 113, 0.15)',
                            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            '&:hover': {
                                transform: 'translateY(-12px)',
                                boxShadow: '0 32px 64px -12px rgba(139, 148, 113, 0.25)',
                            }
                        }}
                    >
                        {/* Main Image */}
                        <Box
                            sx={{
                                position: 'relative',
                                height: isLarge ? 400 : isWide ? 280 : 240,
                                overflow: 'hidden',
                                backgroundColor: '#f8f9fa'
                            }}
                        >
                            <motion.img
                                src={
                                    project.featured_image ||
                                    project.thumbnail ||
                                    project.images?.[0] ||
                                    `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&auto=format&q=80`
                                }
                                alt={project.title}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                                animate={{
                                    scale: hoveredProject === project.id ? 1.08 : 1,
                                }}
                                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                                onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&auto=format&q=80'
                                }}
                            />

                            {/* Gradient Overlay */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: `linear-gradient(
                                        135deg, 
                                        rgba(139, 148, 113, 0.9) 0%, 
                                        rgba(139, 148, 113, 0.4) 40%,
                                        transparent 100%
                                    )`,
                                    opacity: hoveredProject === project.id ? 1 : 0,
                                    transition: 'opacity 0.4s ease',
                                }}
                            />

                            {/* Project Meta Overlay */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                    opacity: hoveredProject === project.id ? 1 : 0,
                                    y: hoveredProject === project.id ? 0 : 20
                                }}
                                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                                style={{
                                    position: 'absolute',
                                    top: 24,
                                    left: 24,
                                    right: 24,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Chip
                                        icon={getCategoryIcon(project.category)}
                                        label={project.category_display || project.category?.replace('_', ' ').toUpperCase()}
                                        sx={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            color: 'var(--sage-600)',
                                            fontWeight: 500,
                                            fontSize: '0.75rem',
                                            backdropFilter: 'blur(8px)',
                                        }}
                                    />
                                    {project.featured && (
                                        <Chip
                                            icon={<EmojiEventsOutlined sx={{ fontSize: 14 }} />}
                                            label="Featured"
                                            sx={{
                                                backgroundColor: 'var(--coral-400)',
                                                color: 'white',
                                                fontWeight: 500,
                                                fontSize: '0.75rem',
                                            }}
                                        />
                                    )}
                                </Box>

                                {isLarge && (
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'white',
                                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                            borderRadius: '12px',
                                            p: 2,
                                            backdropFilter: 'blur(8px)',
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        {project.short_description || project.description || 'Innovative digital solution crafted with precision and care.'}
                                    </Typography>
                                )}
                            </motion.div>

                            {/* Launch Icon */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                    opacity: hoveredProject === project.id ? 1 : 0,
                                    scale: hoveredProject === project.id ? 1 : 0.8
                                }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                                style={{
                                    position: 'absolute',
                                    bottom: 24,
                                    right: 24,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '50%',
                                        backgroundColor: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.3)',
                                    }}
                                >
                                    <LaunchOutlined sx={{ color: 'var(--sage-600)', fontSize: 20 }} />
                                </Box>
                            </motion.div>
                        </Box>

                        {/* Content */}
                        <Box sx={{ p: isLarge ? 4 : 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                                <Typography
                                    variant={isLarge ? "h4" : "h6"}
                                    sx={{
                                        fontWeight: 600,
                                        color: 'var(--stone-800)',
                                        lineHeight: 1.2,
                                        fontSize: isLarge ? '1.75rem' : '1.25rem',
                                        flex: 1,
                                    }}
                                >
                                    {project.title}
                                </Typography>

                                <motion.div
                                    animate={{ x: hoveredProject === project.id ? 4 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ArrowOutward
                                        sx={{
                                            color: 'var(--sage-400)',
                                            fontSize: isLarge ? 24 : 20,
                                            ml: 2
                                        }}
                                    />
                                </motion.div>
                            </Box>

                            {/* Technologies */}
                            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                                {(project.technologies || project.tech_stack || []).slice(0, isLarge ? 5 : 3).map((tech, idx) => (
                                    <Chip
                                        key={idx}
                                        label={tech}
                                        size="small"
                                        sx={{
                                            backgroundColor: 'var(--sand-50)',
                                            color: 'var(--sand-700)',
                                            fontSize: '0.7rem',
                                            height: 28,
                                            borderRadius: '14px',
                                            fontWeight: 500,
                                            border: '1px solid var(--sand-100)',
                                        }}
                                    />
                                ))}
                                {(project.technologies || project.tech_stack || []).length > (isLarge ? 5 : 3) && (
                                    <Chip
                                        label={`+${(project.technologies || project.tech_stack || []).length - (isLarge ? 5 : 3)}`}
                                        size="small"
                                        sx={{
                                            backgroundColor: 'var(--stone-100)',
                                            color: 'var(--stone-600)',
                                            fontSize: '0.7rem',
                                            height: 28,
                                            borderRadius: '14px',
                                            fontWeight: 500,
                                        }}
                                    />
                                )}
                            </Stack>

                            {/* Project Info */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    {project.client && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: 'var(--stone-500)',
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                            }}
                                        >
                                            {project.client}
                                        </Typography>
                                    )}
                                    {project.completion_date && project.client && (
                                        <span style={{ color: 'var(--stone-300)', fontSize: '0.75rem' }}>•</span>
                                    )}
                                    {project.completion_date && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: 'var(--stone-500)',
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                            }}
                                        >
                                            {new Date(project.completion_date).getFullYear()}
                                        </Typography>
                                    )}
                                </Box>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'var(--sage-600)',
                                        fontWeight: 500,
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    View Case Study
                                </Typography>
                            </Box>
                        </Box>
                    </Card>
                </Link>
            </motion.div>
        )
    }

    return (
        <>
            <Helmet>
                <title>Projects - GS Infotech | Exceptional Digital Experiences</title>
                <meta name="description" content="Discover our portfolio of award-winning digital products. From web applications to mobile experiences, see how we transform ideas into exceptional results." />
                <meta name="keywords" content="portfolio, digital products, web development, mobile apps, UI/UX design, case studies" />
            </Helmet>

            {/* Hero Section */}
            <section
                style={{
                    paddingTop: '8rem',
                    paddingBottom: '6rem',
                    position: 'relative',
                    background: 'linear-gradient(135deg, var(--sage-50) 0%, var(--sand-25) 100%)',
                    overflow: 'hidden'
                }}
            >
                {/* Artistic Background Elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '10%',
                        right: '5%',
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, var(--sage-200) 0%, transparent 70%)',
                        opacity: 0.3,
                        filter: 'blur(60px)',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: '20%',
                        left: '8%',
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, var(--coral-200) 0%, transparent 70%)',
                        opacity: 0.2,
                        filter: 'blur(40px)',
                    }}
                />

                <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <Box sx={{ textAlign: 'center', mb: 8 }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <Chip
                                    icon={<WorkOutlined sx={{ fontSize: 16 }} />}
                                    label="SELECTED WORK"
                                    sx={{
                                        backgroundColor: 'var(--sage-600)',
                                        color: 'white',
                                        fontWeight: 600,
                                        mb: 4,
                                        px: 3,
                                        py: 0.5,
                                        borderRadius: '50px',
                                        fontSize: '0.75rem',
                                        letterSpacing: '0.15em',
                                        boxShadow: '0 8px 24px -8px rgba(139, 148, 113, 0.4)',
                                    }}
                                />
                            </motion.div>

                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '3rem', sm: '4rem', md: '5.5rem', lg: '6.5rem' },
                                    fontWeight: 200,
                                    lineHeight: 0.85,
                                    letterSpacing: '-0.03em',
                                    mb: 6,
                                    color: 'var(--stone-900)',
                                    background: 'linear-gradient(135deg, var(--stone-900) 0%, var(--sage-600) 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                Crafting Digital
                                <br />
                                <span style={{ fontWeight: 400, fontStyle: 'italic' }}>Experiences</span>
                            </Typography>

                            <Typography
                                variant="h4"
                                sx={{
                                    color: 'var(--stone-600)',
                                    fontWeight: 300,
                                    lineHeight: 1.4,
                                    maxWidth: '800px',
                                    mx: 'auto',
                                    mb: 6,
                                    fontSize: { xs: '1.25rem', md: '1.5rem' }
                                }}
                            >
                                Every project tells a story. Here are some of our favorites—
                                <br />
                                where innovation meets exceptional execution.
                            </Typography>

                            {/* Stats Bar */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        borderRadius: '24px',
                                        p: 3,
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 16px 40px -12px rgba(139, 148, 113, 0.2)',
                                    }}
                                >
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h3" sx={{ fontWeight: 600, color: 'var(--sage-600)', fontSize: '2rem' }}>
                                            {projectStats?.total || projects.length || '50+'}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'var(--stone-500)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                                            Projects
                                        </Typography>
                                    </Box>
                                    <Box sx={{ width: 1, height: 40, backgroundColor: 'var(--stone-200)' }} />
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h3" sx={{ fontWeight: 600, color: 'var(--coral-500)', fontSize: '2rem' }}>
                                            98%
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'var(--stone-500)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                                            Satisfaction
                                        </Typography>
                                    </Box>
                                    <Box sx={{ width: 1, height: 40, backgroundColor: 'var(--stone-200)' }} />
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h3" sx={{ fontWeight: 600, color: 'var(--sand-600)', fontSize: '2rem' }}>
                                            5+
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'var(--stone-500)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                                            Years
                                        </Typography>
                                    </Box>
                                </Box>
                            </motion.div>
                        </Box>
                    </motion.div>
                </Container>
            </section>

            {/* Elegant Filter Navigation */}
            <section
                style={{
                    padding: '3rem 0',
                    backgroundColor: 'white',
                    borderBottom: '1px solid var(--stone-100)',
                    position: 'sticky',
                    top: 80,
                    zIndex: 50,
                    backdropFilter: 'blur(20px)',
                }}
            >
                <Container maxWidth="xl">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                backgroundColor: 'var(--stone-50)',
                                borderRadius: '20px',
                                p: 1,
                                border: '1px solid var(--stone-100)',
                            }}
                        >
                            {categories.map((category, index) => (
                                <motion.div
                                    key={category.value}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Chip
                                        icon={category.icon}
                                        label={category.label}
                                        onClick={() => setFilters({ ...filters, category: category.value })}
                                        sx={{
                                            cursor: 'pointer',
                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            px: 3,
                                            py: 1.5,
                                            height: 44,
                                            borderRadius: '16px',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            letterSpacing: '0.025em',
                                            ...(filters.category === category.value
                                                ? {
                                                    backgroundColor: category.color,
                                                    color: 'white',
                                                    boxShadow: `0 8px 24px -8px ${category.color}60`,
                                                    transform: 'translateY(-2px)',
                                                }
                                                : {
                                                    backgroundColor: 'transparent',
                                                    color: 'var(--stone-600)',
                                                    '&:hover': {
                                                        backgroundColor: 'var(--stone-100)',
                                                        color: 'var(--stone-800)',
                                                    }
                                                }
                                            )
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </Box>
                    </Box>

                    {/* Results indicator */}
                    <Typography
                        variant="body2"
                        sx={{
                            textAlign: 'center',
                            color: 'var(--stone-500)',
                            mt: 3,
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }}
                    >
                        {isLoading ? 'Loading exceptional work...' :
                            `Showcasing ${projects.length} ${projects.length === 1 ? 'project' : 'projects'}${filters.category !== 'all' ? ` in ${categories.find(c => c.value === filters.category)?.label}` : ''}`}
                    </Typography>
                </Container>
            </section>

            {/* Projects Showcase */}
            <section style={{ padding: '6rem 0', backgroundColor: '#fafafa', minHeight: '80vh' }}>
                <Container maxWidth="xl">
                    {/* Loading State */}
                    {isLoading && (
                        <Box>
                            {/* Featured Project Skeleton */}
                            <Box sx={{ mb: 8 }}>
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={8}>
                                        <Card sx={{ borderRadius: '28px', height: 500 }}>
                                            <Skeleton variant="rectangular" height={320} />
                                            <Box sx={{ p: 4 }}>
                                                <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
                                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                                    <Skeleton variant="rounded" width={80} height={28} />
                                                    <Skeleton variant="rounded" width={70} height={28} />
                                                    <Skeleton variant="rounded" width={90} height={28} />
                                                </Box>
                                                <Skeleton variant="text" width="100%" height={20} />
                                                <Skeleton variant="text" width="80%" height={20} />
                                            </Box>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Stack spacing={3} sx={{ height: '100%' }}>
                                            <Card sx={{ borderRadius: '28px', flex: 1 }}>
                                                <Skeleton variant="rectangular" height={200} />
                                                <Box sx={{ p: 3 }}>
                                                    <Skeleton variant="text" width="80%" height={24} />
                                                    <Skeleton variant="text" width="60%" height={20} />
                                                </Box>
                                            </Card>
                                            <Card sx={{ borderRadius: '28px', flex: 1 }}>
                                                <Skeleton variant="rectangular" height={200} />
                                                <Box sx={{ p: 3 }}>
                                                    <Skeleton variant="text" width="80%" height={24} />
                                                    <Skeleton variant="text" width="60%" height={20} />
                                                </Box>
                                            </Card>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Regular Projects Skeleton */}
                            <Grid container spacing={4}>
                                {[...Array(6)].map((_, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                        <Card sx={{ borderRadius: '28px' }}>
                                            <Skeleton variant="rectangular" height={240} />
                                            <Box sx={{ p: 3 }}>
                                                <Skeleton variant="text" width="70%" height={24} sx={{ mb: 1 }} />
                                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                                    <Skeleton variant="rounded" width={60} height={24} />
                                                    <Skeleton variant="rounded" width={50} height={24} />
                                                </Box>
                                                <Skeleton variant="text" width="50%" height={16} />
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* Error State */}
                    {isError && (
                        <Box sx={{ textAlign: 'center', py: 12 }}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
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
                                    <WorkOutlined sx={{ fontSize: 48, color: 'var(--coral-400)' }} />
                                </Box>
                                <Typography variant="h4" sx={{ color: 'var(--stone-700)', fontWeight: 300, mb: 2 }}>
                                    Unable to load projects
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'var(--stone-500)', mb: 4, maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}>
                                    {error?.message || 'Something went wrong while fetching our amazing work. Please try again.'}
                                </Typography>
                                <Button
                                    onClick={() => refetch()}
                                    startIcon={<Refresh />}
                                    sx={{
                                        backgroundColor: 'var(--sage-600)',
                                        color: 'white',
                                        borderRadius: '50px',
                                        px: 4,
                                        py: 1.5,
                                        fontWeight: 500,
                                        '&:hover': {
                                            backgroundColor: 'var(--sage-700)',
                                        }
                                    }}
                                >
                                    Try Again
                                </Button>
                            </motion.div>
                        </Box>
                    )}

                    {/* Projects Display */}
                    {!isLoading && !isError && projects.length > 0 && (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={filters.category}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                {/* Featured Project Section */}
                                {featuredProject && (
                                    <Box sx={{ mb: 8 }}>
                                        <Typography
                                            variant="h3"
                                            sx={{
                                                fontSize: { xs: '2rem', md: '2.5rem' },
                                                fontWeight: 300,
                                                mb: 6,
                                                color: 'var(--stone-800)',
                                                textAlign: 'center',
                                            }}
                                        >
                                            Featured Work
                                        </Typography>

                                        <Grid container spacing={4}>
                                            <Grid item xs={12} lg={8}>
                                                <ProjectShowcase project={featuredProject} index={0} size="large" />
                                            </Grid>
                                            <Grid item xs={12} lg={4}>
                                                <Stack spacing={3} sx={{ height: '100%' }}>
                                                    {regularProjects.slice(0, 2).map((project, index) => (
                                                        <Box key={project.id} sx={{ flex: 1 }}>
                                                            <ProjectShowcase project={project} index={index + 1} size="regular" />
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                )}

                                {/* Regular Projects Grid */}
                                {regularProjects.length > 2 && (
                                    <Box>
                                        <Typography
                                            variant="h3"
                                            sx={{
                                                fontSize: { xs: '2rem', md: '2.5rem' },
                                                fontWeight: 300,
                                                mb: 6,
                                                color: 'var(--stone-800)',
                                                textAlign: 'center',
                                            }}
                                        >
                                            More Projects
                                        </Typography>

                                        <Grid container spacing={4}>
                                            {regularProjects.slice(featuredProject ? 2 : 0).map((project, index) => (
                                                <Grid item xs={12} sm={6} lg={4} key={project.id}>
                                                    <ProjectShowcase
                                                        project={project}
                                                        index={featuredProject ? index + 3 : index}
                                                        size="regular"
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}

                                {/* No featured project - show all in grid */}
                                {!featuredProject && projects.length > 0 && (
                                    <Grid container spacing={4}>
                                        {projects.map((project, index) => (
                                            <Grid item xs={12} sm={6} lg={4} key={project.id}>
                                                <ProjectShowcase project={project} index={index} size="regular" />
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {/* Empty State */}
                    {!isLoading && !isError && projects.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 16 }}>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Box
                                    sx={{
                                        width: 160,
                                        height: 160,
                                        backgroundColor: 'var(--sage-50)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 6,
                                        border: '8px solid var(--sage-100)',
                                    }}
                                >
                                    <WorkOutlined sx={{ fontSize: 64, color: 'var(--sage-400)' }} />
                                </Box>

                                <Typography
                                    variant="h3"
                                    sx={{
                                        color: 'var(--stone-700)',
                                        fontWeight: 300,
                                        mb: 3,
                                        fontSize: { xs: '2rem', md: '2.5rem' }
                                    }}
                                >
                                    No Projects Found
                                </Typography>

                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: 'var(--stone-500)',
                                        fontWeight: 300,
                                        mb: 6,
                                        maxWidth: 500,
                                        mx: 'auto',
                                        lineHeight: 1.6
                                    }}
                                >
                                    {filters.category !== 'all'
                                        ? `We haven't created any ${categories.find(c => c.value === filters.category)?.label.toLowerCase()} projects yet. Check back soon or explore all our work.`
                                        : 'Our portfolio is being curated with exceptional projects. Amazing work coming soon.'
                                    }
                                </Typography>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
                                    <Button
                                        onClick={() => setFilters({ ...filters, category: 'all', technology: 'all' })}
                                        variant="contained"
                                        sx={{
                                            backgroundColor: 'var(--sage-600)',
                                            color: 'white',
                                            borderRadius: '50px',
                                            px: 6,
                                            py: 2,
                                            fontWeight: 500,
                                            fontSize: '1rem',
                                            boxShadow: '0 8px 24px -8px rgba(139, 148, 113, 0.4)',
                                            '&:hover': {
                                                backgroundColor: 'var(--sage-700)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 12px 32px -8px rgba(139, 148, 113, 0.5)',
                                            }
                                        }}
                                    >
                                        {filters.category !== 'all' ? 'View All Projects' : 'Refresh'}
                                    </Button>

                                    <Link to="/contact" style={{ textDecoration: 'none' }}>
                                        <Button
                                            variant="outlined"
                                            sx={{
                                                borderColor: 'var(--sage-400)',
                                                color: 'var(--sage-600)',
                                                borderRadius: '50px',
                                                px: 6,
                                                py: 2,
                                                fontWeight: 500,
                                                fontSize: '1rem',
                                                '&:hover': {
                                                    backgroundColor: 'var(--sage-50)',
                                                    borderColor: 'var(--sage-500)',
                                                    transform: 'translateY(-2px)',
                                                }
                                            }}
                                        >
                                            Start Your Project
                                        </Button>
                                    </Link>
                                </Stack>
                            </motion.div>
                        </Box>
                    )}
                </Container>
            </section>

            {/* Closing CTA Section */}
            {!isLoading && !isError && projects.length > 0 && (
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

                    {/* Geometric Pattern Overlay */}
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            opacity: 0.03,
                            backgroundImage: `repeating-linear-gradient(
                                45deg,
                                transparent,
                                transparent 50px,
                                rgba(255,255,255,0.1) 50px,
                                rgba(255,255,255,0.1) 52px
                            )`,
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
                                    fontSize: { xs: '3rem', md: '4.5rem', lg: '5.5rem' },
                                    fontWeight: 200,
                                    mb: 4,
                                    color: 'white',
                                    letterSpacing: '-0.02em',
                                    lineHeight: 0.9,
                                }}
                            >
                                Ready to Create
                                <br />
                                <span style={{ fontWeight: 400, fontStyle: 'italic', color: 'var(--sage-300)' }}>
                                    Something Amazing?
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
                                Every exceptional project starts with a conversation.
                                Let's discuss how we can bring your vision to life with the same passion and precision you see in our work.
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

                                <Link to="/about" style={{ textDecoration: 'none' }}>
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
                                        Learn Our Process
                                    </motion.button>
                                </Link>
                            </Stack>

                            {/* Enhanced Company Highlights */}
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '24px',
                                    p: 4,
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                }}
                            >
                                {[
                                    {
                                        number: projectStats?.total || projects.length || '50+',
                                        label: 'Projects Delivered',
                                        icon: <TrendingUpOutlined sx={{ fontSize: 24, mb: 1, color: 'var(--sage-300)' }} />
                                    },
                                    {
                                        number: '100%',
                                        label: 'On-Time Delivery',
                                        icon: <EmojiEventsOutlined sx={{ fontSize: 24, mb: 1, color: 'var(--coral-300)' }} />
                                    },
                                    {
                                        number: '24/7',
                                        label: 'Support Available',
                                        icon: <WorkOutlined sx={{ fontSize: 24, mb: 1, color: 'var(--sand-300)' }} />
                                    }
                                ].map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                                        viewport={{ once: true }}
                                        style={{ textAlign: 'center' }}
                                    >
                                        <Box sx={{ mb: 1 }}>
                                            {stat.icon}
                                        </Box>
                                        <Typography
                                            variant="h4"
                                            sx={{
                                                color: 'white',
                                                fontWeight: 600,
                                                mb: 0.5,
                                                fontSize: { xs: '1.5rem', md: '2rem' }
                                            }}
                                        >
                                            {stat.number}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                fontSize: '0.875rem',
                                                fontWeight: 400,
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {stat.label}
                                        </Typography>
                                    </motion.div>
                                ))}
                            </Box>

                            {/* Trust Statement */}
                            <Box sx={{ mt: 8, pt: 6, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        fontSize: '1rem',
                                        lineHeight: 1.6,
                                        fontStyle: 'italic',
                                        maxWidth: 600,
                                        mx: 'auto'
                                    }}
                                >
                                    "Trusted by startups and Fortune 500 companies alike.
                                    From initial concept to final deployment, we deliver digital experiences that exceed expectations and drive real business results."
                                </Typography>
                            </Box>
                        </motion.div>
                    </Container>
                </section>
            )}
        </>
    )
}

export default Projects