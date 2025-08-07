import { useState, useMemo, useCallback, memo } from 'react'
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
    Card,
} from '@mui/material'
import {
    ViewModuleOutlined,
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
    StorageOutlined,
    FilterListOutlined,
    GridViewOutlined
} from '@mui/icons-material'
import { Link } from 'react-router-dom'
import Button from '../components/UI/Button'

// Updated imports - using our new API hooks
import { useProjects, useProjectStats } from '../hooks/useAPI'

// Memoized ProjectCard component to prevent re-renders
const ProjectCard = memo(({ project, index }) => {
    const [isHovered, setIsHovered] = useState(false)

    const getCategoryIcon = useCallback((category) => {
        const iconMap = {
            'web_application': <WebOutlined />,
            'mobile_application': <PhoneAndroidOutlined />,
            'e_commerce': <StorageOutlined />,
            'ui_ux_design': <DesignServicesOutlined />,
            'api': <CodeOutlined />,
            'desktop_application': <StorageOutlined />
        }
        return iconMap[category] || <WorkOutlined />
    }, [])

    const getCategoryColor = useCallback((category) => {
        const colorMap = {
            'web_application': 'var(--sage-600)',
            'mobile_application': 'var(--coral-600)',
            'e_commerce': 'var(--sand-700)',
            'ui_ux_design': 'var(--coral-600)',
            'api': 'var(--stone-800)',
            'desktop_application': 'var(--stone-600)'
        }
        return colorMap[category] || 'var(--stone-600)'
    }, [])

    // Memoize category color to prevent recalculation
    const categoryColor = useMemo(() => getCategoryColor(project.category), [project.category, getCategoryColor])
    const categoryIcon = useMemo(() => getCategoryIcon(project.category), [project.category, getCategoryIcon])

    // Memoize image source
    const imageSrc = useMemo(() => {
        return project.featured_image ||
            project.thumbnail ||
            project.images?.[0] ||
            `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&auto=format&q=80`
    }, [project.featured_image, project.thumbnail, project.images])

    // Memoize technologies
    const technologies = useMemo(() => {
        return (project.technologies || project.tech_stack || []).slice(0, 3)
    }, [project.technologies, project.tech_stack])

    const extraTechCount = useMemo(() => {
        const totalTech = (project.technologies || project.tech_stack || []).length
        return totalTech > 3 ? totalTech - 3 : 0
    }, [project.technologies, project.tech_stack])

    // Event handlers
    const handleMouseEnter = useCallback(() => {
        setIsHovered(true)
    }, [])

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false)
    }, [])

    const handleImageError = useCallback((e) => {
        e.target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&auto=format&q=80'
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            style={{ height: '100%' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
                <Card
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: 'none',
                        borderRadius: '28px',
                        backgroundColor: 'white',
                        boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        transform: isHovered ? 'translateY(-12px)' : 'translateY(0px)',
                        '&:hover': {
                            boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.15)',
                        }
                    }}
                >
                    {/* Image Container - Fixed Height */}
                    <Box
                        sx={{
                            position: 'relative',
                            height: 250,
                            overflow: 'hidden',
                            backgroundColor: '#f8f9fa'
                        }}
                    >
                        <Box
                            component="img"
                            src={imageSrc}
                            alt={project.title}
                            onError={handleImageError}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        />

                        {/* Overlay */}
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                background: `linear-gradient(135deg, ${categoryColor}dd 0%, ${categoryColor}80 40%, transparent 100%)`,
                                opacity: isHovered ? 1 : 0,
                                transition: 'opacity 0.4s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '50%',
                                    backgroundColor: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                                    transform: isHovered ? 'scale(1)' : 'scale(0.8)',
                                    opacity: isHovered ? 1 : 0,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                            >
                                <LaunchOutlined sx={{ color: categoryColor, fontSize: 24 }} />
                            </Box>
                        </Box>

                        {/* Category Badge */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 20,
                                left: 20,
                            }}
                        >
                            <Chip
                                icon={categoryIcon}
                                label={project.category_display || project.category?.replace('_', ' ').toUpperCase()}
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    color: categoryColor,
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    backdropFilter: 'blur(8px)',
                                    height: 32,
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Content Container */}
                    <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Title and Arrow */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    color: 'var(--stone-800)',
                                    lineHeight: 1.3,
                                    flex: 1,
                                    mr: 2,
                                }}
                            >
                                {project.title}
                            </Typography>

                            <ArrowOutward
                                sx={{
                                    color: categoryColor,
                                    fontSize: 20,
                                    transform: isHovered ? 'translate(4px, -4px) rotate(45deg)' : 'translate(0px, 0px) rotate(0deg)',
                                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                            />
                        </Box>

                        {/* Description */}
                        {(project.short_description || project.description) && (
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'var(--stone-600)',
                                    mb: 2,
                                    flex: 1,
                                    lineHeight: 1.5,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                                {project.short_description || project.description}
                            </Typography>
                        )}

                        {/* Technologies */}
                        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                            {technologies.map((tech, idx) => (
                                <Chip
                                    key={`${project.id}-tech-${idx}`}
                                    label={tech}
                                    size="small"
                                    sx={{
                                        backgroundColor: `${categoryColor}15`,
                                        color: categoryColor,
                                        fontSize: '0.7rem',
                                        height: 24,
                                        borderRadius: '12px',
                                        fontWeight: 500,
                                    }}
                                />
                            ))}
                            {extraTechCount > 0 && (
                                <Chip
                                    label={`+${extraTechCount}`}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'var(--stone-100)',
                                        color: 'var(--stone-600)',
                                        fontSize: '0.7rem',
                                        height: 24,
                                        borderRadius: '12px',
                                        fontWeight: 500,
                                    }}
                                />
                            )}
                        </Stack>

                        {/* Project Info */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {project.client && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'var(--stone-500)',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {project.client}
                                    </Typography>
                                )}
                                {project.completion_date && project.client && (
                                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: 'var(--stone-300)' }} />
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
                                    color: categoryColor,
                                    fontWeight: 600,
                                    fontSize: '0.8rem',
                                }}
                            >
                                View Project
                            </Typography>
                        </Box>
                    </Box>
                </Card>
            </Link>
        </motion.div>
    )
})

