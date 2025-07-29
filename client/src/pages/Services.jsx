// client/src/pages/Services.jsx
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
    ArrowForward,
    CheckCircle,
    AttachMoney,
    Schedule,
    Star,
    FilterList
} from '@mui/icons-material'
import { servicesAPI } from '../services/servicesAPI'

const Services = () => {
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategory, setFilterCategory] = useState('all')
    const [filteredServices, setFilteredServices] = useState([])
    const navigate = useNavigate()

    const serviceCategories = [
        { value: 'web_development', label: 'Web Development', icon: <Code />, color: '#2196F3' },
        { value: 'mobile_development', label: 'Mobile Development', icon: <PhoneAndroid />, color: '#4CAF50' },
        { value: 'custom_software', label: 'Custom Software', icon: <Computer />, color: '#FF9800' },
        { value: 'ui_ux_design', label: 'UI/UX Design', icon: <Palette />, color: '#E91E63' },
        { value: 'enterprise_solutions', label: 'Enterprise Solutions', icon: <Engineering />, color: '#9C27B0' }
    ]

    const stats = [
        { number: '50+', label: 'Projects Completed' },
        { number: '25+', label: 'Happy Clients' },
        { number: '5+', label: 'Years Experience' },
        { number: '100%', label: 'Client Satisfaction' }
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
            const response = await servicesAPI.getAllServices({
                active: true,
                limit: 50
            })

            let servicesData = []
            if (Array.isArray(response)) {
                servicesData = response
            } else if (response.data && Array.isArray(response.data)) {
                servicesData = response.data
            } else if (response.services && Array.isArray(response.services)) {
                servicesData = response.services
            }

            setServices(servicesData)
            setError(null)
        } catch (error) {
            console.error('Error loading services:', error)
            setError('Failed to load services. Please try again later.')
            // Fallback to sample data
            setServices([
                {
                    id: 1,
                    slug: 'web-development',
                    name: 'Web Development',
                    short_description: 'Modern, responsive websites and web applications built with the latest technologies.',
                    category: 'web_development',
                    features: ['React/Next.js', 'Node.js', 'E-commerce', 'CMS Development'],
                    technologies: ['React', 'Next.js', 'Node.js', 'TypeScript'],
                    starting_price: 2500,
                    estimated_timeline: '4-8 weeks',
                    is_featured: true,
                    is_active: true
                },
                {
                    id: 2,
                    slug: 'mobile-app-development',
                    name: 'Mobile App Development',
                    short_description: 'Native and cross-platform mobile applications for iOS and Android devices.',
                    category: 'mobile_development',
                    features: ['iOS Development', 'Android Development', 'React Native', 'Flutter'],
                    technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
                    starting_price: 5000,
                    estimated_timeline: '8-12 weeks',
                    is_featured: true,
                    is_active: true
                },
                {
                    id: 3,
                    slug: 'custom-software-development',
                    name: 'Custom Software Development',
                    short_description: 'Tailored software solutions designed specifically for your business needs.',
                    category: 'custom_software',
                    features: ['Enterprise Applications', 'API Development', 'Database Design', 'Cloud Integration'],
                    technologies: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
                    starting_price: 7500,
                    estimated_timeline: '12-16 weeks',
                    is_featured: true,
                    is_active: true
                },
                {
                    id: 4,
                    slug: 'ui-ux-design',
                    name: 'UI/UX Design',
                    short_description: 'User-centered design that creates engaging and intuitive digital experiences.',
                    category: 'ui_ux_design',
                    features: ['User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
                    technologies: ['Figma', 'Adobe XD', 'Sketch', 'Principle'],
                    starting_price: 1500,
                    estimated_timeline: '2-4 weeks',
                    is_featured: false,
                    is_active: true
                }
            ])
        } finally {
            setLoading(false)
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
            color: '#666'
        }
    }

    const handleServiceClick = (service) => {
        navigate(`/services/${service.slug}`)
    }

    const ServiceSkeleton = () => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                    <Skeleton variant="text" width="60%" height={24} />
                </Box>
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Skeleton variant="rounded" width={60} height={24} />
                    <Skeleton variant="rounded" width={80} height={24} />
                    <Skeleton variant="rounded" width={70} height={24} />
                </Box>
                <Skeleton variant="rectangular" width="100%" height={36} />
            </CardContent>
        </Card>
    )

    if (error && services.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
                <Button variant="contained" onClick={loadServices}>
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

            {/* Hero Section */}
            <section className="min-h-[60vh] flex items-center bg-white">
                <Container maxWidth="lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Typography variant="overline" className="text-gray-500 tracking-widest mb-4">
                            OUR SERVICES
                        </Typography>
                        <Typography variant="h1" className="text-5xl md:text-6xl lg:text-7xl font-light mb-6 leading-tight">
                            We craft digital
                            <br />
                            <span className="font-semibold">experiences that matter</span>
                        </Typography>
                        <Typography variant="h5" className="text-gray-600 font-light max-w-3xl leading-relaxed">
                            From concept to deployment, we provide comprehensive development services
                            that transform your ideas into powerful digital solutions.
                        </Typography>
                    </motion.div>
                </Container>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gray-50">
                <Container maxWidth="lg">
                    <Grid container spacing={0}>
                        {stats.map((stat, index) => (
                            <Grid item xs={6} md={3} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Box
                                        className="text-center py-8"
                                        sx={{
                                            borderRight: index < stats.length - 1 ? '1px solid #e5e7eb' : 'none',
                                            '@media (max-width: 900px)': {
                                                borderRight: index % 2 === 0 ? '1px solid #e5e7eb' : 'none',
                                                borderBottom: index < 2 ? '1px solid #e5e7eb' : 'none'
                                            }
                                        }}
                                    >
                                        <Typography variant="h2" className="font-light mb-2">
                                            {stat.number}
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

            {/* Services Section */}
            <section className="py-20 bg-white">
                <Container maxWidth="lg">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="mb-16"
                    >
                        <Typography variant="h2" className="text-4xl md:text-5xl font-light mb-6">
                            What We Do
                        </Typography>
                        <Typography variant="h6" className="text-gray-600 font-light max-w-2xl">
                            Explore our comprehensive range of services designed to bring your digital vision to life.
                        </Typography>
                    </motion.div>

                    {/* Search and Filter */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <Card sx={{ p: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
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
                                                    <Search sx={{ color: 'gray.500' }} />
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                '& .MuiOutlinedInput-root': {
                                                    '& fieldset': {
                                                        borderColor: 'transparent',
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: 'primary.main',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: 'primary.main',
                                                    },
                                                },
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Filter by Category</InputLabel>
                                        <Select
                                            value={filterCategory}
                                            label="Filter by Category"
                                            onChange={(e) => setFilterCategory(e.target.value)}
                                            startAdornment={<FilterList sx={{ mr: 1, color: 'gray.500' }} />}
                                        >
                                            <MenuItem value="all">All Services</MenuItem>
                                            {serviceCategories.map((category) => (
                                                <MenuItem key={category.value} value={category.value}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {category.icon}
                                                        {category.label}
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Card>
                    </motion.div>

                    {/* Results Count */}
                    {!loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mb-8"
                        >
                            <Typography variant="body1" className="text-gray-600">
                                {filteredServices.length === 0
                                    ? 'No services found matching your criteria'
                                    : `Showing ${filteredServices.length} service${filteredServices.length !== 1 ? 's' : ''}`
                                }
                            </Typography>
                        </motion.div>
                    )}

                    {/* Services Grid */}
                    <Grid container spacing={4}>
                        {loading ? (
                            // Loading skeletons
                            Array.from({ length: 6 }).map((_, index) => (
                                <Grid item xs={12} md={6} lg={4} key={index}>
                                    <ServiceSkeleton />
                                </Grid>
                            ))
                        ) : filteredServices.length > 0 ? (
                            // Actual services
                            filteredServices.map((service, index) => {
                                const categoryData = getCategoryData(service.category)

                                return (
                                    <Grid item xs={12} md={6} lg={4} key={service.id}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: index * 0.1 }}
                                            viewport={{ once: true }}
                                        >
                                            <Card
                                                sx={{
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    position: 'relative',
                                                    overflow: 'visible',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                                    border: '1px solid #f0f0f0',
                                                    transition: 'all 0.3s ease',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        transform: 'translateY(-8px)',
                                                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                                                        '& .service-icon': {
                                                            transform: 'scale(1.1)',
                                                            bgcolor: categoryData.color,
                                                            color: 'white'
                                                        },
                                                        '& .learn-more-btn': {
                                                            bgcolor: 'black',
                                                            color: 'white'
                                                        }
                                                    }
                                                }}
                                                onClick={() => handleServiceClick(service)}
                                            >
                                                {/* Featured Badge */}
                                                {service.is_featured && (
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: -8,
                                                            right: 16,
                                                            zIndex: 2
                                                        }}
                                                    >
                                                        <Chip
                                                            icon={<Star />}
                                                            label="Featured"
                                                            size="small"
                                                            sx={{
                                                                bgcolor: '#FFD700',
                                                                color: 'black',
                                                                fontWeight: 'bold',
                                                                '& .MuiChip-icon': {
                                                                    color: 'black'
                                                                }
                                                            }}
                                                        />
                                                    </Box>
                                                )}

                                                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                                                    {/* Service Icon */}
                                                    <Box sx={{ mb: 3 }}>
                                                        <Avatar
                                                            className="service-icon"
                                                            sx={{
                                                                width: 64,
                                                                height: 64,
                                                                bgcolor: 'grey.100',
                                                                color: categoryData.color,
                                                                transition: 'all 0.3s ease',
                                                                fontSize: '2rem'
                                                            }}
                                                        >
                                                            {service.featured_image ? (
                                                                <img
                                                                    src={service.featured_image}
                                                                    alt={service.name}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                React.cloneElement(categoryData.icon, { sx: { fontSize: 'inherit' } })
                                                            )}
                                                        </Avatar>
                                                    </Box>

                                                    {/* Category Tag */}
                                                    <Chip
                                                        label={categoryData.label}
                                                        size="small"
                                                        sx={{
                                                            mb: 2,
                                                            bgcolor: `${categoryData.color}15`,
                                                            color: categoryData.color,
                                                            fontWeight: 'medium',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    />

                                                    {/* Service Title */}
                                                    <Typography
                                                        variant="h5"
                                                        sx={{
                                                            fontWeight: 600,
                                                            mb: 2,
                                                            lineHeight: 1.3,
                                                            color: 'text.primary'
                                                        }}
                                                    >
                                                        {service.name}
                                                    </Typography>

                                                    {/* Service Description */}
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: 'text.secondary',
                                                            mb: 3,
                                                            lineHeight: 1.6
                                                        }}
                                                    >
                                                        {service.short_description}
                                                    </Typography>

                                                    {/* Features List */}
                                                    {service.features && service.features.length > 0 && (
                                                        <Box sx={{ mb: 3 }}>
                                                            <Stack spacing={1}>
                                                                {service.features.slice(0, 3).map((feature, idx) => (
                                                                    <Box
                                                                        key={idx}
                                                                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                                                    >
                                                                        <CheckCircle
                                                                            sx={{
                                                                                fontSize: 16,
                                                                                color: categoryData.color
                                                                            }}
                                                                        />
                                                                        <Typography
                                                                            variant="body2"
                                                                            sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
                                                                        >
                                                                            {feature}
                                                                        </Typography>
                                                                    </Box>
                                                                ))}
                                                                {service.features.length > 3 && (
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                                                                    >
                                                                        +{service.features.length - 3} more features
                                                                    </Typography>
                                                                )}
                                                            </Stack>
                                                        </Box>
                                                    )}

                                                    {/* Technologies */}
                                                    {service.technologies && service.technologies.length > 0 && (
                                                        <Box sx={{ mb: 3 }}>
                                                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                                                {service.technologies.slice(0, 4).map((tech, idx) => (
                                                                    <Chip
                                                                        key={idx}
                                                                        label={tech}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        sx={{
                                                                            fontSize: '0.7rem',
                                                                            height: 24,
                                                                            mb: 0.5,
                                                                            borderColor: 'grey.300',
                                                                            color: 'text.secondary'
                                                                        }}
                                                                    />
                                                                ))}
                                                                {service.technologies.length > 4 && (
                                                                    <Chip
                                                                        label={`+${service.technologies.length - 4}`}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        sx={{
                                                                            fontSize: '0.7rem',
                                                                            height: 24,
                                                                            mb: 0.5,
                                                                            borderColor: 'grey.300',
                                                                            color: 'text.secondary'
                                                                        }}
                                                                    />
                                                                )}
                                                            </Stack>
                                                        </Box>
                                                    )}

                                                    {/* Pricing Info */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                        {service.starting_price && (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <AttachMoney sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                                <Typography variant="body2" color="text.secondary">
                                                                    From ${service.starting_price}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                        {service.estimated_timeline && (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {service.estimated_timeline}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </CardContent>

                                                <CardActions sx={{ p: 4, pt: 0 }}>
                                                    <Button
                                                        className="learn-more-btn"
                                                        fullWidth
                                                        variant="outlined"
                                                        endIcon={<ArrowForward />}
                                                        sx={{
                                                            borderColor: 'grey.300',
                                                            color: 'text.primary',
                                                            fontWeight: 'medium',
                                                            py: 1.5,
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                borderColor: 'transparent'
                                                            }
                                                        }}
                                                    >
                                                        Learn More
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </motion.div>
                                    </Grid>
                                )
                            })
                        ) : (
                            // Empty state
                            <Grid item xs={12}>
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        No services found
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        Try adjusting your search terms or filters
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            setSearchTerm('')
                                            setFilterCategory('all')
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </Container>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-black text-white">
                <Container maxWidth="md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <Typography variant="h3" className="font-light mb-6">
                            Ready to start your project?
                        </Typography>
                        <Typography variant="h6" className="text-gray-400 font-light mb-8">
                            Let's discuss how we can bring your vision to life.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
                            <Button
                                component={Link}
                                to="/contact"
                                variant="contained"
                                size="large"
                                className="bg-white hover:bg-gray-100 text-black rounded-none px-8 py-3 font-light tracking-wide normal-case"
                            >
                                Get Started Today
                            </Button>
                            <Button
                                component={Link}
                                to="/projects"
                                variant="outlined"
                                size="large"
                                className="border-white text-white hover:bg-white hover:text-black rounded-none px-8 py-3 font-light tracking-wide normal-case"
                            >
                                View Our Work
                            </Button>
                        </Stack>
                    </motion.div>
                </Container>
            </section>
        </>
    )
}

export default Services