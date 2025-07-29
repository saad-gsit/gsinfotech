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
    Alert
} from '@mui/material'
import {
    ViewModuleOutlined,
    ViewListOutlined,
    FilterListOutlined,
    ArrowForward,
    Refresh
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
    const [viewMode, setViewMode] = useState('grid')

    

    // Build query parameters for API
    const queryParams = useMemo(() => {
        const params = {
            status: 'published'  // Always show published projects on public page
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

        // Handle different possible response structures
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
        { value: 'all', label: 'All Projects' },
        { value: 'web_application', label: 'Web Applications' },
        { value: 'mobile_application', label: 'Mobile Apps' },
        { value: 'desktop_application', label: 'Desktop Apps' },
        { value: 'e_commerce', label: 'E-Commerce' },
        { value: 'portfolio', label: 'Portfolio Sites' },
        { value: 'cms', label: 'CMS Solutions' },
        { value: 'api', label: 'API Development' }
    ]

    const ProjectCard = ({ project, index }) => (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            className="group cursor-pointer"
        >
            <Link to={`/projects/${ project.id}`} className="no-underline">
                <Box className="relative overflow-hidden bg-gray-50 aspect-[4/3] rounded-lg">
                    {/* Project Image - Handle multiple image sources */}
                    <img
                        src={
                            project.featured_image ||
                            project.thumbnail ||
                            project.images?.[0] ||
                            project.image ||
                            `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=450&fit=crop&auto=format&q=80`
                        }
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=450&fit=crop&auto=format&q=80'
                        }}
                    />

                    {/* Overlay */}
                    <Box className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end p-6">
                        <Box className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                            <Typography variant="h5" className="text-white font-medium mb-1">
                                {project.title}
                            </Typography>
                            <Typography variant="body2" className="text-white/80">
                                {project.category_display || project.category?.replace('_', ' ').toUpperCase() || 'Project'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Status Badge */}
                    {project.status && project.status !== 'published' && (
                        <Chip
                            label={project.status.toUpperCase()}
                            size="small"
                            className="absolute top-4 left-4 bg-white/90 text-gray-700"
                        />
                    )}

                    {/* Featured Badge */}
                    {project.featured && (
                        <Chip
                            label="FEATURED"
                            size="small"
                            className="absolute top-4 right-4 bg-black text-white"
                        />
                    )}
                </Box>

                <Box className="pt-4">
                    {/* Technologies */}
                    <Stack direction="row" spacing={1} className="mb-3 flex-wrap gap-y-1">
                        {(project.technologies || project.tech_stack || []).slice(0, 3).map((tech, idx) => (
                            <Chip
                                key={idx}
                                label={tech}
                                size="small"
                                className="bg-gray-100 text-gray-700 font-light text-xs"
                            />
                        ))}
                        {(project.technologies || project.tech_stack || []).length > 3 && (
                            <Chip
                                label={`+${(project.technologies || project.tech_stack || []).length - 3}`}
                                size="small"
                                className="bg-gray-100 text-gray-700 font-light text-xs"
                            />
                        )}
                    </Stack>

                    {/* Description */}
                    <Typography variant="body2" className="text-gray-600 leading-relaxed line-clamp-2 mb-3">
                        {project.short_description || project.description || 'No description available.'}
                    </Typography>

                    {/* View Project Link */}
                    <Box className="flex items-center text-black group-hover:translate-x-2 transition-transform duration-300">
                        <Typography variant="body2" className="font-medium mr-2">
                            View Project
                        </Typography>
                        <ArrowForward sx={{ fontSize: 16 }} />
                    </Box>

                    {/* Project Meta */}
                    <Box className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        {project.completion_date && (
                            <Typography variant="caption">
                                Completed: {new Date(project.completion_date).getFullYear()}
                            </Typography>
                        )}
                        {project.client && (
                            <Typography variant="caption">
                                Client: {project.client}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Link>
        </motion.div>
    )

    const ListProjectCard = ({ project, index }) => (
        <motion.div
            layout
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="group"
        >
            <Link to={`/projects/${project.slug || project.id}`} className="no-underline">
                <Box className="flex gap-6 p-6 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100">
                    {/* Image */}
                    <Box className="w-48 h-32 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                        <img
                            src={
                                project.featured_image ||
                                project.thumbnail ||
                                project.images?.[0] ||
                                project.image ||
                                `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=130&fit=crop&auto=format&q=80`
                            }
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=130&fit=crop&auto=format&q=80'
                            }}
                        />
                    </Box>

                    {/* Content */}
                    <Box className="flex-1">
                        <Box className="flex items-start justify-between mb-2">
                            <Typography variant="h5" className="font-medium group-hover:text-blue-600 transition-colors">
                                {project.title}
                            </Typography>
                            {project.featured && (
                                <Chip label="Featured" size="small" className="bg-black text-white ml-2" />
                            )}
                        </Box>

                        <Typography variant="body2" className="text-gray-600 mb-3 line-clamp-2">
                            {project.short_description || project.description || 'No description available.'}
                        </Typography>

                        <Stack direction="row" spacing={1} className="mb-3">
                            {(project.technologies || project.tech_stack || []).slice(0, 4).map((tech, idx) => (
                                <Chip
                                    key={idx}
                                    label={tech}
                                    size="small"
                                    className="bg-gray-100 text-gray-600 text-xs"
                                />
                            ))}
                        </Stack>

                        <Box className="flex items-center justify-between">
                            <Box className="flex items-center gap-4">
                                <Typography variant="caption" className="text-gray-500">
                                    {project.category_display || project.category?.replace('_', ' ').toUpperCase() || 'Project'}
                                </Typography>
                                {project.completion_date && (
                                    <Typography variant="caption" className="text-gray-500">
                                        • {new Date(project.completion_date).getFullYear()}
                                    </Typography>
                                )}
                            </Box>

                            <Box className="flex items-center text-blue-600">
                                <Typography variant="body2" className="font-medium mr-1">
                                    View Details
                                </Typography>
                                <ArrowForward fontSize="small" />
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Link>
        </motion.div>
    )

    return (
        <>
            <Helmet>
                <title>Projects - GS Infotech | Our Work Portfolio</title>
                <meta name="description" content="Explore our portfolio of digital products including web applications, mobile apps, and enterprise solutions. See our latest work and case studies." />
                <meta name="keywords" content="portfolio, projects, web development, mobile apps, software development, case studies" />
            </Helmet>

            {/* Hero Section */}
            <section className="pt-32 pb-16 bg-white">
                <Container maxWidth="lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Typography variant="overline" className="text-gray-500 tracking-widest mb-4">
                            OUR WORK
                        </Typography>
                        <Typography variant="h1" className="text-5xl md:text-6xl lg:text-7xl font-light mb-6 leading-tight">
                            Featured Projects
                        </Typography>
                        <Box className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                            <Typography variant="h5" className="text-gray-600 font-light max-w-3xl">
                                A selection of our recent work across various industries and technologies.
                                {projectStats?.total && ` Over ${projectStats.total} projects delivered.`}
                            </Typography>

                            {/* Quick Stats */}
                            {projectStats && (
                                <Box className="flex gap-6">
                                    <Box className="text-center">
                                        <Typography variant="h4" className="font-light">
                                            {projectStats.total || projects.length}
                                        </Typography>
                                        <Typography variant="caption" className="text-gray-500 uppercase tracking-wider">
                                            Projects
                                        </Typography>
                                    </Box>
                                    {projectStats.categories && (
                                        <Box className="text-center">
                                            <Typography variant="h4" className="font-light">
                                                {Object.keys(projectStats.categories).length}
                                            </Typography>
                                            <Typography variant="caption" className="text-gray-500 uppercase tracking-wider">
                                                Categories
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </motion.div>
                </Container>
            </section>

            {/* Filters Section */}
            <section className="py-8 bg-gray-50 sticky top-20 z-40 border-y border-gray-200">
                <Container maxWidth="lg">
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        {/* Category Filters */}
                        <Stack direction="row" spacing={2} className="overflow-x-auto pb-2">
                            {categories.map((category) => (
                                <Chip
                                    key={category.value}
                                    label={category.label}
                                    onClick={() => setFilters({ ...filters, category: category.value })}
                                    className={`cursor-pointer transition-all whitespace-nowrap ${filters.category === category.value
                                        ? 'bg-black text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                        }`}
                                    sx={{
                                        fontWeight: 300,
                                        borderRadius: 0,
                                        px: 2,
                                        '&:hover': {
                                            transform: 'translateY(-1px)'
                                        }
                                    }}
                                />
                            ))}
                        </Stack>

                        {/* View Mode Toggle */}
                        <Stack direction="row" spacing={1}>
                            <IconButton
                                onClick={() => setViewMode('grid')}
                                className={viewMode === 'grid' ? 'text-black' : 'text-gray-400'}
                                title="Grid View"
                            >
                                <ViewModuleOutlined />
                            </IconButton>
                            <IconButton
                                onClick={() => setViewMode('list')}
                                className={viewMode === 'list' ? 'text-black' : 'text-gray-400'}
                                title="List View"
                            >
                                <ViewListOutlined />
                            </IconButton>
                        </Stack>
                    </Stack>

                    {/* Results Count */}
                    <Typography variant="caption" className="text-gray-500 mt-2 block">
                        {isLoading ? 'Loading...' : `${projects.length} project${projects.length !== 1 ? 's' : ''} found`}
                        {filters.category !== 'all' && ` in ${categories.find(c => c.value === filters.category)?.label}`}
                    </Typography>
                </Container>
            </section>

            {/* Projects Content */}
            <section className="py-16 bg-white min-h-[60vh]">
                <Container maxWidth="lg">
                    {/* Loading State */}
                    {isLoading && (
                        <Grid container spacing={4}>
                            {[...Array(6)].map((_, index) => (
                                <Grid item xs={12} md={viewMode === 'grid' ? 4 : 12} key={index}>
                                    {viewMode === 'grid' ? (
                                        <Box>
                                            <Skeleton variant="rectangular" height={300} className="rounded-lg" />
                                            <Box className="pt-4">
                                                <Skeleton variant="text" width="60%" />
                                                <Skeleton variant="text" width="100%" />
                                                <Skeleton variant="text" width="80%" />
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Box className="flex gap-6 p-6">
                                            <Skeleton variant="rectangular" width={192} height={128} />
                                            <Box className="flex-1">
                                                <Skeleton variant="text" width="70%" height={32} />
                                                <Skeleton variant="text" width="100%" />
                                                <Skeleton variant="text" width="90%" />
                                                <Skeleton variant="text" width="40%" />
                                            </Box>
                                        </Box>
                                    )}
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {/* Error State */}
                    {isError && (
                        <Box className="text-center py-20">
                            <Alert severity="error" className="mb-4 max-w-md mx-auto">
                                <Typography variant="h6" className="mb-2">
                                    Unable to load projects
                                </Typography>
                                <Typography variant="body2">
                                    {error?.message || error?.response?.data?.message || 'Something went wrong while fetching projects.'}
                                </Typography>
                            </Alert>
                            <Button
                                onClick={() => refetch()}
                                startIcon={<Refresh />}
                                className="text-black hover:text-gray-700 normal-case"
                            >
                                Try Again
                            </Button>
                        </Box>
                    )}

                    {/* Projects Grid/List */}
                    {!isLoading && !isError && projects.length > 0 && (
                        <AnimatePresence mode="wait">
                            {viewMode === 'grid' ? (
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Grid container spacing={4}>
                                        {projects.map((project, index) => (
                                            <Grid item xs={12} md={4} key={project.id || index}>
                                                <ProjectCard project={project} index={index} />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="list"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {projects.map((project, index) => (
                                        <ListProjectCard key={project.id || index} project={project} index={index} />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}

                    {/* Empty State */}
                    {!isLoading && !isError && projects.length === 0 && (
                        <Box className="text-center py-20">
                            <Typography variant="h6" className="text-gray-500 mb-2">
                                No projects found
                            </Typography>
                            <Typography variant="body2" className="text-gray-400 mb-6">
                                {filters.category !== 'all'
                                    ? 'Try adjusting your filters or view all projects.'
                                    : 'Projects will appear here once they are added to the database.'
                                }
                            </Typography>
                            <Button
                                onClick={() => setFilters({ ...filters, category: 'all' })}
                                className="text-black hover:text-gray-700 normal-case"
                            >
                                {filters.category !== 'all' ? 'Show All Projects' : 'Refresh'}
                            </Button>
                        </Box>
                    )}
                </Container>
            </section>
        </>
    )
}

export default Projects