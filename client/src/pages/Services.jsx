import React from 'react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    Avatar,
    Stack,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Skeleton
} from '@mui/material'
import {
    Search,
    Code,
    PhoneAndroid,
    Computer,
    Palette,
    Engineering,
    ArrowOutward,
    CheckCircle,
    AttachMoney,
    Schedule,
    Star,
    FilterList,
    AutoAwesomeOutlined,
    TrendingUpOutlined
} from '@mui/icons-material'
import { servicesAPI } from '../services/servicesAPI'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'

const Services = () => {
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategory, setFilterCategory] = useState('all')
    const [filteredServices, setFilteredServices] = useState([])
    const navigate = useNavigate()

    const [ref, inView] = useInView({
        threshold: 0.3,
        triggerOnce: true
    })

    const serviceCategories = [
        {
            value: 'web_development',
            label: 'Web Development',
            icon: <Code />,
            color: 'var(--sage-400)',
            bgColor: 'var(--sage-50)'
        },
        {
            value: 'mobile_development',
            label: 'Mobile Development',
            icon: <PhoneAndroid />,
            color: 'var(--coral-400)',
            bgColor: 'var(--coral-50)'
        },
        {
            value: 'custom_software',
            label: 'Custom Software',
            icon: <Computer />,
            color: 'var(--sand-600)',
            bgColor: 'var(--sand-50)'
        },
        {
            value: 'ui_ux_design',
            label: 'UI/UX Design',
            icon: <Palette />,
            color: 'var(--coral-600)',
            bgColor: 'var(--coral-50)'
        },
        {
            value: 'enterprise_solutions',
            label: 'Enterprise Solutions',
            icon: <Engineering />,
            color: 'var(--sage-600)',
            bgColor: 'var(--sage-50)'
        }
    ]

    const stats = [
        {
            number: 50,
            suffix: '+',
            label: 'Projects Completed',
            color: 'var(--sage-400)',
            bgColor: 'var(--sage-50)'
        },
        {
            number: 25,
            suffix: '+',
            label: 'Happy Clients',
            color: 'var(--coral-400)',
            bgColor: 'var(--coral-50)'
        },
        {
            number: 5,
            suffix: '+',
            label: 'Years Experience',
            color: 'var(--sand-600)',
            bgColor: 'var(--sand-50)'
        },
        {
            number: 100,
            suffix: '%',
            label: 'Client Satisfaction',
            color: 'var(--sage-600)',
            bgColor: 'var(--sage-50)'
        }
    ]

    useEffect(() => {
        loadServices()
    }, [])

    useEffect(() => {
        filterServices()
    }, [services, searchTerm, filterCategory])

    const loadServices = async () => {
        try {
            setLoading(true)
            console.log('🔄 Starting to load services...');
            console.log('🌐 API Base URL:', import.meta.env.VITE_API_URL);

            const response = await servicesAPI.getAllServices({
                active: true,
                limit: 50
            })

            console.log('📡 Raw API Response:', response);
            console.log('📊 Response type:', typeof response);
            console.log('📋 Response keys:', Object.keys(response || {}));

            let servicesData = []

            // Debug each possible response structure
            if (Array.isArray(response)) {
                console.log('✅ Response is direct array');
                servicesData = response
            } else if (response.data && Array.isArray(response.data)) {
                console.log('✅ Response has data array');
                servicesData = response.data
            } else if (response.services && Array.isArray(response.services)) {
                console.log('✅ Response has services array');
                servicesData = response.services
            } else {
                console.log('⚠️ Unexpected response structure:', response);
            }

            console.log('🎯 Final services data:', servicesData);
            console.log('📈 Services count:', servicesData.length);

            if (servicesData.length > 0) {
                console.log('📝 First service sample:', servicesData[0]);
            }

            setServices(servicesData)
            setError(null)

            console.log('✅ Services set successfully in state');

        } catch (error) {
            console.error('❌ Error loading services:', error)
            console.error('❌ Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            setError('Failed to load services. Please try again later.')

            // Fallback to sample data for debugging
            console.log('⚠️ Using fallback sample data');
            setServices([
                {
                    id: 1,
                    slug: 'web-development',
                    name: 'Web Development',
                    short_description: 'Modern, responsive websites and web applications.',
                    category: 'web_development',
                    features: ['React/Next.js', 'Node.js', 'E-commerce', 'CMS Development'],
                    technologies: ['React', 'Next.js', 'Node.js', 'TypeScript'],
                    starting_price: 2500,
                    estimated_timeline: '4-8 weeks',
                    is_featured: true,
                    is_active: true
                }
            ])
        } finally {
            setLoading(false)
            console.log('🏁 Load services completed');
        }
    }

    const filterServices = () => {
        let filtered = services

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(service =>
                service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.short_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (service.technologies && service.technologies.some(tech =>
                    tech.toLowerCase().includes(searchTerm.toLowerCase())
                ))
            )
        }

        // Apply category filter
        if (filterCategory !== 'all') {
            filtered = filtered.filter(service => service.category === filterCategory)
        }

        setFilteredServices(filtered)
    }

    const getCategoryData = (category) => {
        return serviceCategories.find(cat => cat.value === category) || {
            label: category,
            icon: <Code />,
            color: 'var(--stone-600)',
            bgColor: 'var(--stone-50)'
        }
    }

    const handleServiceClick = (service) => {
        navigate(`/services/${service.slug}`)
    }

    const ServiceSkeleton = () => (
        <Card sx={{
            height: '100%',
            border: '1px solid var(--stone-100)',
            borderRadius: '24px',
            p: 2
        }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Skeleton variant="circular" width={64} height={64} sx={{ mr: 2 }} />
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="rectangular" width={80} height={24} sx={{ mb: 1, borderRadius: '12px' }} />
                        <Skeleton variant="text" width="70%" height={28} />
                    </Box>
                </Box>
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="80%" height={20} sx={{ mb: 3 }} />
                <Box sx={{ mb: 2 }}>
                    <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="60%" height={16} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="50%" height={16} />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    <Skeleton variant="rounded" width={60} height={24} />
                    <Skeleton variant="rounded" width={80} height={24} />
                    <Skeleton variant="rounded" width={70} height={24} />
                </Box>
                <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: '50px' }} />
            </CardContent>
        </Card>
    )

    if (error && services.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Alert
                    severity="error"
                    sx={{
                        mb: 4,
                        borderRadius: '16px',
                        backgroundColor: 'var(--coral-50)',
                        color: 'var(--coral-600)',
                        border: '1px solid var(--coral-200)',
                    }}
                >
                    {error}
                </Alert>
                <Button
                    variant="contained"
                    onClick={loadServices}
                    sx={{
                        backgroundColor: 'var(--sage-400)',
                        '&:hover': { backgroundColor: 'var(--sage-500)' }
                    }}
                >
                    Try Again
                </Button>
            </Container>
        )
    }

    return (
        <>
            <Helmet>
                <title>Our Services - GS Infotech | Professional Development Services</title>
                <meta name="description" content="Discover our comprehensive range of development services including web development, mobile apps, custom software, UI/UX design, and enterprise solutions." />
                <meta name="keywords" content="web development, mobile app development, custom software, UI UX design, enterprise solutions" />
            </Helmet>

            {/* Hero Section - Center Aligned */}
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
                        background: 'linear-gradient(135deg, var(--sage-50) 0%, var(--sand-50) 50%, var(--coral-50) 100%)',
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
                    <Box sx={{ textAlign: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                        >
                            <Chip
                                icon={<AutoAwesomeOutlined sx={{ fontSize: 16 }} />}
                                label="OUR SERVICES"
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
                                We craft digital
                                <br />
                                <span style={{ fontWeight: 600, color: 'var(--sage-600)' }}>experiences that matter</span>
                            </Typography>
                            <Typography
                                variant="h5"
                                sx={{
                                    color: 'var(--stone-600)',
                                    fontWeight: 300,
                                    lineHeight: 1.6,
                                    maxWidth: '700px',
                                    mx: 'auto',
                                    fontSize: { xs: '1.1rem', md: '1.25rem' }
                                }}
                            >
                                From concept to deployment, we provide comprehensive development services
                                that transform your ideas into powerful digital solutions.
                            </Typography>
                        </motion.div>
                    </Box>
                </Container>
            </section>

            {/* Stats Section - Single Row Center Aligned */}
            <section style={{ padding: '6rem 0', backgroundColor: 'white' }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Grid container spacing={4} ref={ref} sx={{ maxWidth: '1200px' }} justifyContent="center">
                            {stats.map((stat, index) => (
                                <Grid item xs={6} sm={3} md={3} lg={3} key={index}>
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
                                                height: '100%',
                                                minHeight: '200px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
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
                                                fontWeight: 500,
                                                lineHeight: 1.4
                                            }}>
                                                {stat.label}
                                            </Typography>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Container>
            </section>

            {/* Services Section - Center Aligned */}
            <section style={{ padding: '6rem 0', background: 'linear-gradient(135deg, var(--sage-50) 0%, var(--sand-50) 100%)' }}>
                <Container maxWidth="lg">
                    {/* Section Header */}
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
                            What We Do
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
                            Explore our comprehensive range of services designed to bring your digital vision to life.
                        </Typography>
                    </motion.div>

                    {/* Search and Filter - Center Aligned */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        style={{ marginBottom: '3rem' }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Card sx={{
                                p: 4,
                                borderRadius: '24px',
                                border: '1px solid var(--stone-100)',
                                backgroundColor: 'white',
                                boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.1)',
                                maxWidth: '800px',
                                width: '100%'
                            }}>
                                <Grid container spacing={3} alignItems="center">
                                    <Grid item xs={12} md={8}>
                                        <TextField
                                            fullWidth
                                            placeholder="Search services, technologies, or keywords..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Search sx={{ color: 'var(--stone-400)' }} />
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    borderRadius: '50px',
                                                    backgroundColor: 'var(--stone-50)',
                                                    '& .MuiOutlinedInput-root': {
                                                        '& fieldset': {
                                                            borderColor: 'transparent',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: 'var(--sage-400)',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: 'var(--sage-400)',
                                                        },
                                                    },
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <FormControl fullWidth>
                                            <InputLabel sx={{ color: 'var(--stone-600)' }}>Filter by Category</InputLabel>
                                            <Select
                                                value={filterCategory}
                                                label="Filter by Category"
                                                onChange={(e) => setFilterCategory(e.target.value)}
                                                startAdornment={<FilterList sx={{ mr: 1, color: 'var(--stone-400)' }} />}
                                                sx={{
                                                    borderRadius: '50px',
                                                    '& .MuiOutlinedInput-root': {
                                                        '& fieldset': {
                                                            borderColor: 'var(--stone-200)',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: 'var(--sage-400)',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: 'var(--sage-400)',
                                                        },
                                                    },
                                                }}
                                            >
                                                <MenuItem value="all">All Services</MenuItem>
                                                {serviceCategories.map((category) => (
                                                    <MenuItem key={category.value} value={category.value}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ color: category.color }}>
                                                                {category.icon}
                                                            </Box>
                                                            {category.label}
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Card>
                        </Box>
                    </motion.div>

                    {/* Results Count - Center Aligned */}
                    {!loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ marginBottom: '2rem' }}
                        >
                            <Typography variant="body1" sx={{ color: 'var(--stone-600)', textAlign: 'center' }}>
                                {filteredServices.length === 0
                                    ? 'No services found matching your criteria'
                                    : `Showing ${filteredServices.length} service${filteredServices.length !== 1 ? 's' : ''}`
                                }
                            </Typography>
                        </motion.div>
                    )}

                    {/* Enhanced Services Grid - Center Aligned */}
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ width: '100%', maxWidth: '1200px' }}>
                            {loading ? (
                                <Grid container spacing={4} justifyContent="center">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <Grid item xs={12} md={6} lg={4} key={index}>
                                            <ServiceSkeleton />
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : filteredServices.length > 0 ? (
                                <>
                                    {/* Featured Services - Centered */}
                                    <Box sx={{ mb: 6 }}>
                                        <Typography variant="h4" sx={{
                                            color: 'var(--stone-800)',
                                            fontWeight: 300,
                                            mb: 4,
                                            textAlign: 'center'
                                        }}>
                                            Featured Services
                                        </Typography>
                                        <Grid container spacing={4} justifyContent="center">
                                            {filteredServices.filter(service => service.is_featured).map((service, index) => {
                                                const categoryData = getCategoryData(service.category)
                                                return (
                                                    <Grid item xs={12} md={6} key={service.id}>
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                                            transition={{ duration: 0.8, delay: index * 0.2 }}
                                                            viewport={{ once: true }}
                                                            whileHover={{ y: -16, scale: 1.02 }}
                                                        >
                                                            <Card
                                                                sx={{
                                                                    height: '100%',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    position: 'relative',
                                                                    overflow: 'visible',
                                                                    border: '1px solid var(--stone-100)',
                                                                    borderRadius: '32px',
                                                                    backgroundColor: 'white',
                                                                    boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.12)',
                                                                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                    cursor: 'pointer',
                                                                    '&:hover': {
                                                                        boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.18)',
                                                                        borderColor: categoryData.color,
                                                                        '& .featured-badge': {
                                                                            transform: 'scale(1.1)',
                                                                        },
                                                                        '& .service-icon': {
                                                                            transform: 'scale(1.15) rotate(5deg)',
                                                                            backgroundColor: categoryData.color,
                                                                            color: 'white'
                                                                        },
                                                                        '& .learn-more-btn': {
                                                                            backgroundColor: categoryData.color,
                                                                            color: 'white',
                                                                            borderColor: categoryData.color,
                                                                            transform: 'translateY(-2px)',
                                                                        }
                                                                    }
                                                                }}
                                                                onClick={() => handleServiceClick(service)}
                                                            >
                                                                {/* Featured Badge */}
                                                                <Box
                                                                    className="featured-badge"
                                                                    sx={{
                                                                        position: 'absolute',
                                                                        top: -16,
                                                                        right: 24,
                                                                        zIndex: 3,
                                                                        transition: 'transform 0.3s ease',
                                                                    }}
                                                                >
                                                                    <Box
                                                                        sx={{
                                                                            background: 'linear-gradient(135deg, var(--sand-400) 0%, var(--coral-400) 100%)',
                                                                            color: 'white',
                                                                            px: 3,
                                                                            py: 1,
                                                                            borderRadius: '50px',
                                                                            fontSize: '0.875rem',
                                                                            fontWeight: 600,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 1,
                                                                            boxShadow: '0 8px 24px -4px rgba(237, 189, 131, 0.4)',
                                                                        }}
                                                                    >
                                                                        <Star sx={{ fontSize: 16 }} />
                                                                        Featured
                                                                    </Box>
                                                                </Box>

                                                                <CardContent sx={{ flexGrow: 1, p: 5 }}>
                                                                    {/* Service Header - Center Aligned */}
                                                                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                                                                        <Avatar
                                                                            className="service-icon"
                                                                            sx={{
                                                                                width: 80,
                                                                                height: 80,
                                                                                backgroundColor: categoryData.bgColor,
                                                                                color: categoryData.color,
                                                                                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                                fontSize: '2.5rem',
                                                                                mx: 'auto',
                                                                                mb: 3,
                                                                            }}
                                                                        >
                                                                            {React.cloneElement(categoryData.icon, { sx: { fontSize: 'inherit' } })}
                                                                        </Avatar>

                                                                        <Chip
                                                                            label={categoryData.label}
                                                                            size="small"
                                                                            sx={{
                                                                                mb: 2,
                                                                                backgroundColor: categoryData.bgColor,
                                                                                color: categoryData.color,
                                                                                fontWeight: 500,
                                                                                fontSize: '0.75rem',
                                                                                borderRadius: '50px',
                                                                            }}
                                                                        />

                                                                        <Typography
                                                                            variant="h4"
                                                                            sx={{
                                                                                fontWeight: 600,
                                                                                lineHeight: 1.2,
                                                                                color: 'var(--stone-800)',
                                                                                mb: 2,
                                                                            }}
                                                                        >
                                                                            {service.name}
                                                                        </Typography>
                                                                    </Box>

                                                                    {/* Service Description */}
                                                                    <Typography
                                                                        variant="body1"
                                                                        sx={{
                                                                            color: 'var(--stone-600)',
                                                                            mb: 4,
                                                                            lineHeight: 1.7,
                                                                            fontSize: '1rem',
                                                                            textAlign: 'center'
                                                                        }}
                                                                    >
                                                                        {service.short_description}
                                                                    </Typography>

                                                                    {/* Features Grid */}
                                                                    {service.features && service.features.length > 0 && (
                                                                        <Box sx={{ mb: 4 }}>
                                                                            <Typography variant="h6" sx={{
                                                                                color: 'var(--stone-800)',
                                                                                fontWeight: 600,
                                                                                mb: 2,
                                                                                fontSize: '1rem',
                                                                                textAlign: 'center'
                                                                            }}>
                                                                                Key Features
                                                                            </Typography>
                                                                            <Grid container spacing={2} justifyContent="center">
                                                                                {service.features.slice(0, 4).map((feature, idx) => (
                                                                                    <Grid item xs={12} sm={6} key={idx}>
                                                                                        <Box sx={{
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            gap: 1.5,
                                                                                            p: 1.5,
                                                                                            backgroundColor: 'var(--stone-50)',
                                                                                            borderRadius: '12px',
                                                                                            border: '1px solid var(--stone-100)',
                                                                                        }}>
                                                                                            <CheckCircle sx={{
                                                                                                fontSize: 18,
                                                                                                color: categoryData.color,
                                                                                                flexShrink: 0,
                                                                                            }} />
                                                                                            <Typography
                                                                                                variant="body2"
                                                                                                sx={{
                                                                                                    color: 'var(--stone-700)',
                                                                                                    fontSize: '0.875rem',
                                                                                                    fontWeight: 500,
                                                                                                }}
                                                                                            >
                                                                                                {feature}
                                                                                            </Typography>
                                                                                        </Box>
                                                                                    </Grid>
                                                                                ))}
                                                                            </Grid>
                                                                        </Box>
                                                                    )}

                                                                    {/* Technologies */}
                                                                    {service.technologies && service.technologies.length > 0 && (
                                                                        <Box sx={{ mb: 4, textAlign: 'center' }}>
                                                                            <Typography variant="h6" sx={{
                                                                                color: 'var(--stone-800)',
                                                                                fontWeight: 600,
                                                                                mb: 2,
                                                                                fontSize: '1rem'
                                                                            }}>
                                                                                Technologies
                                                                            </Typography>
                                                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ maxWidth: '400px' }}>
                                                                                    {service.technologies.map((tech, idx) => (
                                                                                        <Chip
                                                                                            key={idx}
                                                                                            label={tech}
                                                                                            size="small"
                                                                                            sx={{
                                                                                                backgroundColor: 'white',
                                                                                                color: 'var(--stone-700)',
                                                                                                fontSize: '0.8rem',
                                                                                                height: 28,
                                                                                                borderRadius: '14px',
                                                                                                border: '1px solid var(--stone-200)',
                                                                                                fontWeight: 500,
                                                                                                '&:hover': {
                                                                                                    backgroundColor: categoryData.bgColor,
                                                                                                    color: categoryData.color,
                                                                                                    borderColor: categoryData.color,
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                    ))}
                                                                                </Stack>
                                                                            </Box>
                                                                        </Box>
                                                                    )}

                                                                    {/* Pricing Section - Center Aligned */}
                                                                    <Box sx={{
                                                                        p: 3,
                                                                        backgroundColor: 'var(--stone-50)',
                                                                        borderRadius: '16px',
                                                                        border: '1px solid var(--stone-100)',
                                                                        mb: 4,
                                                                        textAlign: 'center'
                                                                    }}>
                                                                        <Grid container spacing={3} justifyContent="center">
                                                                            {service.starting_price && (
                                                                                <Grid item xs={12} sm={6}>
                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                                                        <AttachMoney sx={{ fontSize: 20, color: categoryData.color }} />
                                                                                        <Box>
                                                                                            <Typography variant="body2" sx={{ color: 'var(--stone-500)', fontSize: '0.75rem' }}>
                                                                                                Starting from
                                                                                            </Typography>
                                                                                            <Typography variant="h6" sx={{ color: 'var(--stone-800)', fontWeight: 600 }}>
                                                                                                ${service.starting_price.toLocaleString()}
                                                                                            </Typography>
                                                                                        </Box>
                                                                                    </Box>
                                                                                </Grid>
                                                                            )}
                                                                            {service.estimated_timeline && (
                                                                                <Grid item xs={12} sm={6}>
                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                                                        <Schedule sx={{ fontSize: 20, color: categoryData.color }} />
                                                                                        <Box>
                                                                                            <Typography variant="body2" sx={{ color: 'var(--stone-500)', fontSize: '0.75rem' }}>
                                                                                                Timeline
                                                                                            </Typography>
                                                                                            <Typography variant="h6" sx={{ color: 'var(--stone-800)', fontWeight: 600 }}>
                                                                                                {service.estimated_timeline}
                                                                                            </Typography>
                                                                                        </Box>
                                                                                    </Box>
                                                                                </Grid>
                                                                            )}
                                                                        </Grid>
                                                                    </Box>
                                                                </CardContent>

                                                                <CardActions sx={{ p: 5, pt: 0 }}>
                                                                    <Button
                                                                        className="learn-more-btn"
                                                                        fullWidth
                                                                        variant="outlined"
                                                                        endIcon={<ArrowOutward />}
                                                                        sx={{
                                                                            borderColor: 'var(--stone-200)',
                                                                            color: 'var(--stone-700)',
                                                                            fontWeight: 500,
                                                                            py: 2,
                                                                            borderRadius: '50px',
                                                                            fontSize: '1rem',
                                                                            transition: 'all 0.4s ease',
                                                                        }}
                                                                    >
                                                                        Learn More & Get Quote
                                                                    </Button>
                                                                </CardActions>
                                                            </Card>
                                                        </motion.div>
                                                    </Grid>
                                                )
                                            })}
                                        </Grid>
                                    </Box>

                                    {/* Regular Services - Center Aligned Compact Grid */}
                                    {filteredServices.filter(service => !service.is_featured).length > 0 && (
                                        <Box>
                                            <Typography variant="h4" sx={{
                                                color: 'var(--stone-800)',
                                                fontWeight: 300,
                                                mb: 4,
                                                textAlign: 'center'
                                            }}>
                                                All Services
                                            </Typography>
                                            <Grid container spacing={3} justifyContent="center">
                                                {filteredServices.filter(service => !service.is_featured).map((service, index) => {
                                                    const categoryData = getCategoryData(service.category)
                                                    return (
                                                        <Grid item xs={12} sm={6} md={4} key={service.id}>
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 30 }}
                                                                whileInView={{ opacity: 1, y: 0 }}
                                                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                                                viewport={{ once: true }}
                                                                whileHover={{ y: -8 }}
                                                            >
                                                                <Card
                                                                    sx={{
                                                                        height: '100%',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        border: '1px solid var(--stone-100)',
                                                                        borderRadius: '24px',
                                                                        backgroundColor: 'white',
                                                                        boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.1)',
                                                                        transition: 'all 0.4s ease',
                                                                        cursor: 'pointer',
                                                                        '&:hover': {
                                                                            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
                                                                            borderColor: categoryData.color,
                                                                            '& .service-icon': {
                                                                                transform: 'scale(1.1)',
                                                                                backgroundColor: categoryData.color,
                                                                                color: 'white'
                                                                            },
                                                                            '& .learn-more-btn': {
                                                                                backgroundColor: categoryData.color,
                                                                                color: 'white',
                                                                                borderColor: categoryData.color,
                                                                            }
                                                                        }
                                                                    }}
                                                                    onClick={() => handleServiceClick(service)}
                                                                >
                                                                    <CardContent sx={{ flexGrow: 1, p: 4 }}>
                                                                        {/* Service Icon - Centered */}
                                                                        <Box sx={{ mb: 3, textAlign: 'center' }}>
                                                                            <Avatar
                                                                                className="service-icon"
                                                                                sx={{
                                                                                    width: 64,
                                                                                    height: 64,
                                                                                    backgroundColor: categoryData.bgColor,
                                                                                    color: categoryData.color,
                                                                                    transition: 'all 0.4s ease',
                                                                                    fontSize: '1.8rem',
                                                                                    mx: 'auto',
                                                                                }}
                                                                            >
                                                                                {React.cloneElement(categoryData.icon, { sx: { fontSize: 'inherit' } })}
                                                                            </Avatar>
                                                                        </Box>

                                                                        {/* Category & Title - Centered */}
                                                                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                                                                            <Chip
                                                                                label={categoryData.label}
                                                                                size="small"
                                                                                sx={{
                                                                                    mb: 2,
                                                                                    backgroundColor: categoryData.bgColor,
                                                                                    color: categoryData.color,
                                                                                    fontWeight: 500,
                                                                                    fontSize: '0.75rem',
                                                                                    borderRadius: '50px',
                                                                                }}
                                                                            />

                                                                            <Typography
                                                                                variant="h6"
                                                                                sx={{
                                                                                    fontWeight: 600,
                                                                                    lineHeight: 1.3,
                                                                                    color: 'var(--stone-800)',
                                                                                    mb: 2,
                                                                                }}
                                                                            >
                                                                                {service.name}
                                                                            </Typography>

                                                                            <Typography
                                                                                variant="body2"
                                                                                sx={{
                                                                                    color: 'var(--stone-600)',
                                                                                    lineHeight: 1.6,
                                                                                    mb: 3,
                                                                                }}
                                                                            >
                                                                                {service.short_description}
                                                                            </Typography>
                                                                        </Box>

                                                                        {/* Key Features - Centered */}
                                                                        {service.features && service.features.length > 0 && (
                                                                            <Box sx={{ mb: 3, textAlign: 'center' }}>
                                                                                <Stack spacing={1} alignItems="center">
                                                                                    {service.features.slice(0, 3).map((feature, idx) => (
                                                                                        <Box
                                                                                            key={idx}
                                                                                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                                                                        >
                                                                                            <CheckCircle sx={{
                                                                                                fontSize: 14,
                                                                                                color: categoryData.color,
                                                                                                flexShrink: 0,
                                                                                            }} />
                                                                                            <Typography
                                                                                                variant="body2"
                                                                                                sx={{
                                                                                                    color: 'var(--stone-600)',
                                                                                                    fontSize: '0.8rem',
                                                                                                }}
                                                                                            >
                                                                                                {feature}
                                                                                            </Typography>
                                                                                        </Box>
                                                                                    ))}
                                                                                </Stack>
                                                                            </Box>
                                                                        )}

                                                                        {/* Pricing Info - Centered */}
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            justifyContent: 'center',
                                                                            p: 2,
                                                                            backgroundColor: 'var(--stone-50)',
                                                                            borderRadius: '12px',
                                                                            mb: 3
                                                                        }}>
                                                                            <Stack direction="row" spacing={4} divider={<Box sx={{ width: 1, height: 30, backgroundColor: 'var(--stone-200)' }} />}>
                                                                                {service.starting_price && (
                                                                                    <Box sx={{ textAlign: 'center' }}>
                                                                                        <Typography variant="caption" sx={{ color: 'var(--stone-500)' }}>
                                                                                            From
                                                                                        </Typography>
                                                                                        <Typography variant="body2" sx={{ color: 'var(--stone-800)', fontWeight: 600 }}>
                                                                                            ${service.starting_price.toLocaleString()}
                                                                                        </Typography>
                                                                                    </Box>
                                                                                )}
                                                                                {service.estimated_timeline && (
                                                                                    <Box sx={{ textAlign: 'center' }}>
                                                                                        <Typography variant="caption" sx={{ color: 'var(--stone-500)' }}>
                                                                                            Timeline
                                                                                        </Typography>
                                                                                        <Typography variant="body2" sx={{ color: 'var(--stone-800)', fontWeight: 600 }}>
                                                                                            {service.estimated_timeline}
                                                                                        </Typography>
                                                                                    </Box>
                                                                                )}
                                                                            </Stack>
                                                                        </Box>
                                                                    </CardContent>

                                                                    <CardActions sx={{ p: 4, pt: 0 }}>
                                                                        <Button
                                                                            className="learn-more-btn"
                                                                            fullWidth
                                                                            variant="outlined"
                                                                            endIcon={<ArrowOutward />}
                                                                            sx={{
                                                                                borderColor: 'var(--stone-200)',
                                                                                color: 'var(--stone-700)',
                                                                                fontWeight: 500,
                                                                                py: 1.5,
                                                                                borderRadius: '50px',
                                                                                transition: 'all 0.4s ease',
                                                                            }}
                                                                        >
                                                                            Learn More
                                                                        </Button>
                                                                    </CardActions>
                                                                </Card>
                                                            </motion.div>
                                                        </Grid>
                                                    )
                                                })}
                                            </Grid>
                                        </Box>
                                    )}
                                </>
                            ) : (
                                // Enhanced Empty State - Centered
                                <Box sx={{ width: '100%' }}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Box sx={{ textAlign: 'center', py: 12 }}>
                                            <Box
                                                sx={{
                                                    width: 160,
                                                    height: 160,
                                                    background: 'linear-gradient(135deg, var(--sage-100) 0%, var(--coral-100) 100%)',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mx: 'auto',
                                                    mb: 4,
                                                    position: 'relative',
                                                    '&::before': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        inset: 8,
                                                        borderRadius: '50%',
                                                        background: 'white',
                                                    }
                                                }}
                                            >
                                                <Search sx={{ fontSize: 64, color: 'var(--stone-400)', position: 'relative', zIndex: 1 }} />
                                            </Box>
                                            <Typography variant="h4" sx={{ color: 'var(--stone-700)', mb: 2, fontWeight: 300 }}>
                                                No services found
                                            </Typography>
                                            <Typography variant="body1" sx={{ color: 'var(--stone-500)', mb: 6, maxWidth: '400px', mx: 'auto' }}>
                                                We couldn't find any services matching your search criteria. Try adjusting your filters or search terms.
                                            </Typography>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => {
                                                        setSearchTerm('')
                                                        setFilterCategory('all')
                                                    }}
                                                    sx={{
                                                        borderColor: 'var(--sage-400)',
                                                        color: 'var(--sage-600)',
                                                        borderRadius: '50px',
                                                        px: 4,
                                                        '&:hover': {
                                                            backgroundColor: 'var(--sage-50)',
                                                            borderColor: 'var(--sage-500)',
                                                        }
                                                    }}
                                                >
                                                    Clear All Filters
                                                </Button>
                                                <Button
                                                    component={Link}
                                                    to="/contact"
                                                    variant="contained"
                                                    sx={{
                                                        backgroundColor: 'var(--coral-400)',
                                                        color: 'white',
                                                        borderRadius: '50px',
                                                        px: 4,
                                                        '&:hover': {
                                                            backgroundColor: 'var(--coral-500)',
                                                        }
                                                    }}
                                                >
                                                    Request Custom Service
                                                </Button>
                                            </Stack>
                                        </Box>
                                    </motion.div>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Container>
            </section>

            {/* Why Choose Us Section - Center Aligned */}
            <section style={{ padding: '6rem 0', backgroundColor: 'white' }}>
                <Container maxWidth="lg">
                    {/* Section Header - Center Aligned */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        style={{ marginBottom: '5rem', textAlign: 'center' }}
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
                            Why Choose Us
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'var(--stone-600)',
                                fontWeight: 300,
                                lineHeight: 1.6,
                                mb: 4,
                                maxWidth: '600px',
                                mx: 'auto'
                            }}
                        >
                            We combine technical expertise with creative vision to deliver exceptional results that drive your business forward.
                        </Typography>

                        {/* Enhanced Quote Section */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 2,
                            mt: 4,
                            p: 4,
                            backgroundColor: 'var(--sage-50)',
                            borderRadius: '24px',
                            border: '1px solid var(--sage-100)',
                            maxWidth: '600px',
                            mx: 'auto'
                        }}>
                            <Box sx={{
                                width: 4,
                                height: 60,
                                background: 'linear-gradient(135deg, var(--sage-400) 0%, var(--coral-400) 100%)',
                                borderRadius: '2px'
                            }} />
                            <Typography variant="h6" sx={{
                                color: 'var(--stone-700)',
                                fontStyle: 'italic',
                                fontWeight: 300,
                                textAlign: 'center'
                            }}>
                                "Excellence is not a skill, it's an attitude we bring to every project."
                            </Typography>
                        </Box>
                    </motion.div>

                    {/* Enhanced Features Grid - Perfect Center Aligned */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <Grid container spacing={4} justifyContent="center" sx={{ maxWidth: '1000px' }}>
                            {[
                                {
                                    icon: <TrendingUpOutlined sx={{ fontSize: 40 }} />,
                                    title: 'Proven Track Record',
                                    description: 'Over 50+ successful projects delivered with 100% client satisfaction rate across various industries.',
                                    stats: '50+ Projects',
                                    color: 'var(--sage-400)',
                                    bgColor: 'var(--sage-50)'
                                },
                                {
                                    icon: <AutoAwesomeOutlined sx={{ fontSize: 40 }} />,
                                    title: 'Cutting-Edge Technology',
                                    description: 'We use the latest technologies and best practices to ensure your project stays ahead of the competition.',
                                    stats: 'Latest Tech Stack',
                                    color: 'var(--coral-400)',
                                    bgColor: 'var(--coral-50)'
                                },
                                {
                                    icon: <CheckCircle sx={{ fontSize: 40 }} />,
                                    title: 'Quality Assurance',
                                    description: 'Rigorous testing and quality checks ensure your project meets the highest standards and exceeds expectations.',
                                    stats: '99.9% Uptime',
                                    color: 'var(--sand-600)',
                                    bgColor: 'var(--sand-50)'
                                }
                            ].map((item, index) => (
                                <Grid item xs={12} md={4} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: index * 0.2 }}
                                        viewport={{ once: true }}
                                        whileHover={{ y: -12 }}
                                        style={{ width: '100%', maxWidth: '320px' }}
                                    >
                                        <Card
                                            sx={{
                                                p: 5,
                                                height: '100%',
                                                width: '100%',
                                                border: '1px solid var(--stone-100)',
                                                borderRadius: '32px',
                                                backgroundColor: 'white',
                                                boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.12)',
                                                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: 4,
                                                    background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}80 100%)`,
                                                },
                                                '&:hover': {
                                                    boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.18)',
                                                    borderColor: item.color,
                                                    '& .feature-icon': {
                                                        transform: 'scale(1.1) rotate(5deg)',
                                                        backgroundColor: item.color,
                                                        color: 'white',
                                                    },
                                                    '& .feature-stat': {
                                                        color: item.color,
                                                    }
                                                }
                                            }}
                                        >
                                            {/* Icon Section - Centered */}
                                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                                <Box
                                                    className="feature-icon"
                                                    sx={{
                                                        width: 100,
                                                        height: 100,
                                                        backgroundColor: item.bgColor,
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mx: 'auto',
                                                        mb: 3,
                                                        color: item.color,
                                                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        position: 'relative',
                                                        '&::after': {
                                                            content: '""',
                                                            position: 'absolute',
                                                            inset: -8,
                                                            borderRadius: '50%',
                                                            background: `conic-gradient(from 0deg, ${item.color}20, transparent, ${item.color}20)`,
                                                            zIndex: -1,
                                                        }
                                                    }}
                                                >
                                                    {item.icon}
                                                </Box>

                                                {/* Stats Badge */}
                                                <Typography
                                                    className="feature-stat"
                                                    variant="body2"
                                                    sx={{
                                                        color: 'var(--stone-500)',
                                                        fontWeight: 600,
                                                        fontSize: '0.875rem',
                                                        transition: 'color 0.3s ease',
                                                    }}
                                                >
                                                    {item.stats}
                                                </Typography>
                                            </Box>

                                            {/* Content Section - Centered */}
                                            <Box sx={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <Typography
                                                    variant="h5"
                                                    sx={{
                                                        fontWeight: 600,
                                                        mb: 3,
                                                        color: 'var(--stone-800)',
                                                        lineHeight: 1.3,
                                                    }}
                                                >
                                                    {item.title}
                                                </Typography>

                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        color: 'var(--stone-600)',
                                                        lineHeight: 1.7,
                                                        fontSize: '1rem',
                                                    }}
                                                >
                                                    {item.description}
                                                </Typography>
                                            </Box>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    {/* Bottom CTA Section - Center Aligned */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        style={{ marginTop: '5rem' }}
                    >
                        <Box sx={{
                            textAlign: 'center',
                            p: 6,
                            background: 'linear-gradient(135deg, var(--sage-50) 0%, var(--sand-50) 100%)',
                            borderRadius: '32px',
                            border: '1px solid var(--stone-100)',
                            maxWidth: '800px',
                            mx: 'auto'
                        }}>
                            <Typography variant="h4" sx={{
                                color: 'var(--stone-800)',
                                fontWeight: 300,
                                mb: 2
                            }}>
                                Still have questions?
                            </Typography>
                            <Typography variant="body1" sx={{
                                color: 'var(--stone-600)',
                                mb: 4,
                                maxWidth: '500px',
                                mx: 'auto',
                                lineHeight: 1.6,
                            }}>
                                Our team is here to help you choose the right service for your needs.
                                Let's discuss your project requirements.
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                                <Button
                                    component={Link}
                                    to="/contact"
                                    variant="contained"
                                    endIcon={<ArrowOutward />}
                                    sx={{
                                        backgroundColor: 'var(--sage-400)',
                                        color: 'white',
                                        borderRadius: '50px',
                                        px: 6,
                                        py: 2,
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        transition: 'all 0.4s ease',
                                        '&:hover': {
                                            backgroundColor: 'var(--sage-500)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 25px -8px rgba(157, 176, 130, 0.4)',
                                        }
                                    }}
                                >
                                    Schedule a Consultation
                                </Button>
                                <Button
                                    component={Link}
                                    to="/projects"
                                    variant="outlined"
                                    sx={{
                                        borderColor: 'var(--coral-400)',
                                        color: 'var(--coral-600)',
                                        borderRadius: '50px',
                                        px: 6,
                                        py: 2,
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        transition: 'all 0.4s ease',
                                        '&:hover': {
                                            backgroundColor: 'var(--coral-50)',
                                            borderColor: 'var(--coral-500)',
                                            transform: 'translateY(-2px)',
                                        }
                                    }}
                                >
                                    View Case Studies
                                </Button>
                            </Stack>
                        </Box>
                    </motion.div>
                </Container>
            </section>
        </>
    )
}

export default Services