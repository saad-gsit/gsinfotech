import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
    Container,
    Typography,
    Box,
    Grid,
    Stack,
    Button,
    Card,
    Avatar,
    Chip,
    Skeleton
} from '@mui/material'
import {
    RocketLaunchOutlined,
    SpeedOutlined,
    AutoAwesomeOutlined,
    TrendingUpOutlined,
    GroupsOutlined,
    EmojiObjectsOutlined,
    ArrowOutward,
    CheckCircleOutline,
    StarRounded,
    WorkspacePremiumOutlined
} from '@mui/icons-material'
import { Link } from 'react-router-dom'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'
import { useTeam } from '@hooks/useApi'

const About = () => {
    const [ref, inView] = useInView({
        threshold: 0.3,
        triggerOnce: true
    })

    const stats = [
        {
            number: 10,
            suffix: '+',
            label: 'Years Experience',
            color: 'var(--sage-400)',
            bgColor: 'var(--sage-50)'
        },
        {
            number: 250,
            suffix: '+',
            label: 'Projects Delivered',
            color: 'var(--coral-400)',
            bgColor: 'var(--coral-50)'
        },
        {
            number: 50,
            suffix: '+',
            label: 'Team Members',
            color: 'var(--sand-600)',
            bgColor: 'var(--sand-50)'
        },
        {
            number: 95,
            suffix: '%',
            label: 'Client Satisfaction',
            color: 'var(--sage-600)',
            bgColor: 'var(--sage-50)'
        }
    ]

    const values = [
        {
            icon: <RocketLaunchOutlined sx={{ fontSize: 36 }} />,
            title: 'Innovation First',
            description: 'We embrace cutting-edge technologies and creative solutions to build products that define the future of digital experiences.',
            color: 'var(--sage-400)',
            bgColor: 'var(--sage-50)'
        },
        {
            icon: <SpeedOutlined sx={{ fontSize: 36 }} />,
            title: 'Performance Focused',
            description: 'Every line of code is optimized for speed, scalability, and reliability to ensure exceptional user experiences.',
            color: 'var(--coral-400)',
            bgColor: 'var(--coral-50)'
        },
        {
            icon: <AutoAwesomeOutlined sx={{ fontSize: 36 }} />,
            title: 'Design Excellence',
            description: 'We craft experiences that are not just functional but truly delightful, combining aesthetics with usability.',
            color: 'var(--sand-600)',
            bgColor: 'var(--sand-50)'
        }
    ]

    const process = [
        {
            step: '01',
            title: 'Discovery',
            description: 'We start by understanding your vision, goals, and challenges through comprehensive research.',
            icon: <EmojiObjectsOutlined />
        },
        {
            step: '02',
            title: 'Strategy',
            description: 'We develop a detailed roadmap and technical architecture aligned with your objectives.',
            icon: <TrendingUpOutlined />
        },
        {
            step: '03',
            title: 'Execute',
            description: 'We bring ideas to life with precision, care, and attention to every detail.',
            icon: <RocketLaunchOutlined />
        },
        {
            step: '04',
            title: 'Evolve',
            description: 'We continuously improve and optimize based on real user feedback and analytics.',
            icon: <WorkspacePremiumOutlined />
        }
    ]

    const achievements = [
        { label: 'Award-winning Design', icon: '🏆' },
        { label: 'ISO Certified', icon: '📜' },
        { label: 'Global Recognition', icon: '🌍' },
        { label: '24/7 Support', icon: '🚀' }
    ]

    const TeamPreviewSection = () => {
        const { data: teamData, isLoading: teamLoading } = useTeam()

        const leadershipMembers = teamData?.members?.filter(m => m.is_leadership)?.slice(0, 3) || []

        if (teamLoading) {
            return (
                <Grid container spacing={4} justifyContent="center">
                    {[...Array(3)].map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card sx={{ p: 3, textAlign: 'center', borderRadius: '24px' }}>
                                <Skeleton variant="circular" width={100} height={100} sx={{ mx: 'auto', mb: 2 }} />
                                <Skeleton variant="text" width="70%" sx={{ mx: 'auto', mb: 1 }} />
                                <Skeleton variant="text" width="50%" sx={{ mx: 'auto', mb: 2 }} />
                                <Skeleton variant="text" width="80%" sx={{ mx: 'auto' }} />
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )
        }

        if (leadershipMembers.length === 0) {
            // Fallback to static data if no leadership members
            const fallbackMembers = [
                {
                    id: 1,
                    name: "Alex Johnson",
                    role: "CEO & Founder",
                    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
                    bio: "Visionary leader with 15+ years in digital innovation."
                },
                {
                    id: 2,
                    name: "Sarah Chen",
                    role: "CTO",
                    photo: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=300&h=300&fit=crop&crop=face",
                    bio: "Tech expert specializing in scalable architecture."
                },
                {
                    id: 3,
                    name: "Michael Brown",
                    role: "Creative Director",
                    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
                    bio: "Award-winning designer with a passion for user experience."
                }
            ]

            return (
                <Grid container spacing={4} justifyContent="center">
                    {fallbackMembers.map((member, index) => (
                        <Grid item xs={12} sm={6} md={4} key={member.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -8 }}
                            >
                                <Card
                                    sx={{
                                        p: 3,
                                        textAlign: 'center',
                                        border: '1px solid var(--stone-100)',
                                        borderRadius: '24px',
                                        backgroundColor: 'white',
                                        boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.1)',
                                        transition: 'all 0.4s ease',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
                                        }
                                    }}
                                >
                                    <Avatar
                                        src={member.photo}
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            mx: 'auto',
                                            mb: 3,
                                            border: '4px solid var(--sage-100)',
                                        }}
                                    />
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'var(--stone-800)' }}>
                                        {member.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'var(--sage-600)', mb: 2, fontWeight: 500 }}>
                                        {member.role}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'var(--stone-600)', lineHeight: 1.5 }}>
                                        {member.bio}
                                    </Typography>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            )
        }

        // Use real API data
        return (
            <Grid container spacing={4} justifyContent="center">
                {leadershipMembers.map((member, index) => (
                    <Grid item xs={12} sm={6} md={4} key={member.id}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8 }}
                        >
                            <Link to={`/team/${member.slug || member.id}`} className="no-underline">
                                <Card
                                    sx={{
                                        p: 3,
                                        textAlign: 'center',
                                        border: '1px solid var(--stone-100)',
                                        borderRadius: '24px',
                                        backgroundColor: 'white',
                                        boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.1)',
                                        transition: 'all 0.4s ease',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
                                            borderColor: 'var(--sage-400)',
                                        }
                                    }}
                                >
                                    <Avatar
                                        src={member.photo || member.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=200&background=9db082&color=fff`}
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            mx: 'auto',
                                            mb: 3,
                                            border: '4px solid var(--sage-100)',
                                        }}
                                    />
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'var(--stone-800)' }}>
                                        {member.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'var(--sage-600)', mb: 2, fontWeight: 500 }}>
                                        {member.position || member.role}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'var(--stone-600)', lineHeight: 1.5 }}>
                                        {member.bio ? member.bio.substring(0, 80) + (member.bio.length > 80 ? '...' : '') : 'Leadership team member focused on driving innovation and excellence.'}
                                    </Typography>
                                </Card>
                            </Link>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>
        )
    }

    return (
        <>
            <Helmet>
                <title>About - GS Infotech | Digital Innovation Studio</title>
                <meta name="description" content="We are a digital innovation studio that combines strategy, design, and technology to create products that matter." />
            </Helmet>

            {/* Hero Section - Enhanced */}
            <section
                style={{
                    minHeight: '80vh',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Background Gradient */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, var(--sand-50) 0%, var(--sage-50) 50%, var(--coral-50) 100%)',
                        opacity: 0.8,
                    }}
                />

                {/* Floating Elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '20%',
                        right: '10%',
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, var(--sage-400) 0%, transparent 70%)',
                        opacity: 0.1,
                        filter: 'blur(40px)',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: '20%',
                        left: '10%',
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, var(--coral-400) 0%, transparent 70%)',
                        opacity: 0.1,
                        filter: 'blur(40px)',
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
                    <Grid container spacing={8} alignItems="center">
                        <Grid item xs={12} lg={7}>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1 }}
                            >
                                <Chip
                                    label="ABOUT US"
                                    sx={{
                                        backgroundColor: 'var(--sage-400)',
                                        color: 'white',
                                        fontWeight: 500,
                                        mb: 3,
                                        px: 2,
                                        borderRadius: '50px',
                                        fontSize: '0.75rem',
                                        letterSpacing: '0.1em',
                                    }}
                                />
                                <Typography
                                    variant="h1"
                                    sx={{
                                        fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' },
                                        fontWeight: 300,
                                        lineHeight: 0.9,
                                        letterSpacing: '-0.02em',
                                        mb: 4,
                                        color: 'var(--stone-800)',
                                    }}
                                >
                                    We are a team of
                                    <br />
                                    <span style={{ fontWeight: 600, color: 'var(--sage-600)' }}>digital innovators</span>
                                </Typography>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        color: 'var(--stone-600)',
                                        fontWeight: 300,
                                        lineHeight: 1.6,
                                        maxWidth: '600px',
                                        mb: 6,
                                        fontSize: { xs: '1.1rem', md: '1.25rem' }
                                    }}
                                >
                                    Combining strategy, design, and technology to create digital products
                                    that make a meaningful impact on businesses and their users worldwide.
                                </Typography>

                                {/* Achievement Badges */}
                                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                    {achievements.map((achievement, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                        >
                                            <Chip
                                                icon={<span style={{ fontSize: '1rem' }}>{achievement.icon}</span>}
                                                label={achievement.label}
                                                sx={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid var(--stone-200)',
                                                    color: 'var(--stone-700)',
                                                    fontWeight: 500,
                                                    px: 1,
                                                    borderRadius: '50px',
                                                    fontSize: '0.875rem',
                                                }}
                                            />
                                        </motion.div>
                                    ))}
                                </Stack>
                            </motion.div>
                        </Grid>

                        <Grid item xs={12} lg={5}>
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1, delay: 0.3 }}
                            >
                                <Box sx={{ position: 'relative' }}>
                                    {/* Main Image */}
                                    <Box
                                        sx={{
                                            borderRadius: '32px',
                                            overflow: 'hidden',
                                            boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.2)',
                                            transform: 'rotate(-2deg)',
                                        }}
                                    >
                                        <img
                                            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=600&fit=crop&auto=format"
                                            alt="Our team working together"
                                            style={{
                                                width: '100%',
                                                height: '500px',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </Box>

                                    {/* Floating Card */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8 }}
                                        style={{
                                            position: 'absolute',
                                            bottom: -20,
                                            right: -20,
                                            backgroundColor: 'white',
                                            padding: '1.5rem',
                                            borderRadius: '20px',
                                            boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.15)',
                                            border: '1px solid var(--stone-100)',
                                        }}
                                    >
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--stone-800)', mb: 1 }}>
                                            50+ Team Members
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'var(--stone-600)' }}>
                                            Across 3 Countries
                                        </Typography>
                                    </motion.div>
                                </Box>
                            </motion.div>
                        </Grid>
                    </Grid>
                </Container>
            </section>

            {/* Stats Section - Beautiful Cards */}
            <section style={{ padding: '6rem 0', backgroundColor: 'white' }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4} ref={ref}>
                        {stats.map((stat, index) => (
                            <Grid item xs={6} md={3} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={inView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                    whileHover={{ y: -8 }}
                                >
                                    <Card
                                        sx={{
                                            p: 4,
                                            textAlign: 'center',
                                            border: '1px solid var(--stone-100)',
                                            borderRadius: '24px',
                                            backgroundColor: 'white',
                                            boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.1)',
                                            transition: 'all 0.4s ease',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
                                                borderColor: stat.color,
                                            }
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                backgroundColor: stat.bgColor,
                                                borderRadius: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mx: 'auto',
                                                mb: 3,
                                            }}
                                        >
                                            <Typography variant="h4" sx={{ color: stat.color, fontWeight: 300 }}>
                                                {inView && (
                                                    <CountUp
                                                        start={0}
                                                        end={stat.number}
                                                        duration={2.5}
                                                        suffix={stat.suffix}
                                                    />
                                                )}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{
                                            color: 'var(--stone-600)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            fontSize: '0.75rem',
                                            fontWeight: 500
                                        }}>
                                            {stat.label}
                                        </Typography>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </section>

            {/* Values Section - Enhanced Cards */}
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
                            Our Core Values
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
                            The principles that guide every decision we make and every product we create.
                        </Typography>
                    </motion.div>

                    <Grid container spacing={4}>
                        {values.map((value, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.2 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -12 }}
                                >
                                    <Card
                                        sx={{
                                            p: 4,
                                            height: '100%',
                                            border: '1px solid var(--stone-100)',
                                            borderRadius: '24px',
                                            backgroundColor: 'white',
                                            boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.1)',
                                            transition: 'all 0.4s ease',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
                                                borderColor: value.color,
                                            }
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 72,
                                                height: 72,
                                                backgroundColor: value.bgColor,
                                                borderRadius: '20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mb: 3,
                                                color: value.color,
                                            }}
                                        >
                                            {value.icon}
                                        </Box>
                                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'var(--stone-800)' }}>
                                            {value.title}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'var(--stone-600)', lineHeight: 1.6 }}>
                                            {value.description}
                                        </Typography>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </section>

            {/* Process Section - Modern Design */}
            <section
                style={{
                    padding: '6rem 0',
                    background: 'linear-gradient(135deg, var(--stone-800) 0%, var(--stone-900) 100%)',
                    position: 'relative',
                    overflow: 'hidden'
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

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
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
                                color: 'white',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Our Process
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontWeight: 300,
                                maxWidth: '600px',
                                mx: 'auto',
                                lineHeight: 1.6,
                            }}
                        >
                            A proven methodology to deliver exceptional results every time.
                        </Typography>
                    </motion.div>

                    <Grid container spacing={4}>
                        {process.map((item, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -8 }}
                                >
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            p: 3,
                                            borderRadius: '20px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            transition: 'all 0.4s ease',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                borderColor: 'var(--sage-400)',
                                            }
                                        }}
                                    >
                                        {/* Step Number */}
                                        <Typography
                                            variant="h1"
                                            sx={{
                                                fontSize: '4rem',
                                                fontWeight: 200,
                                                color: 'rgba(255, 255, 255, 0.2)',
                                                mb: 2,
                                                lineHeight: 1,
                                            }}
                                        >
                                            {item.step}
                                        </Typography>

                                        {/* Icon */}
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                backgroundColor: 'var(--sage-400)',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mb: 3,
                                                color: 'white',
                                            }}
                                        >
                                            {item.icon}
                                        </Box>

                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'white' }}>
                                            {item.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }}>
                                            {item.description}
                                        </Typography>
                                    </Box>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </section>

            {/* Team Preview Section - Using Real API Data */}
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
                            variant="h2"
                            sx={{
                                fontSize: { xs: '2.5rem', md: '3.5rem' },
                                fontWeight: 300,
                                mb: 3,
                                color: 'var(--stone-800)',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Meet Our Leadership
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
                            The visionaries and experts who guide our mission to create exceptional digital experiences.
                        </Typography>
                    </motion.div>

                    <TeamPreviewSection />

                    <Box sx={{ textAlign: 'center', mt: 6 }}>
                        <Link to="/team" className="no-underline">
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
                                Meet Our Full Team
                            </Button>
                        </Link>
                    </Box>
                </Container>
            </section>

            {/* CTA Section - Enhanced */}
            <section
                style={{
                    padding: '6rem 0',
                    background: 'linear-gradient(135deg, var(--coral-50) 0%, var(--sand-50) 100%)',
                    position: 'relative'
                }}
            >
                <Container maxWidth="md">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center' }}
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
                            Ready to work together?
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'var(--stone-600)',
                                fontWeight: 300,
                                mb: 6,
                                lineHeight: 1.6,
                            }}
                        >
                            Let's create something extraordinary that makes a lasting impact
                            on your business and your users.
                        </Typography>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" sx={{ mb: 4 }}>
                            <Link to="/contact" className="no-underline">
                                <Button
                                    variant="contained"
                                    size="large"
                                    endIcon={<ArrowOutward />}
                                    sx={{
                                        backgroundColor: 'var(--sage-400)',
                                        color: 'white',
                                        borderRadius: '50px',
                                        px: 6,
                                        py: 2.5,
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
                                    Start a Conversation
                                </Button>
                            </Link>
                            <Link to="/projects" className="no-underline">
                                <Button
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        borderColor: 'var(--stone-300)',
                                        color: 'var(--stone-700)',
                                        borderRadius: '50px',
                                        px: 6,
                                        py: 2.5,
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        letterSpacing: '0.025em',
                                        textTransform: 'none',
                                        transition: 'all 0.4s ease',
                                        '&:hover': {
                                            borderColor: 'var(--coral-400)',
                                            backgroundColor: 'var(--coral-50)',
                                            color: 'var(--coral-600)',
                                            transform: 'translateY(-2px)',
                                        }
                                    }}
                                >
                                    View Our Work
                                </Button>
                            </Link>
                        </Stack>

                        {/* Trust Indicators */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircleOutline sx={{ color: 'var(--sage-400)', fontSize: 20 }} />
                                <Typography variant="body2" sx={{ color: 'var(--stone-600)' }}>
                                    Free Consultation
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircleOutline sx={{ color: 'var(--sage-400)', fontSize: 20 }} />
                                <Typography variant="body2" sx={{ color: 'var(--stone-600)' }}>
                                    Guaranteed Results
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircleOutline sx={{ color: 'var(--sage-400)', fontSize: 20 }} />
                                <Typography variant="body2" sx={{ color: 'var(--stone-600)' }}>
                                    Ongoing Support
                                </Typography>
                            </Box>
                        </Box>
                    </motion.div>
                </Container>
            </section>
        </>
    )
}

export default About