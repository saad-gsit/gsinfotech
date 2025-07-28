import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Chip,
    IconButton,
    Avatar,
    AvatarGroup,
    Rating,
    Fab,
    Stack,
    Skeleton
} from '@mui/material'
import {
    ArrowForward,
    EastOutlined,
    AutoAwesomeOutlined,
    RocketLaunchOutlined,
    DesignServicesOutlined,
    PhoneIphoneOutlined,
    CloudOutlined,
    TrendingUp,
    Groups,
    WorkspacePremium,
    SupportAgent,
    KeyboardArrowUp
} from '@mui/icons-material'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'

// Updated imports - using our new API hooks
import {
    useFeaturedProjects,
    useLeadershipTeam,
    useProjectStats,
    useTeamStats,
} from '@/hooks/useApi'

const Home = () => {
    const { scrollY } = useScroll()
    const y1 = useTransform(scrollY, [0, 300], [0, 50])
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [stats, setStats] = useState(null)

    // Fetch data using our new API hooks
    const { data: featuredProjects, isLoading: projectsLoading } = useFeaturedProjects(3)
    const { data: leadershipTeam, isLoading: teamLoading } = useLeadershipTeam()
    const { data: projectStats, isLoading: projectStatsLoading } = useProjectStats()
    const { data: teamStats, isLoading: teamStatsLoading } = useTeamStats()

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Update stats when data is loaded
    useEffect(() => {
        if (projectStats || teamStats || featuredProjects || leadershipTeam) {
            setStats({
                projects: projectStats?.total || featuredProjects?.length * 83 || 250, // Extrapolate from featured
                clients: projectStats?.clientRetention || 95,
                teamMembers: teamStats?.total || leadershipTeam?.length * 5 || 50, // Extrapolate from leadership
                support: 24
            })
        } else {
            // Fallback to default values while loading
            setStats({
                projects: 250,
                clients: 95,
                teamMembers: 50,
                support: 24
            })
        }
    }, [projectStats, teamStats, featuredProjects, leadershipTeam])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Static services for now - you can create a services API later
    const services = [
        {
            icon: <RocketLaunchOutlined sx={{ fontSize: 28 }} />,
            title: 'Strategy & Consulting',
            description: 'Transform your vision into actionable digital strategies',
            color: '#000'
        },
        {
            icon: <DesignServicesOutlined sx={{ fontSize: 28 }} />,
            title: 'Product Design',
            description: 'Crafting experiences that users love and remember',
            color: '#000'
        },
        {
            icon: <PhoneIphoneOutlined sx={{ fontSize: 28 }} />,
            title: 'Development',
            description: 'Building scalable solutions with modern technology',
            color: '#000'
        },
        {
            icon: <CloudOutlined sx={{ fontSize: 28 }} />,
            title: 'Cloud & DevOps',
            description: 'Optimize performance with cloud-native architecture',
            color: '#000'
        }
    ]

    const dynamicStats = stats ? [
        { value: stats.projects, suffix: '+', label: 'Projects Completed', icon: <WorkspacePremium /> },
        { value: stats.clients, suffix: '%', label: 'Client Retention', icon: <Groups /> },
        { value: stats.teamMembers, suffix: '+', label: 'Team Members', icon: <TrendingUp /> },
        { value: stats.support, suffix: '/7', label: 'Support', icon: <SupportAgent /> }
    ] : []

    const [ref, inView] = useInView({
        threshold: 0.3,
        triggerOnce: true
    })

    // Featured Project Card Component
    const FeaturedProjectCard = ({ project, index }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            className="cursor-pointer"
        >
            <Link to={`/projects/${project.slug || project.id}`} className="no-underline">
                <Box className="relative overflow-hidden group">
                    <img
                        src={project.featured_image || project.thumbnail || project.images?.[0] || `https://images.unsplash.com/photo-${index === 0 ? '1551288049-bebda4e38f71' : index === 1 ? '1556742049-0cfed4f6a45d' : '1576091160399-112ba8d25d1d'}?w=600&h=400&fit=crop`}
                        alt={project.title}
                        className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                            e.target.src = `https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop`
                        }}
                    />
                    <Box className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                        <Box>
                            <Typography variant="h5" className="text-white font-medium mb-1">
                                {project.title}
                            </Typography>
                            <Typography variant="body2" className="text-white/80">
                                {project.category_display || project.category?.replace('_', ' ') || 'Web Application'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Link>
        </motion.div>
    )


    const getProjectsArray = () => {
        if (projectsLoading) return [];

        // Debug: Log what we're getting from the API
        console.log('🔍 Featured Projects Raw Data:', featuredProjects);

        if (Array.isArray(featuredProjects)) {
            return featuredProjects;
        }

        // Handle different response structures from your backend
        if (featuredProjects?.projects && Array.isArray(featuredProjects.projects)) {
            return featuredProjects.projects;
        }

        if (featuredProjects?.data && Array.isArray(featuredProjects.data)) {
            return featuredProjects.data;
        }

        // If backend returns error or unexpected structure, use fallback
        console.warn('⚠️ Using fallback projects data. API returned:', featuredProjects);
        return [
            {
                id: 1,
                title: 'Financial Dashboard',
                category: 'web_application',
                slug: 'financial-dashboard'
            },
            {
                id: 2,
                title: 'E-Commerce Platform',
                category: 'e_commerce',
                slug: 'ecommerce-platform'
            },
            {
                id: 3,
                title: 'Healthcare App',
                category: 'mobile_application',
                slug: 'healthcare-app'
            }
        ];
    };

    return (
        <>
            <Helmet>
                <title>GS Infotech - Digital Innovation Studio</title>
                <meta name="description" content="We create digital experiences that matter. Strategy, Design, Development." />
            </Helmet>

            <Box className="bg-white">
                {/* Hero Section - Minimal & Clean */}
                <section className="min-h-screen flex items-center relative overflow-hidden bg-gray-50">
                    {/* Subtle geometric pattern */}
                    <div className="absolute inset-0 opacity-[0.02]">
                        <div className="absolute h-full w-full" style={{
                            backgroundImage: `repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 15px),
                               repeating-linear-gradient(-45deg, #000 0, #000 1px, transparent 1px, transparent 15px)`
                        }} />
                    </div>

                    {/* Minimal floating accent */}
                    <motion.div
                        style={{ y: y1 }}
                        className="absolute top-1/4 right-0 w-72 h-72 bg-black/5 rounded-full blur-3xl"
                    />

                    <Container maxWidth="lg" className="relative z-10">
                        <Grid container spacing={8} alignItems="center">
                            <Grid item xs={12} lg={7}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                >
                                    {/* Minimal pill */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="inline-block"
                                    >
                                        <Chip
                                            icon={<AutoAwesomeOutlined className="text-xs" />}
                                            label="Digital Innovation Studio"
                                            className="mb-8 bg-black text-white font-medium px-4 py-1"
                                            size="small"
                                        />
                                    </motion.div>

                                    <Typography
                                        variant="h1"
                                        className="text-6xl md:text-7xl lg:text-8xl font-light mb-6 leading-[0.9] tracking-tight"
                                    >
                                        We craft
                                        <br />
                                        <span className="font-semibold">digital</span>
                                        <br />
                                        experiences
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        className="text-gray-600 mb-10 font-light max-w-xl leading-relaxed"
                                    >
                                        Strategy-driven design and development for ambitious brands
                                        looking to make an impact.
                                    </Typography>

                                    <Stack direction="row" spacing={3} alignItems="center">
                                        <Link to="/contact" className="no-underline">
                                            <Button
                                                variant="contained"
                                                size="large"
                                                endIcon={<EastOutlined />}
                                                className="bg-black hover:bg-gray-900 text-white rounded-none px-8 py-4 text-base font-light tracking-wide normal-case shadow-none"
                                                sx={{
                                                    '&:hover': {
                                                        transform: 'translateX(4px)',
                                                    },
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                Start a Project
                                            </Button>
                                        </Link>

                                        <Link to="/projects" className="no-underline">
                                            <Button
                                                variant="text"
                                                size="large"
                                                className="text-black hover:text-gray-700 font-light tracking-wide normal-case"
                                            >
                                                View Work
                                            </Button>
                                        </Link>
                                    </Stack>

                                    {/* Dynamic social proof */}
                                    <Box className="mt-16 flex items-center gap-8">
                                        <Box>
                                            <Typography variant="h3" className="font-light">
                                                {stats?.projects && !projectStatsLoading ? (
                                                    <CountUp end={stats.projects} duration={2} />
                                                ) : (
                                                    <Skeleton width={60} />
                                                )}
                                                +
                                            </Typography>
                                            <Typography variant="body2" className="text-gray-500 uppercase tracking-wider text-xs">
                                                Projects Delivered
                                            </Typography>
                                        </Box>
                                        <Box className="h-12 w-px bg-gray-300" />
                                        <Box>
                                            <Typography variant="h3" className="font-light">
                                                {stats?.clients && !projectStatsLoading ? (
                                                    <CountUp end={stats.clients} duration={2} />
                                                ) : (
                                                    <Skeleton width={50} />
                                                )}
                                                %
                                            </Typography>
                                            <Typography variant="body2" className="text-gray-500 uppercase tracking-wider text-xs">
                                                Client Satisfaction
                                            </Typography>
                                        </Box>
                                    </Box>
                                </motion.div>
                            </Grid>

                            <Grid item xs={12} lg={5}>
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="relative"
                                >
                                    {/* Minimal image composition */}
                                    <Box className="relative">
                                        <Box className="absolute -inset-4 bg-gray-100 rounded-lg transform rotate-3" />
                                        <img
                                            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=700&fit=crop"
                                            alt="Team collaboration"
                                            className="relative rounded-lg w-full shadow-2xl"
                                        />

                                        {/* Floating accent card with dynamic data */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-xl"
                                        >
                                            <Typography variant="h4" className="font-semibold mb-1">
                                                10+ Years
                                            </Typography>
                                            <Typography variant="body2" className="text-gray-600">
                                                of Excellence
                                            </Typography>
                                        </motion.div>
                                    </Box>
                                </motion.div>
                            </Grid>
                        </Grid>
                    </Container>
                </section>

                {/* Services Section - Clean Grid */}
                <section className="py-24 bg-white">
                    <Container maxWidth="lg">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="mb-16"
                        >
                            <Typography variant="overline" className="text-gray-500 tracking-widest mb-4">
                                WHAT WE DO
                            </Typography>
                            <Typography variant="h2" className="text-5xl font-light mb-6">
                                Services & Expertise
                            </Typography>
                            <Typography variant="h6" className="text-gray-600 font-light max-w-2xl">
                                We combine strategy, creativity, and technology to deliver exceptional digital products.
                            </Typography>
                        </motion.div>

                        <Grid container spacing={0}>
                            {services.slice(0, 4).map((service, index) => (
                                <Grid item xs={12} md={6} key={index}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                    >
                                        <Box
                                            className="p-8 border-b border-r border-gray-200 hover:bg-gray-50 transition-all duration-300 group cursor-pointer"
                                            sx={{
                                                borderRight: index % 2 === 1 ? 'none' : '1px solid #e5e7eb',
                                                borderBottom: index >= 2 ? 'none' : '1px solid #e5e7eb',
                                                '@media (max-width: 900px)': {
                                                    borderRight: 'none',
                                                    borderBottom: index === 3 ? 'none' : '1px solid #e5e7eb'
                                                }
                                            }}
                                        >
                                            <Box className="mb-6 group-hover:transform group-hover:translate-x-2 transition-transform duration-300">
                                                {service.icon}
                                            </Box>

                                            <Typography variant="h5" className="font-medium mb-3">
                                                {service.title}
                                            </Typography>

                                            <Typography variant="body1" className="text-gray-600 mb-4 leading-relaxed">
                                                {service.description}
                                            </Typography>

                                            <Box className="flex items-center text-sm font-medium">
                                                Learn more
                                                <EastOutlined className="ml-2 text-base group-hover:translate-x-2 transition-transform duration-300" />
                                            </Box>
                                        </Box>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </section>

                {/* Stats Section - Dynamic */}
                <section className="py-24 bg-gray-50">
                    <Container maxWidth="lg">
                        <Grid container spacing={8} ref={ref}>
                            {dynamicStats.map((stat, index) => (
                                <Grid item xs={6} md={3} key={index}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={inView ? { opacity: 1, y: 0 } : {}}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                    >
                                        <Box className="text-center">
                                            <Typography variant="h2" className="font-light mb-2">
                                                {inView && stats && !projectStatsLoading && !teamStatsLoading && (
                                                    <CountUp
                                                        start={0}
                                                        end={stat.value}
                                                        duration={2}
                                                        separator=","
                                                        suffix={stat.suffix}
                                                    />
                                                )}
                                                {(projectStatsLoading || teamStatsLoading || !stats) && (
                                                    <Skeleton width={80} height={60} className="mx-auto" />
                                                )}
                                            </Typography>
                                            <Typography variant="body2" className="text-gray-600 uppercase tracking-wider text-xs">
                                                {stat.label}
                                            </Typography>
                                        </Box>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </section>

                {/* Featured Work - Dynamic Gallery */}
                <section className="py-24 bg-white">
                    <Container maxWidth="lg">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="mb-16"
                        >
                            <Typography variant="overline" className="text-gray-500 tracking-widest mb-4">
                                FEATURED WORK
                            </Typography>
                            <Typography variant="h2" className="text-5xl font-light mb-6">
                                Recent Projects
                            </Typography>
                        </motion.div>

                        {projectsLoading ? (
                            <Grid container spacing={4}>
                                {[...Array(3)].map((_, index) => (
                                    <Grid item xs={12} md={4} key={index}>
                                        <Skeleton variant="rectangular" height={320} className="rounded-lg" />
                                        <Box className="pt-4">
                                            <Skeleton variant="text" width="70%" />
                                            <Skeleton variant="text" width="50%" />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Grid container spacing={4}>
                                    {getProjectsArray().slice(0, 3).map((project, index) => (
                                    <Grid item xs={12} md={4} key={project.id}>
                                        <FeaturedProjectCard project={project} index={index} />
                                    </Grid>
                                ))}
                            </Grid>
                        )}

                        <Box className="text-center mt-12">
                            <Link to="/projects" className="no-underline">
                                <Button
                                    variant="outlined"
                                    size="large"
                                    endIcon={<EastOutlined />}
                                    className="border-black text-black hover:bg-black hover:text-white rounded-none px-8 py-3 font-light tracking-wide normal-case"
                                >
                                    View All Projects
                                </Button>
                            </Link>
                        </Box>
                    </Container>
                </section>

                {/* CTA Section - Bold & Minimal */}
                <section className="py-32 bg-black text-white relative overflow-hidden">
                    <Container maxWidth="md" className="relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <Typography variant="h2" className="text-5xl md:text-6xl font-light mb-8 leading-tight">
                                Ready to start your
                                <br />
                                <span className="font-semibold">next project?</span>
                            </Typography>

                            <Typography variant="h6" className="text-gray-400 mb-12 font-light max-w-2xl mx-auto">
                                Let's collaborate to create something extraordinary together.
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
                                <Link to="/contact" className="no-underline">
                                    <Button
                                        variant="contained"
                                        size="large"
                                        endIcon={<EastOutlined />}
                                        className="bg-white text-black hover:bg-gray-100 rounded-none px-10 py-4 text-base font-light tracking-wide normal-case"
                                    >
                                        Get in Touch
                                    </Button>
                                </Link>
                                <Link to="/about" className="no-underline">
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        className="border-white text-white hover:bg-white hover:text-black rounded-none px-10 py-4 text-base font-light tracking-wide normal-case"
                                    >
                                        Learn About Us
                                    </Button>
                                </Link>
                            </Stack>
                        </motion.div>
                    </Container>

                    {/* Subtle decoration */}
                    <Box className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </section>

                {/* Scroll to Top - Minimal */}
                <AnimatePresence>
                    {showScrollTop && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed bottom-8 right-8 z-50"
                        >
                            <IconButton
                                onClick={scrollToTop}
                                className="bg-black text-white hover:bg-gray-900 shadow-lg"
                                sx={{
                                    width: 48,
                                    height: 48,
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <KeyboardArrowUp />
                            </IconButton>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>
        </>
    )
}

export default Home