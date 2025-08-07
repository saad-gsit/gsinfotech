import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import React from 'react'
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Button,
    Chip,
    Avatar,
    Stack,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Breadcrumbs,
    Alert,
    Skeleton,
    Paper
} from '@mui/material'
import {
    ArrowBack,
    CheckCircle,
    AttachMoney,
    Schedule,
    Star,
    Code,
    PhoneAndroid,
    Computer,
    Palette,
    Engineering,
    Timeline,
    ContactSupport,
    Launch,
    NavigateNext
} from '@mui/icons-material'
import { servicesAPI } from '../services/servicesAPI'
import ServiceCard from '../components/Cards/ServiceCard'

const ServiceDetail = () => {
    const { slug } = useParams()
    const navigate = useNavigate()
    const [service, setService] = useState(null)
    const [relatedServices, setRelatedServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const serviceCategories = {
        'web_development': { label: 'Web Development', icon: <Code />, color: '#2196F3' },
        'mobile_development': { label: 'Mobile Development', icon: <PhoneAndroid />, color: '#4CAF50' },
        'custom_software': { label: 'Custom Software', icon: <Computer />, color: '#FF9800' },
        'ui_ux_design': { label: 'UI/UX Design', icon: <Palette />, color: '#E91E63' },
        'enterprise_solutions': { label: 'Enterprise Solutions', icon: <Engineering />, color: '#9C27B0' }
    }

    useEffect(() => {
        if (slug) {
            loadService()
        }
    }, [slug])

    const loadService = async () => {
        try {
            setLoading(true)
            const response = await servicesAPI.getServiceById(slug)

            let serviceData = null
            if (response.data) {
                serviceData = response.data
            } else if (response.service) {
                serviceData = response.service
            } else {
                serviceData = response
            }

            if (!serviceData) {
                setError('Service not found')
                return
            }

            setService(serviceData)

            // Load related services from the same category
            if (serviceData.category) {
                loadRelatedServices(serviceData.category, serviceData.id)
            }
        } catch (error) {
            console.error('Error loading service:', error)
            if (error.response?.status === 404) {
                setError('Service not found')
            } else {
                setError('Failed to load service. Please try again later.')
            }
        } finally {
            setLoading(false)
        }
    }

    const loadRelatedServices = async (category, excludeId) => {
        try {
            const response = await servicesAPI.getServicesByCategory(category, {
                active: true,
                limit: 3
            })

            let servicesData = []
            if (Array.isArray(response)) {
                servicesData = response
            } else if (response.data && Array.isArray(response.data)) {
                servicesData = response.data
            }

            // Filter out current service
            const filtered = servicesData.filter(s => s.id !== excludeId)
            setRelatedServices(filtered)
        } catch (error) {
            console.error('Error loading related services:', error)
        }
    }

    const getCategoryData = (category) => {
        return serviceCategories[category] || {
            label: category,
            icon: <Code />,
            color: '#666'
        }
    }

    const handleContactClick = () => {
        navigate('/contact', {
            state: {
                service: service.name,
                subject: `Inquiry about ${service.name}`
            }
        })
    }

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Breadcrumb Skeleton */}
                <Skeleton variant="text" width={300} height={24} sx={{ mb: 4 }} />

                {/* Hero Section Skeleton */}
                <Grid container spacing={4} sx={{ mb: 6 }}>
                    <Grid item xs={12} md={8}>
                        <Skeleton variant="rectangular" width={80} height={32} sx={{ mb: 2 }} />
                        <Skeleton variant="text" width="80%" height={48} sx={{ mb: 2 }} />
                        <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
                        <Skeleton variant="text" width="60%" height={24} sx={{ mb: 3 }} />
                        <Skeleton variant="rectangular" width={200} height={40} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto' }} />
                    </Grid>
                </Grid>

                {/* Content Skeleton */}
                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        <Skeleton variant="rectangular" height={300} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Skeleton variant="rectangular" height={300} />
                    </Grid>
                </Grid>
            </Container>
        )
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/services')}
                    sx={{ mr: 2 }}
                >
                    Back to Services
                </Button>
                <Button variant="contained" onClick={loadService}>
                    Try Again
                </Button>
            </Container>
        )
    }

    if (!service) {
        return null
    }

    const categoryData = getCategoryData(service.category)

    return (
        <>
            <Helmet>
                <title>{service.seo_title || service.name} - GS Infotech</title>
                <meta name="description" content={service.seo_description || service.short_description} />
                <meta name="keywords" content={service.seo_keywords?.join(', ') || ''} />

                {/* Open Graph */}
                <meta property="og:title" content={service.name} />
                <meta property="og:description" content={service.short_description} />
                {service.og_image && <meta property="og:image" content={service.og_image} />}
                <meta property="og:type" content="service" />
            </Helmet>

            {/* Breadcrumbs */}
            <Container maxWidth="lg" sx={{ pt: 4, pb: 2 }}>
                <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                    <Link
                        to="/"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Home
                        </Typography>
                    </Link>
                    <Link
                        to="/services"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Services
                        </Typography>
                    </Link>
                    <Typography variant="body2" color="primary">
                        {service.name}
                    </Typography>
                </Breadcrumbs>
            </Container>

            {/* Hero Section */}
            <section className="py-12 bg-white">
                <Container maxWidth="lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Grid container spacing={6} alignItems="center">
                            <Grid item xs={12} md={8}>
                                {/* Category and Featured Badge */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Chip
                                        label={categoryData.label}
                                        sx={{
                                            bgcolor: `${categoryData.color}15`,
                                            color: categoryData.color,
                                            fontWeight: 'medium'
                                        }}
                                    />
                                    {service.is_featured && (
                                        <Chip
                                            icon={<Star />}
                                            label="Featured Service"
                                            sx={{
                                                bgcolor: '#FFD700',
                                                color: 'black',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    )}
                                </Box>

                                <Typography
                                    variant="h1"
                                    className="text-4xl md:text-5xl lg:text-6xl font-light mb-4 leading-tight"
                                >
                                    {service.name}
                                </Typography>

                                <Typography
                                    variant="h5"
                                    className="text-gray-600 font-light mb-6 leading-relaxed"
                                >
                                    {service.short_description}
                                </Typography>

                                {/* Pricing and Timeline */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 6 }}>
                                    {service.starting_price && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AttachMoney sx={{ color: 'primary.main' }} />
                                            <Typography variant="h6" color="primary">
                                                Starting from ${service.starting_price}
                                            </Typography>
                                        </Box>
                                    )}
                                    {service.estimated_timeline && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Schedule sx={{ color: 'text.secondary' }} />
                                            <Typography variant="body1" color="text.secondary">
                                                {service.estimated_timeline}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={handleContactClick}
                                        startIcon={<ContactSupport />}
                                        sx={{
                                            bgcolor: 'black',
                                            color: 'white',
                                            px: 4,
                                            py: 2,
                                            '&:hover': {
                                                bgcolor: 'grey.800'
                                            }
                                        }}
                                    >
                                        Get Started
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        startIcon={<ArrowBack />}
                                        onClick={() => navigate('/services')}
                                        sx={{ px: 4, py: 2 }}
                                    >
                                        All Services
                                    </Button>
                                </Stack>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Avatar
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            bgcolor: `${categoryData.color}15`,
                                            color: categoryData.color,
                                            fontSize: '3rem',
                                            mx: 'auto',
                                            mb: 2
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
                            </Grid>
                        </Grid>
                    </motion.div>
                </Container>
            </section>

            {/* Main Content */}
            <section className="py-16 bg-gray-50">
                <Container maxWidth="lg">
                    <Grid container spacing={6}>
                        {/* Service Details */}
                        <Grid item xs={12} md={8}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                            >
                                <Card sx={{ p: 4, mb: 4 }}>
                                    <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                                        Service Overview
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            lineHeight: 1.8,
                                            color: 'text.secondary',
                                            whiteSpace: 'pre-line'
                                        }}
                                    >
                                        {service.description}
                                    </Typography>
                                </Card>

                                {/* Features */}
                                {service.features && service.features.length > 0 && (
                                    <Card sx={{ p: 4, mb: 4 }}>
                                        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                                            Key Features
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {service.features.map((feature, index) => (
                                                <Grid item xs={12} sm={6} key={index}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                        <CheckCircle sx={{ color: categoryData.color, fontSize: 20 }} />
                                                        <Typography variant="body1">
                                                            {feature}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Card>
                                )}

                                {/* Process Steps */}
                                {service.process_steps && service.process_steps.length > 0 && (
                                    <Card sx={{ p: 4, mb: 4 }}>
                                        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                                            Our Process
                                        </Typography>
                                        <List>
                                            {service.process_steps.map((step, index) => (
                                                <ListItem key={index} sx={{ px: 0 }}>
                                                    <ListItemIcon>
                                                        <Box
                                                            sx={{
                                                                width: 32,
                                                                height: 32,
                                                                borderRadius: '50%',
                                                                bgcolor: categoryData.color,
                                                                color: 'white',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            {step.step || index + 1}
                                                        </Box>
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={step.title || step.name || `Step ${index + 1}`}
                                                        secondary={step.description}
                                                        sx={{ ml: 2 }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Card>
                                )}

                                {/* Technologies */}
                                {service.technologies && service.technologies.length > 0 && (
                                    <Card sx={{ p: 4 }}>
                                        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                                            Technologies We Use
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            {service.technologies.map((tech, index) => (
                                                <Chip
                                                    key={index}
                                                    label={tech}
                                                    variant="outlined"
                                                    sx={{
                                                        mb: 1,
                                                        borderColor: categoryData.color,
                                                        color: categoryData.color,
                                                        '&:hover': {
                                                            bgcolor: `${categoryData.color}15`
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    </Card>
                                )}
                            </motion.div>
                        </Grid>

                        {/* Sidebar */}
                        <Grid item xs={12} md={4}>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                            >
                                {/* Service Info Card */}
                                <Card sx={{ p: 4, mb: 4, textAlign: 'center' }}>
                                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                                        Ready to Get Started?
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        Let's discuss your project and how we can help bring your vision to life.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        onClick={handleContactClick}
                                        sx={{
                                            bgcolor: categoryData.color,
                                            mb: 2,
                                            '&:hover': {
                                                bgcolor: categoryData.color,
                                                filter: 'brightness(0.9)'
                                            }
                                        }}
                                    >
                                        Request Quote
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        component={Link}
                                        to="/contact"
                                    >
                                        Schedule Call
                                    </Button>
                                </Card>

                                {/* Service Details */}
                                <Card sx={{ p: 4 }}>
                                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                        Service Details
                                    </Typography>
                                    <Stack spacing={2}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Category
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {categoryData.label}
                                            </Typography>
                                        </Box>
                                        {service.pricing_model && (
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Pricing Model
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {service.pricing_model.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </Typography>
                                            </Box>
                                        )}
                                        {service.starting_price && (
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Starting Price
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    ${service.starting_price} {service.price_currency}
                                                </Typography>
                                            </Box>
                                        )}
                                        {service.estimated_timeline && (
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Timeline
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {service.estimated_timeline}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </Card>
                            </motion.div>
                        </Grid>
                    </Grid>
                </Container>
            </section>

            {/* Related Services */}
            {relatedServices.length > 0 && (
                <section className="py-16 bg-white">
                    <Container maxWidth="lg">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <Typography variant="h3" sx={{ mb: 6, fontWeight: 300, textAlign: 'center' }}>
                                Related Services
                            </Typography>
                            <Grid container spacing={4}>
                                {relatedServices.map((relatedService, index) => (
                                    <Grid item xs={12} md={4} key={relatedService.id}>
                                        <ServiceCard
                                            service={relatedService}
                                            index={index}
                                            compact={true}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </motion.div>
                    </Container>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-16 bg-black text-white">
                <Container maxWidth="md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <Typography variant="h3" className="font-light mb-4">
                            Ready to discuss your project?
                        </Typography>
                        <Typography variant="h6" className="text-gray-400 font-light mb-8">
                            Let's turn your vision into reality.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleContactClick}
                            sx={{
                                bgcolor: 'white',
                                color: 'black',
                                px: 6,
                                py: 2,
                                fontWeight: 500,
                                '&:hover': {
                                    bgcolor: 'grey.100'
                                }
                            }}
                        >
                            Start Your Project Today
                        </Button>
                    </motion.div>
                </Container>
            </section>
        </>
    )
}

export default ServiceDetail