// Set display name for debugging
ProjectCard.displayName = 'ProjectCard'

const Projects = () => {
    const [filters, setFilters] = useState({
        category: 'all',
        technology: 'all',
    })
    const [hoveredCategory, setHoveredCategory] = useState(null)

    // Build query parameters for API
    const queryParams = useCallback(() => {
        const params = { status: 'published' }
        if (filters.category !== 'all') params.category = filters.category
        if (filters.technology !== 'all') params.technology = filters.technology
        return params
    }, [filters.category, filters.technology])

    // Fetch projects using our new API hooks
    const {
        data: projectsData,
        isLoading,
        error,
        refetch,
        isError
    } = useProjects(queryParams())

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

    // Memoize categories to prevent recalculation
    const categories = useMemo(() => [
        {
            value: 'all',
            label: 'All Projects',
            color: 'var(--stone-600)',
            bgColor: 'var(--stone-50)',
            icon: <WorkOutlined sx={{ fontSize: 18 }} />,
            count: projects.length
        },
        {
            value: 'web_application',
            label: 'Web Apps',
            color: 'var(--sage-600)',
            bgColor: 'var(--sage-50)',
            icon: <WebOutlined sx={{ fontSize: 18 }} />,
            count: projects.filter(p => p.category === 'web_application').length
        },
        {
            value: 'mobile_application',
            label: 'Mobile',
            color: 'var(--coral-600)',
            bgColor: 'var(--coral-50)',
            icon: <PhoneAndroidOutlined sx={{ fontSize: 18 }} />,
            count: projects.filter(p => p.category === 'mobile_application').length
        },
        {
            value: 'e_commerce',
            label: 'E-Commerce',
            color: 'var(--sand-700)',
            bgColor: 'var(--sand-50)',
            icon: <StorageOutlined sx={{ fontSize: 18 }} />,
            count: projects.filter(p => p.category === 'e_commerce').length
        },
        {
            value: 'ui_ux_design',
            label: 'UI/UX',
            color: 'var(--coral-600)',
            bgColor: 'var(--coral-50)',
            icon: <DesignServicesOutlined sx={{ fontSize: 18 }} />,
            count: projects.filter(p => p.category === 'ui_ux_design').length
        },
        {
            value: 'api',
            label: 'Backend',
            color: 'var(--stone-800)',
            bgColor: 'var(--stone-50)',
            icon: <CodeOutlined sx={{ fontSize: 18 }} />,
            count: projects.filter(p => p.category === 'api').length
        }
    ], [projects])

    // Get featured project (first project or marked as featured)
    const featuredProject = useMemo(() =>
        projects.find(p => p.featured) || projects[0]
        , [projects])

    const regularProjects = useMemo(() =>
        projects.filter(p => p.id !== featuredProject?.id)
        , [projects, featuredProject?.id])

    // Memoize filter handlers
    const handleCategoryFilter = useCallback((categoryValue) => {
        setFilters(prev => ({ ...prev, category: categoryValue }))
    }, [])

    const handleCategoryHover = useCallback((categoryValue) => {
        setHoveredCategory(categoryValue)
    }, [])

    const handleCategoryLeave = useCallback(() => {
        setHoveredCategory(null)
    }, [])

    const handleResetFilters = useCallback(() => {
        setFilters({ category: 'all', technology: 'all' })
    }, [])

    return (
        <>
            <Helmet>
                <title>Our Work - GS Infotech | Exceptional Digital Experiences</title>
                <meta name="description" content="Discover our portfolio of award-winning digital products. From web applications to mobile experiences, see how we transform ideas into exceptional results." />
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
                {/* Background Elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '20%',
                        right: '10%',
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, var(--sage-200) 0%, transparent 70%)',
                        opacity: 0.3,
                        filter: 'blur(60px)',
                    }}
                />

                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Chip
                                icon={<WorkOutlined sx={{ fontSize: 16 }} />}
                                label="OUR PORTFOLIO"
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
                                }}
                            />

                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
                                    fontWeight: 300,
                                    lineHeight: 1,
                                    letterSpacing: '-0.02em',
                                    mb: 4,
                                    color: 'var(--stone-800)',
                                }}
                            >
                                Crafting Digital
                                <br />
                                <span style={{ fontWeight: 600, color: 'var(--sage-600)' }}>Experiences</span>
                            </Typography>

                            <Typography
                                variant="h5"
                                sx={{
                                    color: 'var(--stone-600)',
                                    fontWeight: 300,
                                    lineHeight: 1.6,
                                    maxWidth: '700px',
                                    mx: 'auto',
                                    mb: 6,
                                }}
                            >
                                Every project tells a story. Here are some of our favorites—
                                where innovation meets exceptional execution.
                            </Typography>

                            {/* Stats */}
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
                                }}
                            >
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h3" sx={{ fontWeight: 600, color: 'var(--sage-600)', mb: 0.5 }}>
                                        {projectStats?.total || projects.length || '50+'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'var(--stone-500)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                                        Projects
                                    </Typography>
                                </Box>
                                <Box sx={{ width: 1, height: 40, backgroundColor: 'var(--stone-200)' }} />
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h3" sx={{ fontWeight: 600, color: 'var(--coral-500)', mb: 0.5 }}>
                                        98%
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'var(--stone-500)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                                        Satisfaction
                                    </Typography>
                                </Box>
                                <Box sx={{ width: 1, height: 40, backgroundColor: 'var(--stone-200)' }} />
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h3" sx={{ fontWeight: 600, color: 'var(--sand-600)', mb: 0.5 }}>
                                        5+
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'var(--stone-500)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                                        Years
                                    </Typography>
                                </Box>
                            </Box>
                        </motion.div>
                    </Box>
                </Container>
            </section>

            {/* Filter Navigation */}
            <section
                style={{
                    padding: '4rem 0',
                    backgroundColor: 'white',
                    borderBottom: '1px solid var(--stone-100)',
                }}
            >
                <Container maxWidth="lg">
                    {/* Category Filters - Centered */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                backgroundColor: 'var(--stone-50)',
                                borderRadius: '20px',
                                p: 1,
                                border: '1px solid var(--stone-100)',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            {categories.map((category) => (
                                <motion.div
                                    key={category.value}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    onHoverStart={() => handleCategoryHover(category.value)}
                                    onHoverEnd={handleCategoryLeave}
                                >
                                    <Chip
                                        icon={category.icon}
                                        label={`${category.label} ${category.count > 0 ? `(${category.count})` : ''}`}
                                        onClick={() => handleCategoryFilter(category.value)}
                                        sx={{
                                            cursor: 'pointer',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            px: 2.5,
                                            py: 1.5,
                                            height: 44,
                                            borderRadius: '16px',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            minWidth: 120,
                                            justifyContent: 'center',
                                            ...(filters.category === category.value
                                                ? {
                                                    backgroundColor: category.color,
                                                    color: 'white',
                                                    boxShadow: `0 8px 24px -8px ${category.color}60`,
                                                    transform: 'translateY(-2px)',
                                                }
                                                : {
                                                    backgroundColor: hoveredCategory === category.value ? 'var(--stone-100)' : 'white',
                                                    color: 'var(--stone-700)',
                                                    '&:hover': {
                                                        backgroundColor: 'var(--stone-100)',
                                                        color: 'var(--stone-800)',
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: '0 4px 12px -4px rgba(0, 0, 0, 0.15)',
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
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                textAlign: 'center',
                                color: 'var(--stone-600)',
                                fontSize: '1rem',
                                fontWeight: 500,
                            }}
                        >
                            {isLoading ? 'Loading exceptional projects...' :
                                `Showcasing ${projects.length} ${projects.length === 1 ? 'project' : 'projects'}${filters.category !== 'all' ? ` in ${categories.find(c => c.value === filters.category)?.label}` : ''}`}
                        </Typography>
                    </motion.div>
                </Container>
            </section>

            {/* Projects Section */}
            <section style={{ padding: '6rem 0', backgroundColor: '#fafafa' }}>
                <Container maxWidth="lg">
                    {/* Loading State */}
                    {isLoading && (
                        <Grid container spacing={4} justifyContent="center">
                            {[...Array(6)].map((_, index) => (
                                <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
                                    <Card sx={{ borderRadius: '28px', height: 420 }}>
                                        <Skeleton variant="rectangular" height={250} />
                                        <Box sx={{ p: 3 }}>
                                            <Skeleton variant="text" width="80%" height={24} sx={{ mb: 2 }} />
                                            <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
                                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                                <Skeleton variant="rounded" width={60} height={24} />
                                                <Skeleton variant="rounded" width={50} height={24} />
                                                <Skeleton variant="rounded" width={70} height={24} />
                                            </Box>
                                            <Skeleton variant="text" width="50%" height={16} />
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
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
                                        border: '8px solid var(--coral-100)',
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
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
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
                                                transform: 'translateY(-2px)',
                                            }
                                        }}
                                    >
                                        Try Again
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </Box>
                    )}

                    {/* Projects Grid */}
                    {!isLoading && !isError && projects.length > 0 && (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={filters.category}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                {/* Featured Project */}
                                {featuredProject && (
                                    <Box sx={{ mb: 10, textAlign: 'center' }}>
                                        <Typography
                                            variant="h3"
                                            sx={{
                                                fontSize: { xs: '2rem', md: '2.5rem' },
                                                fontWeight: 300,
                                                mb: 6,
                                                color: 'var(--stone-800)',
                                                letterSpacing: '-0.01em',
                                            }}
                                        >
                                            Featured
                                            <span style={{ fontWeight: 600, color: 'var(--sage-600)' }}> Work</span>
                                        </Typography>

                                        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                                            <ProjectCard project={featuredProject} index={0} />
                                        </Box>
                                    </Box>
                                )}

                                {/* Projects Grid */}
                                <Box>
                                    {(featuredProject && regularProjects.length > 0) && (
                                        <Typography
                                            variant="h3"
                                            sx={{
                                                fontSize: { xs: '2rem', md: '2.5rem' },
                                                fontWeight: 300,
                                                mb: 6,
                                                color: 'var(--stone-800)',
                                                textAlign: 'center',
                                                letterSpacing: '-0.01em',
                                            }}
                                        >
                                            More
                                            <span style={{ fontWeight: 600, color: 'var(--coral-500)' }}> Projects</span>
                                        </Typography>
                                    )}

                                    <Grid
                                        container
                                        spacing={4}
                                        justifyContent="center"
                                        sx={{
                                            '& .MuiGrid-item': {
                                                display: 'flex',
                                                justifyContent: 'center'
                                            }
                                        }}
                                    >
                                        {(featuredProject ? regularProjects : projects).map((project, index) => (
                                            <Grid item xs={12} sm={6} md={4} key={project.id}>
                                                <Box sx={{ width: '100%', maxWidth: 400 }}>
                                                    <ProjectCard
                                                        project={project}
                                                        index={featuredProject ? index + 1 : index}
                                                    />
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
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
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            onClick={handleResetFilters}
                                            variant="contained"
                                            sx={{
                                                backgroundColor: 'var(--sage-600)',
                                                color: 'white',
                                                borderRadius: '50px',
                                                px: 6,
                                                py: 2,
                                                fontWeight: 500,
                                                fontSize: '1rem',
                                                '&:hover': {
                                                    backgroundColor: 'var(--sage-700)',
                                                    transform: 'translateY(-2px)',
                                                }
                                            }}
                                        >
                                            {filters.category !== 'all' ? 'View All Projects' : 'Refresh'}
                                        </Button>
                                    </motion.div>

                                    <Link to="/contact" style={{ textDecoration: 'none' }}>
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                                        </motion.div>
                                    </Link>
                                </Stack>
                            </motion.div>
                        </Box>
                    )}
                </Container>
            </section>

            {/* CTA Section */}
            {!isLoading && !isError && projects.length > 0 && (
                <section
                    style={{
                        padding: '8rem 0',
                        background: 'linear-gradient(135deg, var(--stone-800) 0%, var(--stone-900) 100%)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            opacity: 0.05,
                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px)`,
                        }}
                    />

                    <Container maxWidth="md" sx={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <Typography
                                variant="h2"
                                sx={{
                                    fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
                                    fontWeight: 300,
                                    lineHeight: 1.1,
                                    letterSpacing: '-0.02em',
                                    mb: 4,
                                    color: 'white',
                                }}
                            >
                                Ready to Create
                                <br />
                                <span style={{
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, var(--sage-400) 0%, var(--coral-400) 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    Something Amazing?
                                </span>
                            </Typography>

                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    fontWeight: 300,
                                    mb: 6,
                                    maxWidth: '600px',
                                    mx: 'auto',
                                    lineHeight: 1.6,
                                }}
                            >
                                Let's collaborate to create something extraordinary that makes a lasting impact
                                on your audience and drives your business forward.
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
                                <Link to="/contact" className="no-underline">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            endIcon={<ArrowOutward />}
                                            sx={{
                                                backgroundColor: 'white',
                                                color: 'var(--stone-800)',
                                                borderRadius: '50px',
                                                px: 6,
                                                py: 2.5,
                                                fontSize: '1rem',
                                                fontWeight: 500,
                                                letterSpacing: '0.025em',
                                                textTransform: 'none',
                                                boxShadow: '0 8px 25px -8px rgba(255, 255, 255, 0.3)',
                                                transition: 'all 0.4s ease',
                                                '&:hover': {
                                                    backgroundColor: 'var(--sage-50)',
                                                    transform: 'translateY(-3px)',
                                                    boxShadow: '0 12px 35px -8px rgba(255, 255, 255, 0.4)'
                                                }
                                            }}
                                        >
                                            Start Your Project
                                        </Button>
                                    </motion.div>
                                </Link>

                                <Link to="/about" className="no-underline">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            variant="outlined"
                                            size="large"
                                            sx={{
                                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                                color: 'white',
                                                borderRadius: '50px',
                                                px: 6,
                                                py: 2.5,
                                                fontSize: '1rem',
                                                fontWeight: 500,
                                                letterSpacing: '0.025em',
                                                textTransform: 'none',
                                                transition: 'all 0.4s ease',
                                                '&:hover': {
                                                    borderColor: 'white',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                    transform: 'translateY(-2px)',
                                                }
                                            }}
                                        >
                                            Learn About Us
                                        </Button>
                                    </motion.div>
                                </Link>
                            </Stack>

                            {/* Trust Indicators */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, flexWrap: 'wrap', mt: 8 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            backgroundColor: 'var(--sage-400)',
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        Free Consultation
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            backgroundColor: 'var(--coral-400)',
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        24/7 Support
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            backgroundColor: 'var(--sand-400)',
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        Money-back Guarantee
                                    </Typography>
                                </Box>
                            </Box>
                        </motion.div>
                    </Container>
                </section>
            )}
        </>
    )
}

export default Projects
