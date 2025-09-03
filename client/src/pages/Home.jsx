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
    Stack,
    Skeleton
} from '@mui/material'
import {
    ArrowOutward,
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
    KeyboardArrowUp,
    PlayArrow,
    CheckCircleOutline,
    StarRounded
} from '@mui/icons-material'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'

// API hooks
import {
    useFeaturedProjects,
    useLeadershipTeam,
    useProjectStats,
    useTeamStats,
} from '@/hooks/useApi'

const Home = () => {
    const { scrollY } = useScroll()
    const y1 = useTransform(scrollY, [0, 300], [0, 50])
    const y2 = useTransform(scrollY, [0, 300], [0, -30])
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [stats, setStats] = useState(null)

    // Fetch data using API hooks
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
                projects: projectStats?.total || featuredProjects?.length * 83 || 250,
                clients: projectStats?.clientRetention || 95,
                teamMembers: teamStats?.total || leadershipTeam?.length * 5 || 50,
                support: 24
            })
        } else {
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

    // Services with new color palette
    const services = [
        {
            icon: <RocketLaunchOutlined sx={{ fontSize: 32 }} />,
            title: 'Strategy & Consulting',
            description: 'Transform your vision into actionable digital strategies that drive real business growth.',
            color: 'var(--sage-400)',
            bgColor: 'var(--sage-50)'
        },
        {
            icon: <DesignServicesOutlined sx={{ fontSize: 32 }} />,
            title: 'Product Design',
            description: 'Crafting beautiful, intuitive experiences that users love and remember.',
            color: 'var(--coral-400)',
            bgColor: 'var(--coral-50)'
        },
        {
            icon: <PhoneIphoneOutlined sx={{ fontSize: 32 }} />,
            title: 'Development',
            description: 'Building scalable, high-performance solutions with modern technology.',
            color: 'var(--sand-600)',
            bgColor: 'var(--sand-50)'
        },
        {
            icon: <CloudOutlined sx={{ fontSize: 32 }} />,
            title: 'Cloud & DevOps',
            description: 'Optimize performance and scalability with cloud-native architecture.',
            color: 'var(--sage-600)',
            bgColor: 'var(--sage-50)'
        }
    ]

    const dynamicStats = stats ? [
        { value: stats.projects, suffix: '+', label: 'Projects Completed', icon: <WorkspacePremium />, color: 'var(--sage-400)' },
        { value: stats.clients, suffix: '%', label: 'Client Satisfaction', icon: <Groups />, color: 'var(--coral-400)' },
        { value: stats.teamMembers, suffix: '+', label: 'Team Members', icon: <TrendingUp />, color: 'var(--sand-400)' },
        { value: stats.support, suffix: '/7', label: 'Support Available', icon: <SupportAgent />, color: 'var(--sage-600)' }
    ] : []

    const [ref, inView] = useInView({
        threshold: 0.3,
        triggerOnce: true
    })

    // Featured Project Card Component
    const FeaturedProjectCard = ({ project, index }) => (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            viewport={{ once: true }}
            whileHover={{ y: -12 }}
            className="cursor-pointer group"
        >
            <Link to={`/projects/${project.slug || project.id}`} className="no-underline">
                <Box
                    sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: '24px',
                        backgroundColor: 'white',
                        boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.4s ease',
                        '&:hover': {
                            boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.15)',
                        }
                    }}
                >
                    <Box sx={{ position: 'relative', height: 280, overflow: 'hidden' }}>
                        <img
                            src={project.featured_image || project.thumbnail || project.images?.[0] || `https://images.unsplash.com/photo-${index === 0 ? '1551288049-bebda4e38f71' : index === 1 ? '1556742049-0cfed4f6a45d' : '1576091160399-112ba8d25d1d'}?w=600&h=400&fit=crop`}
                            alt={project.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.6s ease',
                            }}
                            onError={(e) => {
                                e.target.src = `https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop`
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(135deg, rgba(157, 176, 130, 0.8) 0%, rgba(247, 161, 136, 0.8) 100%)',
                                opacity: 0,
                                transition: 'opacity 0.4s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '.group:hover &': {
                                    opacity: 1,
                                }
                            }}
                        >
                            <IconButton
                                sx={{
                                    backgroundColor: 'white',
                                    color: 'var(--sage-600)',
                                    width: 56,
                                    height: 56,
                                    '&:hover': {
                                        backgroundColor: 'white',
                                        transform: 'scale(1.1)',
                                    }
                                }}
                            >
                                <ArrowOutward />
                            </IconButton>
                        </Box>
                    </Box>

                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'var(--stone-800)' }}>
                            {project.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--stone-600)', mb: 2 }}>
                            {project.category_display || project.category?.replace('_', ' ') || 'Web Application'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'var(--sage-600)' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, mr: 1 }}>
                                View Project
                            </Typography>
                            <EastOutlined sx={{ fontSize: 16 }} />
                        </Box>
                    </Box>
                </Box>
            </Link>
        </motion.div>
    )

    const getProjectsArray = () => {
        if (projectsLoading) return [];
        if (Array.isArray(featuredProjects)) return featuredProjects;
        if (featuredProjects?.projects && Array.isArray(featuredProjects.projects)) return featuredProjects.projects;
        if (featuredProjects?.data && Array.isArray(featuredProjects.data)) return featuredProjects.data;

        return [
            { id: 1, title: 'Financial Dashboard', category: 'web_application', slug: 'financial-dashboard' },
            { id: 2, title: 'E-Commerce Platform', category: 'e_commerce', slug: 'ecommerce-platform' },
            { id: 3, title: 'Healthcare App', category: 'mobile_application', slug: 'healthcare-app' }
        ];
    };

    return (
        <>
            <Helmet>
                <title>GS Infotech - Digital Innovation Studio</title>
                <meta name="description" content="We create digital experiences that matter. Strategy, Design, Development." />
            </Helmet>

            <Box sx={{ backgroundColor: 'white' }}>
                {/* Hero Section - Center Aligned */}
                <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                    {/* Background Elements */}
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(135deg, var(--sand-50) 0%, var(--sage-50) 50%, var(--coral-50) 100%)',
                            opacity: 0.7,
                        }}
                    />

                    {/* Floating Elements */}
                    <motion.div
                        style={{ y: y1 }}
                        className="absolute top-1/4 right-0 w-96 h-96 rounded-full opacity-20"
                        sx={{
                            background: 'radial-gradient(circle, var(--sage-400) 0%, transparent 70%)',
                            filter: 'blur(40px)',
                        }}
                    />
                    <motion.div
                        style={{ y: y2 }}
                        className="absolute bottom-1/4 left-0 w-72 h-72 rounded-full opacity-20"
                        sx={{
                            background: 'radial-gradient(circle, var(--coral-400) 0%, transparent 70%)',
                            filter: 'blur(40px)',
                        }}
                    />

                    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        >
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}
                            >
                                <Chip
                                    icon={<AutoAwesomeOutlined sx={{ fontSize: 16, color: 'white' }} />}
                                    label="Digital Innovation Studio"
                                    sx={{
                                        backgroundColor: 'var(--sage-400)',
                                        color: 'white',
                                        fontWeight: 500,
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: '50px',
                                        fontSize: '0.875rem',
                                        letterSpacing: '0.025em',
                                    }}
                                />
                            </motion.div>

                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5.5rem' },
                                    fontWeight: 300,
                                    lineHeight: 0.9,
                                    letterSpacing: '-0.02em',
                                    mb: 4,
                                    color: 'var(--stone-800)',
                                }}
                            >
                                Crafting digital
                                <br />
                                experiences that
                                <br />
                                <span style={{ fontWeight: 600, color: 'var(--sage-600)' }}>inspire</span>
                            </Typography>

                            <Typography
                                variant="h5"
                                sx={{
                                    color: 'var(--stone-600)',
                                    fontWeight: 300,
                                    lineHeight: 1.6,
                                    mb: 6,
                                    maxWidth: '700px',
                                    mx: 'auto',
                                    fontSize: { xs: '1.1rem', md: '1.25rem' }
                                }}
                            >
                                We partner with ambitious brands to create exceptional digital products
                                through strategy, design, and cutting-edge development.
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" sx={{ mb: 8 }}>
                                <Link to="/contact" className="no-underline">
                                    <Button
                                        variant="contained"
                                        size="large"
                                        endIcon={<ArrowOutward />}
                                        sx={{
                                            backgroundColor: 'var(--sage-400)',
                                            color: 'white',
                                            borderRadius: '50px',
                                            px: 5,
                                            py: 2,
                                            fontSize: '1rem',
                                            fontWeight: 500,
                                            letterSpacing: '0.025em',
                                            textTransform: 'none',
                                            boxShadow: '0 8px 25px -8px rgba(157, 176, 130, 0.4)',
                                            transition: 'all 0.4s ease',
                                            '&:hover': {
                                                backgroundColor: 'var(--sage-500)',
                                                transform: 'translateY(-3px)',
                                                boxShadow: '0 12px 35px -8px rgba(157, 176, 130, 0.5)'
                                            }
                                        }}
                                    >
                                        Start Your Project
                                    </Button>
                                </Link>

                                <Link to="/projects" className="no-underline">
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        startIcon={<PlayArrow />}
                                        sx={{
                                            borderColor: 'var(--stone-300)',
                                            color: 'var(--stone-700)',
                                            borderRadius: '50px',
                                            px: 5,
                                            py: 2,
                                            fontSize: '1rem',
                                            fontWeight: 500,
                                            letterSpacing: '0.025em',
                                            textTransform: 'none',
                                            transition: 'all 0.4s ease',
                                            '&:hover': {
                                                borderColor: 'var(--sage-400)',
                                                backgroundColor: 'var(--sage-50)',
                                                color: 'var(--sage-600)',
                                                transform: 'translateY(-2px)',
                                            }
                                        }}
                                    >
                                        View Our Work
                                    </Button>
                                </Link>
                            </Stack>

                            {/* Social Proof - Centered
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h3" sx={{ fontWeight: 300, color: 'var(--stone-800)', mb: 0.5 }}>
                                        {stats?.projects && !projectStatsLoading ? (
                                            <CountUp end={stats.projects} duration={2.5} />
                                        ) : (
                                            <Skeleton width={60} />
                                        )}
                                        +
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'var(--stone-500)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>
                                        Projects Delivered
                                    </Typography>
                                </Box>
                                <Box sx={{ height: 48, width: 1, backgroundColor: 'var(--stone-200)' }} />
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h3" sx={{ fontWeight: 300, color: 'var(--stone-800)', mb: 0.5 }}>
                                        {stats?.clients && !projectStatsLoading ? (
                                            <CountUp end={stats.clients} duration={2.5} />
                                        ) : (
                                            <Skeleton width={50} />
                                        )}
                                        %
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'var(--stone-500)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>
                                        Client Satisfaction
                                    </Typography>
                                </Box>
                                <Box sx={{ height: 48, width: 1, backgroundColor: 'var(--stone-200)' }} />
                                <Box sx={{ textAlign: 'center' }}>
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
                                        <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
                                            <Avatar sx={{ backgroundColor: 'var(--sage-400)' }}>A</Avatar>
                                            <Avatar sx={{ backgroundColor: 'var(--coral-400)' }}>B</Avatar>
                                            <Avatar sx={{ backgroundColor: 'var(--sand-400)' }}>C</Avatar>
                                        </AvatarGroup>
                                        <Typography variant="body2" sx={{ color: 'var(--stone-600)', fontWeight: 500 }}>
                                            Trusted by 50+ clients
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Box> */}

                            {/* Hero Image - Centered */}
                            <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                >
                                    <Box sx={{ position: 'relative', maxWidth: '600px' }}>
                                        {/* Main Hero Image */}
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                borderRadius: '32px',
                                                overflow: 'hidden',
                                                boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.2)',
                                                transform: 'rotate(2deg)',
                                            }}
                                        >
                                            <img
                                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop&auto=format"
                                                alt="Creative team collaboration"
                                                style={{
                                                    width: '100%',
                                                    height: '400px',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    background: 'linear-gradient(135deg, rgba(157, 176, 130, 0.1) 0%, rgba(247, 161, 136, 0.1) 100%)',
                                                }}
                                            />
                                        </Box>

                                        {/* Floating Stats Card */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.8 }}
                                            style={{
                                                position: 'absolute',
                                                bottom: -20,
                                                left: -20,
                                                backgroundColor: 'white',
                                                padding: '1.5rem',
                                                borderRadius: '20px',
                                                boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.15)',
                                                border: '1px solid var(--stone-100)',
                                            }}
                                        >
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Box
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        backgroundColor: 'var(--sage-50)',
                                                        borderRadius: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <StarRounded sx={{ color: 'var(--sage-400)', fontSize: 24 }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'var(--stone-800)', mb: 0.5 }}>
                                                        10+ Years
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: 'var(--stone-600)' }}>
                                                        of Excellence
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </motion.div>

                                        {/* Floating Badge */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 1, type: "spring" }}
                                            style={{
                                                position: 'absolute',
                                                top: -10,
                                                right: -10,
                                                backgroundColor: 'var(--coral-400)',
                                                color: 'white',
                                                padding: '0.75rem 1.5rem',
                                                borderRadius: '50px',
                                                fontSize: '0.875rem',
                                                fontWeight: 500,
                                                boxShadow: '0 8px 25px -8px rgba(247, 161, 136, 0.4)',
                                            }}
                                        >
                                            ✨ Award Winning
                                        </motion.div>
                                    </Box>
                                </motion.div>
                            </Box>
                        </motion.div>
                    </Container>
                </section>

                {/* Services Section - Center Aligned */}
                <section style={{ padding: '6rem 0', backgroundColor: 'white' }}>
                    <Container maxWidth="lg">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            style={{ marginBottom: '4rem', textAlign: 'center' }}
                        >
                            <Typography
                                variant="overline"
                                sx={{
                                    color: 'var(--stone-500)',
                                    letterSpacing: '0.15em',
                                    mb: 2,
                                    display: 'block',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                }}
                            >
                                WHAT WE DO
                            </Typography>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    fontWeight: 300,
                                    mb: 3,
                                    color: 'var(--stone-800)',
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                Our Expertise
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'var(--stone-600)',
                                    fontWeight: 300,
                                    maxWidth: '600px',
                                    mx: 'auto',
                                    lineHeight: 1.6,
                                }}
                            >
                                We combine strategic thinking, creative design, and technical excellence
                                to deliver digital solutions that drive results.
                            </Typography>
                        </motion.div>

                        {/* Using Flexbox instead of Grid for guaranteed 2 columns */}
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 4,
                                justifyContent: 'center'
                            }}
                        >
                            {services.map((service, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        width: { xs: '100%', md: 'calc(50% - 16px)' },
                                        maxWidth: '500px'
                                    }}
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        whileHover={{ y: -8 }}
                                    >
                                        <Card
                                            sx={{
                                                p: 4,
                                                height: '100%',
                                                border: '1px solid var(--stone-100)',
                                                borderRadius: '24px',
                                                backgroundColor: 'white',
                                                transition: 'all 0.4s ease',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                '&:hover': {
                                                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)',
                                                    borderColor: service.color,
                                                }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 64,
                                                    height: 64,
                                                    backgroundColor: service.bgColor,
                                                    borderRadius: '16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mb: 3,
                                                    mx: 'auto',
                                                    color: service.color,
                                                }}
                                            >
                                                {service.icon}
                                            </Box>

                                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'var(--stone-800)' }}>
                                                {service.title}
                                            </Typography>

                                            <Typography variant="body1" sx={{ color: 'var(--stone-600)', mb: 3, lineHeight: 1.6 }}>
                                                {service.description}
                                            </Typography>

                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: service.color }}>
                                                <Typography variant="body2" sx={{ fontWeight: 500, mr: 1 }}>
                                                    Learn more
                                                </Typography>
                                                <EastOutlined sx={{ fontSize: 16 }} />
                                            </Box>
                                        </Card>
                                    </motion.div>
                                </Box>
                            ))}
                        </Box>
                    </Container>
                </section>

                {/* Stats Section - Center Aligned */}
                <section style={{ padding: '6rem 0', background: 'linear-gradient(135deg, var(--sage-50) 0%, var(--sand-50) 100%)' }}>
                    <Container maxWidth="lg">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            style={{ marginBottom: '4rem', textAlign: 'center' }}
                        >
                            <Typography
                                variant="h2"
                                sx={{
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    fontWeight: 300,
                                    mb: 3,
                                    color: 'var(--stone-800)',
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                Trusted by Industry Leaders
                            </Typography>
                        </motion.div>

                        <Grid container spacing={6} ref={ref} justifyContent="center">
                            {dynamicStats.map((stat, index) => (
                                <Grid item xs={6} md={3} key={index}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={inView ? { opacity: 1, y: 0 } : {}}
                                        transition={{ duration: 0.8, delay: index * 0.2 }}
                                    >
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Box
                                                sx={{
                                                    width: 64,
                                                    height: 64,
                                                    backgroundColor: 'white',
                                                    borderRadius: '16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mx: 'auto',
                                                    mb: 3,
                                                    color: stat.color,
                                                    boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.1)',
                                                }}
                                            >
                                                {stat.icon}
                                            </Box>
                                            <Typography variant="h2" sx={{ fontWeight: 300, mb: 1, color: 'var(--stone-800)' }}>
                                                {inView && stats && !projectStatsLoading && !teamStatsLoading && (
                                                    <CountUp
                                                        start={0}
                                                        end={stat.value}
                                                        duration={2.5}
                                                        separator=","
                                                        suffix={stat.suffix}
                                                    />
                                                )}
                                                {(projectStatsLoading || teamStatsLoading || !stats) && (
                                                    <Skeleton width={80} height={60} sx={{ mx: 'auto' }} />
                                                )}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'var(--stone-600)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', fontWeight: 500 }}>
                                                {stat.label}
                                            </Typography>
                                        </Box>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </section>

                {/* Featured Work - Center Aligned */}
                <section style={{ padding: '6rem 0', backgroundColor: 'white' }}>
                    <Container maxWidth="lg">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            style={{ marginBottom: '4rem', textAlign: 'center' }}
                        >
                            <Typography
                                variant="overline"
                                sx={{
                                    color: 'var(--stone-500)',
                                    letterSpacing: '0.15em',
                                    mb: 2,
                                    display: 'block',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                }}
                            >
                                FEATURED WORK
                            </Typography>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    fontWeight: 300,
                                    mb: 3,
                                    color: 'var(--stone-800)',
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                Recent Projects
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'var(--stone-600)',
                                    fontWeight: 300,
                                    lineHeight: 1.6,
                                    maxWidth: '600px',
                                    mx: 'auto',
                                    mb: 4
                                }}
                            >
                                Explore our latest work and see how we've helped brands achieve their digital goals.
                            </Typography>
                            <Link to="/projects" className="no-underline">
                                <Button
                                    variant="outlined"
                                    endIcon={<ArrowOutward />}
                                    sx={{
                                        borderColor: 'var(--sage-400)',
                                        color: 'var(--sage-600)',
                                        borderRadius: '50px',
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        letterSpacing: '0.025em',
                                        textTransform: 'none',
                                        transition: 'all 0.4s ease',
                                        '&:hover': {
                                            backgroundColor: 'var(--sage-400)',
                                            color: 'white',
                                            transform: 'translateY(-2px)',
                                        }
                                    }}
                                >
                                    View All Projects
                                </Button>
                            </Link>
                        </motion.div>

                        {projectsLoading ? (
                            <Grid container spacing={4} justifyContent="center">
                                {[...Array(3)].map((_, index) => (
                                    <Grid item xs={12} md={4} key={index}>
                                        <Skeleton variant="rectangular" height={320} sx={{ borderRadius: '24px' }} />
                                        <Box sx={{ pt: 3, textAlign: 'center' }}>
                                            <Skeleton variant="text" width="70%" sx={{ mx: 'auto' }} />
                                            <Skeleton variant="text" width="50%" sx={{ mx: 'auto' }} />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Grid container spacing={4} justifyContent="center">
                                {getProjectsArray().slice(0, 3).map((project, index) => (
                                    <Grid item xs={12} md={4} key={project.id}>
                                        <FeaturedProjectCard project={project} index={index} />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Container>
                </section>

                {/* CTA Section - Center Aligned */}
                <section
                    style={{
                        padding: '8rem 0',
                        background: 'linear-gradient(135deg, var(--stone-800) 0%, var(--stone-900) 100%)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Background Pattern */}
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
                                Ready to bring your
                                <br />
                                <span style={{ fontWeight: 600, background: 'linear-gradient(135deg, var(--sage-400) 0%, var(--coral-400) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    vision to life?
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

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" sx={{ mb: 6 }}>
                                <Link to="/contact" className="no-underline">
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
                                </Link>
                                <Link to="/about" className="no-underline">
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
                                </Link>
                            </Stack>

                            {/* Trust Indicators - Centered */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircleOutline sx={{ color: 'var(--sage-400)', fontSize: 20 }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        24/7 Support
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircleOutline sx={{ color: 'var(--sage-400)', fontSize: 20 }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        Money-back Guarantee
                                    </Typography>
                                </Box>
                            </Box>
                        </motion.div>
                    </Container>
                </section>

               
            </Box>
        </>
    )
}

export default Home
