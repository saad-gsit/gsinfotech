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
    Grid
} from '@mui/material'
import {
    ArrowBackOutlined,
    LaunchOutlined,
    CodeOutlined,
    CalendarTodayOutlined,
    BusinessOutlined
} from '@mui/icons-material'

// Updated import - using React Query hook
import { useProject } from '@/hooks/useApi'

const ProjectDetail = () => {
    const { id } = useParams()

    // Updated hook usage - using React Query
    const { data, isLoading, error, isError } = useProject(id)

    // Loading state
    if (isLoading) {
        return (
            <Container maxWidth="lg" className="pt-32 pb-16">
                <Box className="max-w-6xl mx-auto">
                    <Skeleton variant="text" width={200} height={32} className="mb-8" />
                    <Skeleton variant="text" width="80%" height={64} className="mb-4" />
                    <Stack direction="row" spacing={1} className="mb-8">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} variant="rectangular" width={80} height={32} />
                        ))}
                    </Stack>
                    <Skeleton variant="rectangular" width="100%" height={400} className="mb-8" />
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={8}>
                            <Skeleton variant="text" width="100%" height={24} className="mb-2" />
                            <Skeleton variant="text" width="100%" height={24} className="mb-2" />
                            <Skeleton variant="text" width="80%" height={24} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Skeleton variant="rectangular" width="100%" height={200} />
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        )
    }

    // Error state
    if (isError || !data) {
        return (
            <Container maxWidth="lg" className="pt-32 pb-16">
                <Box className="max-w-6xl mx-auto text-center">
                    <Alert severity="error" className="mb-8">
                        <Typography variant="h6" className="mb-2">
                            Project Not Found
                        </Typography>
                        <Typography variant="body2">
                            {error?.response?.data?.message || "The project you're looking for doesn't exist."}
                        </Typography>
                    </Alert>
                    <Link to="/projects" className="no-underline">
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackOutlined />}
                            className="border-black text-black hover:bg-black hover:text-white rounded-none"
                        >
                            Back to Projects
                        </Button>
                    </Link>
                </Box>
            </Container>
        )
    }

    // Handle different response structures
    const project = data.project || data

    return (
        <>
            <Helmet>
                <title>{project.title} - GS Infotech Project</title>
                <meta name="description" content={project.description || project.short_description} />
                <meta property="og:title" content={project.title} />
                <meta property="og:description" content={project.description || project.short_description} />
                {project.featured_image && <meta property="og:image" content={project.featured_image} />}
            </Helmet>

            <article className="bg-white">
                {/* Hero Section */}
                <section className="pt-32 pb-16 bg-gray-50">
                    <Container maxWidth="lg">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-6xl mx-auto"
                        >
                            {/* Breadcrumb */}
                            <Link to="/projects" className="no-underline">
                                <Button
                                    startIcon={<ArrowBackOutlined />}
                                    className="text-gray-600 hover:text-black mb-8 normal-case"
                                >
                                    Back to Projects
                                </Button>
                            </Link>

                            <Grid container spacing={8} alignItems="center">
                                <Grid item xs={12} lg={8}>
                                    {/* Project Meta */}
                                    <Stack direction="row" spacing={2} className="mb-4">
                                        {project.category && (
                                            <Chip
                                                label={project.category.replace('_', ' ')}
                                                className="bg-black text-white rounded-none"
                                                size="small"
                                            />
                                        )}
                                        {project.status && (
                                            <Chip
                                                label={project.status}
                                                variant="outlined"
                                                className="border-gray-300 text-gray-600 rounded-none"
                                                size="small"
                                            />
                                        )}
                                    </Stack>

                                    {/* Title */}
                                    <Typography
                                        variant="h1"
                                        className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight"
                                    >
                                        {project.title}
                                    </Typography>

                                    {/* Description */}
                                    <Typography
                                        variant="h6"
                                        className="text-gray-600 font-light mb-8 leading-relaxed"
                                    >
                                        {project.description || project.short_description}
                                    </Typography>

                                    {/* Technologies */}
                                    {project.technologies && project.technologies.length > 0 && (
                                        <Stack direction="row" spacing={1} className="flex-wrap gap-y-2 mb-8">
                                            {project.technologies.map((tech, index) => (
                                                <Chip
                                                    key={index}
                                                    label={tech}
                                                    variant="outlined"
                                                    className="border-gray-300 text-gray-600 rounded-none"
                                                    size="small"
                                                />
                                            ))}
                                        </Stack>
                                    )}

                                    {/* Action Buttons */}
                                    <Stack direction="row" spacing={3}>
                                        {project.project_url && (
                                            <Button
                                                variant="contained"
                                                size="large"
                                                startIcon={<LaunchOutlined />}
                                                href={project.project_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-black hover:bg-gray-900 text-white rounded-none px-6 py-3 font-light tracking-wide normal-case"
                                            >
                                                View Live Project
                                            </Button>
                                        )}
                                        {project.github_url && (
                                            <Button
                                                variant="outlined"
                                                size="large"
                                                startIcon={<CodeOutlined />}
                                                href={project.github_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="border-black text-black hover:bg-black hover:text-white rounded-none px-6 py-3 font-light tracking-wide normal-case"
                                            >
                                                Source Code
                                            </Button>
                                        )}
                                    </Stack>
                                </Grid>

                                {/* Project Info Sidebar */}
                                <Grid item xs={12} lg={4}>
                                    <Box className="bg-white p-8 shadow-lg">
                                        <Typography variant="h6" className="font-medium mb-6">
                                            Project Details
                                        </Typography>

                                        <Stack spacing={4}>
                                            {project.client && (
                                                <Box>
                                                    <Typography variant="caption" className="text-gray-500 uppercase tracking-wider text-xs block mb-1">
                                                        Client
                                                    </Typography>
                                                    <Typography variant="body1" className="font-medium">
                                                        {project.client}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {project.duration && (
                                                <Box>
                                                    <Typography variant="caption" className="text-gray-500 uppercase tracking-wider text-xs block mb-1">
                                                        Duration
                                                    </Typography>
                                                    <Typography variant="body1" className="font-medium">
                                                        {project.duration}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {(project.start_date || project.created_at) && (
                                                <Box>
                                                    <Typography variant="caption" className="text-gray-500 uppercase tracking-wider text-xs block mb-1">
                                                        Completed
                                                    </Typography>
                                                    <Typography variant="body1" className="font-medium">
                                                        {new Date(project.end_date || project.start_date || project.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long'
                                                        })}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {project.team_size && (
                                                <Box>
                                                    <Typography variant="caption" className="text-gray-500 uppercase tracking-wider text-xs block mb-1">
                                                        Team Size
                                                    </Typography>
                                                    <Typography variant="body1" className="font-medium">
                                                        {project.team_size} developers
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Box>
                                </Grid>
                            </Grid>
                        </motion.div>
                    </Container>
                </section>

                {/* Project Images */}
                {project.featured_image && (
                    <section className="py-16 bg-white">
                        <Container maxWidth="lg">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="max-w-6xl mx-auto"
                            >
                                <img
                                    src={project.featured_image}
                                    alt={project.title}
                                    className="w-full h-96 md:h-[600px] object-cover shadow-xl"
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                    }}
                                />
                            </motion.div>
                        </Container>
                    </section>
                )}

                {/* Project Content */}
                {project.content && (
                    <section className="py-16 bg-gray-50">
                        <Container maxWidth="lg">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="max-w-6xl mx-auto"
                            >
                                <Typography variant="h4" className="font-light mb-8">
                                    Project Overview
                                </Typography>
                                <Box
                                    className="prose prose-lg prose-gray max-w-none"
                                    sx={{
                                        '& h1, & h2, & h3, & h4, & h5, & h6': {
                                            fontFamily: 'inherit',
                                            fontWeight: 500,
                                            color: '#111827',
                                            marginTop: '2rem',
                                            marginBottom: '1rem',
                                        },
                                        '& p': {
                                            marginBottom: '1.5rem',
                                            lineHeight: '1.75',
                                            color: '#374151',
                                        },
                                        '& img': {
                                            borderRadius: '0.5rem',
                                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                            margin: '2rem 0',
                                        }
                                    }}
                                    dangerouslySetInnerHTML={{
                                        __html: project.content
                                    }}
                                />
                            </motion.div>
                        </Container>
                    </section>
                )}

                {/* CTA Section */}
                <section className="py-16 bg-black text-white">
                    <Container maxWidth="lg">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="max-w-6xl mx-auto text-center"
                        >
                            <Typography variant="h4" className="font-light mb-6">
                                Like what you see?
                            </Typography>
                            <Typography variant="body1" className="text-gray-400 mb-8">
                                Let's discuss how we can help bring your ideas to life.
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
                                <Link to="/contact" className="no-underline">
                                    <Button
                                        variant="contained"
                                        size="large"
                                        className="bg-white text-black hover:bg-gray-100 rounded-none px-8 py-3 font-light tracking-wide normal-case"
                                    >
                                        Start a Project
                                    </Button>
                                </Link>
                                <Link to="/projects" className="no-underline">
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        className="border-white text-white hover:bg-white hover:text-black rounded-none px-8 py-3 font-light tracking-wide normal-case"
                                    >
                                        View More Projects
                                    </Button>
                                </Link>
                            </Stack>
                        </motion.div>
                    </Container>
                </section>
            </article>
        </>
    )
}

export default ProjectDetail