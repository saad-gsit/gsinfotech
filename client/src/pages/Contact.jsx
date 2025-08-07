import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
    Container,
    Typography,
    Box,
    Grid,
    Stack,
    Paper,
    Divider,
    Alert,
    Chip,
    IconButton,
    Card
} from '@mui/material'
import {
    EmailOutlined,
    PhoneOutlined,
    LocationOnOutlined,
    AccessTimeOutlined,
    ArrowOutward,
    CheckCircle,
    ContactSupportOutlined,
    BusinessOutlined,
    SupportAgentOutlined,
    ScheduleOutlined,
    LinkedIn,
    Twitter,
    Instagram,
    YouTube
} from '@mui/icons-material'
import { useState } from 'react'
import ContactForm from '@/components/Forms/ContactForm'
import { Link } from 'react-router-dom'

const Contact = () => {
    const [formStatus, setFormStatus] = useState(null) // 'success' | 'error' | null

    const contactInfo = [
        {
            icon: <EmailOutlined />,
            title: 'Email',
            primary: 'hello@gsinfotech.com',
            secondary: 'We\'ll respond within 24 hours',
            action: 'mailto:hello@gsinfotech.com'
        },
        {
            icon: <PhoneOutlined />,
            title: 'Phone',
            primary: '+1 (555) 123-4567',
            secondary: 'Monday to Friday, 9AM-6PM EST',
            action: 'tel:+15551234567'
        },
        {
            icon: <LocationOnOutlined />,
            title: 'Office',
            primary: '123 Tech Street, Digital City',
            secondary: 'Visit us at our headquarters',
            action: 'https://maps.google.com/?q=123+Tech+Street+Digital+City'
        }
    ]

    const socialLinks = [
        { platform: 'LinkedIn', icon: <LinkedIn />, url: '#', color: 'var(--sage-400)' },
        { platform: 'Twitter', icon: <Twitter />, url: '#', color: 'var(--coral-400)' },
        { platform: 'Instagram', icon: <Instagram />, url: '#', color: 'var(--sand-600)' },
        { platform: 'YouTube', icon: <YouTube />, url: '#', color: 'var(--stone-600)' }
    ]

    const handleFormSuccess = () => {
        setFormStatus('success')
        setTimeout(() => setFormStatus(null), 5000)
    }

    const handleFormError = () => {
        setFormStatus('error')
        setTimeout(() => setFormStatus(null), 5000)
    }

    return (
        <>
            <Helmet>
                <title>Contact - GS Infotech | Get In Touch</title>
                <meta name="description" content="Ready to start your project? Get in touch with our team to discuss how we can help transform your ideas into reality." />
            </Helmet>

            {/* Hero Section - Center Aligned */}
            <section
                style={{
                    paddingTop: '8rem',
                    paddingBottom: '4rem',
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
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, var(--sage-400) 0%, transparent 70%)',
                        opacity: 0.15,
                        filter: 'blur(30px)',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: '30%',
                        left: '5%',
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, var(--coral-400) 0%, transparent 70%)',
                        opacity: 0.1,
                        filter: 'blur(25px)',
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
                                icon={<ContactSupportOutlined sx={{ fontSize: 16 }} />}
                                label="CONTACT US"
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
                                Let's start a
                                <br />
                                <span style={{ fontWeight: 600, color: 'var(--sage-600)' }}>conversation</span>
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
                                Have a project in mind? We'd love to hear about it.
                                Take a few minutes to share your vision and we'll be in touch soon.
                            </Typography>
                        </motion.div>
                    </Box>
                </Container>
            </section>

            {/* Success/Error Messages - Center Aligned */}
            {formStatus && (
                <Container maxWidth="lg" sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            style={{ width: '100%', maxWidth: '600px' }}
                        >
                            {formStatus === 'success' && (
                                <Alert
                                    severity="success"
                                    icon={<CheckCircle />}
                                    onClose={() => setFormStatus(null)}
                                    sx={{
                                        borderRadius: '16px',
                                        backgroundColor: 'var(--sage-50)',
                                        color: 'var(--sage-600)',
                                        border: '1px solid var(--sage-200)',
                                        '& .MuiAlert-icon': {
                                            color: 'var(--sage-400)',
                                        }
                                    }}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                                        Message sent successfully!
                                    </Typography>
                                    <Typography variant="body2">
                                        Thank you for reaching out. We'll get back to you within 24 hours.
                                    </Typography>
                                </Alert>
                            )}

                            {formStatus === 'error' && (
                                <Alert
                                    severity="error"
                                    onClose={() => setFormStatus(null)}
                                    sx={{
                                        borderRadius: '16px',
                                        backgroundColor: 'var(--coral-50)',
                                        color: 'var(--coral-600)',
                                        border: '1px solid var(--coral-200)',
                                    }}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                                        Failed to send message
                                    </Typography>
                                    <Typography variant="body2">
                                        Something went wrong. Please try again or contact us directly.
                                    </Typography>
                                </Alert>
                            )}
                        </motion.div>
                    </Box>
                </Container>
            )}

            {/* Contact Content - Single Column Layout */}
            <section style={{ padding: '4rem 0', backgroundColor: 'white' }}>
                <Container maxWidth="md">
                    {/* Get in Touch Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{ textAlign: 'center', marginBottom: '4rem' }}
                    >
                        <Typography
                            variant="h2"
                            sx={{
                                fontSize: { xs: '2rem', md: '2.5rem' },
                                fontWeight: 300,
                                mb: 2,
                                color: 'var(--stone-800)',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Get in touch
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'var(--stone-600)',
                                mb: 6,
                                lineHeight: 1.6,
                                maxWidth: '600px',
                                mx: 'auto'
                            }}
                        >
                            Ready to bring your vision to life? We're here to help you
                            navigate your digital transformation journey.
                        </Typography>

                        {/* Contact Info Cards - Horizontal Layout */}
                        <Grid container spacing={3} justifyContent="center" sx={{ mb: 6 }}>
                            {contactInfo.map((info, index) => (
                                <Grid item xs={12} sm={4} key={index}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                    >
                                        <Card
                                            component={info.action ? 'a' : 'div'}
                                            href={info.action}
                                            target={info.action?.startsWith('http') ? '_blank' : undefined}
                                            sx={{
                                                p: 3,
                                                border: '1px solid var(--stone-100)',
                                                borderRadius: '20px',
                                                backgroundColor: 'white',
                                                boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.08)',
                                                transition: 'all 0.4s ease',
                                                cursor: info.action ? 'pointer' : 'default',
                                                textDecoration: 'none',
                                                display: 'block',
                                                textAlign: 'center',
                                                height: '100%',
                                                '&:hover': info.action ? {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: '0 12px 30px -8px rgba(0, 0, 0, 0.15)',
                                                    borderColor: 'var(--sage-200)',
                                                } : {}
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    backgroundColor: 'var(--sage-50)',
                                                    color: 'var(--sage-600)',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mx: 'auto',
                                                    mb: 2
                                                }}
                                            >
                                                {info.icon}
                                            </Box>
                                            <Typography
                                                variant="overline"
                                                sx={{
                                                    color: 'var(--stone-500)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    letterSpacing: '0.1em',
                                                    display: 'block',
                                                    mb: 1
                                                }}
                                            >
                                                {info.title}
                                            </Typography>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    color: 'var(--stone-800)',
                                                    fontWeight: 500,
                                                    mb: 1,
                                                    fontSize: '1rem',
                                                }}
                                            >
                                                {info.primary}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: 'var(--stone-600)',
                                                    fontSize: '0.8rem',
                                                }}
                                            >
                                                {info.secondary}
                                            </Typography>
                                            {info.action && (
                                                <ArrowOutward
                                                    sx={{
                                                        color: 'var(--sage-400)',
                                                        fontSize: 16,
                                                        opacity: 0.6,
                                                        mt: 1
                                                    }}
                                                />
                                            )}
                                        </Card>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>
                    </motion.div>

                    {/* Contact Form Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        style={{ marginBottom: '4rem' }}
                    >
                        <Card
                            sx={{
                                p: { xs: 4, md: 6 },
                                border: '1px solid var(--stone-100)',
                                borderRadius: '24px',
                                backgroundColor: 'white',
                                boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.1)',
                                position: 'relative',
                                overflow: 'hidden',
                                maxWidth: '600px',
                                mx: 'auto'
                            }}
                        >
                            {/* Subtle background decoration */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: 200,
                                    height: 200,
                                    background: 'radial-gradient(circle, var(--sage-50) 0%, transparent 70%)',
                                    borderRadius: '50%',
                                    transform: 'translate(50%, -50%)',
                                }}
                            />

                            <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontSize: { xs: '1.75rem', md: '2.25rem' },
                                        fontWeight: 300,
                                        mb: 2,
                                        color: 'var(--stone-800)',
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    Send us a message
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: 'var(--stone-600)',
                                        mb: 4,
                                        lineHeight: 1.6
                                    }}
                                >
                                    Fill out the form below and we'll get back to you as soon as possible.
                                </Typography>

                                <ContactForm
                                    onSuccess={handleFormSuccess}
                                    onError={handleFormError}
                                />
                            </Box>
                        </Card>
                    </motion.div>

                    {/* Office Hours Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        style={{ marginBottom: '4rem' }}
                    >
                        <Card
                            sx={{
                                p: 4,
                                border: '1px solid var(--stone-100)',
                                borderRadius: '20px',
                                backgroundColor: 'white',
                                boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.08)',
                                textAlign: 'center',
                                maxWidth: '500px',
                                mx: 'auto'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        backgroundColor: 'var(--sand-50)',
                                        color: 'var(--sand-600)',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <ScheduleOutlined sx={{ fontSize: 20 }} />
                                </Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: 'var(--stone-800)',
                                        fontWeight: 500,
                                    }}
                                >
                                    Office Hours
                                </Typography>
                            </Box>

                            <Stack spacing={1} alignItems="center">
                                <Typography variant="body2" sx={{ color: 'var(--stone-700)', fontWeight: 500 }}>
                                    Monday - Friday: 9:00 AM - 6:00 PM EST
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'var(--stone-500)' }}>
                                    Saturday - Sunday: Closed
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'var(--stone-500)' }}>
                                    Emergency support available 24/7 for existing clients
                                </Typography>
                            </Stack>
                        </Card>
                    </motion.div>

                    {/* Social Links Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        style={{ marginBottom: '4rem' }}
                    >
                        <Card
                            sx={{
                                p: 4,
                                border: '1px solid var(--stone-100)',
                                borderRadius: '20px',
                                backgroundColor: 'white',
                                boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.08)',
                                textAlign: 'center',
                                maxWidth: '400px',
                                mx: 'auto'
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'var(--stone-800)',
                                    fontWeight: 500,
                                    mb: 3,
                                }}
                            >
                                Follow Us
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                                {socialLinks.map((social, index) => (
                                    <IconButton
                                        key={social.platform}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                            width: 44,
                                            height: 44,
                                            backgroundColor: 'var(--stone-50)',
                                            color: 'var(--stone-600)',
                                            borderRadius: '12px',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                backgroundColor: social.color,
                                                color: 'white',
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 8px 20px -6px ${social.color}40`,
                                            }
                                        }}
                                        title={`Follow us on ${social.platform}`}
                                    >
                                        {social.icon}
                                    </IconButton>
                                ))}
                            </Box>
                        </Card>
                    </motion.div>

                    {/* Quick Response Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.0 }}
                    >
                        <Card
                            sx={{
                                p: 4,
                                background: 'linear-gradient(135deg, var(--stone-800) 0%, var(--stone-900) 100%)',
                                color: 'white',
                                borderRadius: '20px',
                                border: 'none',
                                position: 'relative',
                                overflow: 'hidden',
                                textAlign: 'center',
                                maxWidth: '500px',
                                mx: 'auto'
                            }}
                        >
                            {/* Background Pattern */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: -20,
                                    right: -20,
                                    width: 100,
                                    height: 100,
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle, var(--sage-400) 0%, transparent 70%)',
                                    opacity: 0.1,
                                }}
                            />
                            <Box sx={{ position: 'relative', zIndex: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                                    <SupportAgentOutlined sx={{ color: 'var(--sage-300)' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                        Need urgent help?
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        mb: 3,
                                        lineHeight: 1.6
                                    }}
                                >
                                    For urgent inquiries or existing client support,
                                    please call us directly for immediate assistance.
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        Priority Support
                                    </Typography>
                                    <ArrowOutward sx={{ fontSize: 18 }} />
                                </Box>
                            </Box>
                        </Card>
                    </motion.div>
                </Container>
            </section>

            {/* Enhanced Map/Location Section - Center Aligned */}
            <section
                style={{
                    padding: '6rem 0',
                    background: 'linear-gradient(135deg, var(--sage-50) 0%, var(--sand-50) 100%)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Grid container spacing={6} alignItems="center" sx={{ maxWidth: '1000px' }}>
                            {/* Location Info - Center Aligned */}
                            <Grid item xs={12} md={12}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                    viewport={{ once: true }}
                                    style={{ textAlign: 'center' }}
                                >
                                    <Chip
                                        icon={<BusinessOutlined sx={{ fontSize: 16 }} />}
                                        label="OUR OFFICE"
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
                                        variant="h3"
                                        sx={{
                                            fontSize: { xs: '2rem', md: '2.5rem' },
                                            fontWeight: 300,
                                            mb: 2,
                                            color: 'var(--stone-800)',
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        Visit our headquarters
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: 'var(--stone-600)',
                                            mb: 4,
                                            lineHeight: 1.6,
                                            maxWidth: '600px',
                                            mx: 'auto'
                                        }}
                                    >
                                        Located in the heart of Digital City, our modern workspace reflects
                                        our commitment to innovation and collaboration. Drop by for a coffee
                                        and let's discuss your next project.
                                    </Typography>

                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <Card
                                            sx={{
                                                p: 4,
                                                backgroundColor: 'white',
                                                borderRadius: '16px',
                                                border: '1px solid var(--stone-100)',
                                                boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.08)',
                                                maxWidth: '400px',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                                <LocationOnOutlined
                                                    sx={{
                                                        color: 'var(--sage-400)',
                                                        fontSize: 32
                                                    }}
                                                />
                                                <Box>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            color: 'var(--stone-800)',
                                                            fontWeight: 500,
                                                            mb: 1
                                                        }}
                                                    >
                                                        123 Tech Street, Digital City
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ color: 'var(--stone-600)' }}
                                                    >
                                                        Suite 400, Innovation District
                                                        <br />
                                                        Open Monday - Friday, 9AM - 6PM EST
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Card>
                                    </Box>
                                </motion.div>
                            </Grid>
                        </Grid>
                    </Box>
                </Container>
            </section>

            {/* Call to Action Section - Center Aligned with Single Row Stats */}
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
                        style={{ textAlign: 'center' }}
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
                            Ready to get started?
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
                            Join hundreds of satisfied clients who have transformed their digital presence with our expertise.
                            Let's discuss how we can help you achieve your goals.
                        </Typography>

                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={3}
                            justifyContent="center"
                            sx={{ mb: 8 }}
                        >
                            <Link to="/projects" style={{ textDecoration: 'none' }}>
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        backgroundColor: 'white',
                                        color: 'var(--stone-800)',
                                        border: 'none',
                                        borderRadius: '50px',
                                        padding: '16px 32px',
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        letterSpacing: '0.025em',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: '0 8px 25px -8px rgba(255, 255, 255, 0.3)',
                                        transition: 'all 0.4s ease',
                                    }}
                                >
                                    View Our Work
                                    <ArrowOutward sx={{ fontSize: 18 }} />
                                </motion.button>
                            </Link>
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    backgroundColor: 'transparent',
                                    color: 'white',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    borderRadius: '50px',
                                    padding: '14px 32px',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    letterSpacing: '0.025em',
                                    cursor: 'pointer',
                                    transition: 'all 0.4s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.borderColor = 'white'
                                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                                    e.target.style.backgroundColor = 'transparent'
                                }}
                                onClick={() => document.querySelector('form').scrollIntoView({ behavior: 'smooth' })}
                            >
                                Start Your Project
                            </motion.button>
                        </Stack>

                        {/* Trust indicators - Single Row */}
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Grid container spacing={3} justifyContent="center" sx={{ maxWidth: '800px' }}>
                                {[
                                    { number: '500+', label: 'Projects Completed' },
                                    { number: '98%', label: 'Client Satisfaction' },
                                    { number: '24h', label: 'Response Time' },
                                    { number: '5★', label: 'Average Rating' }
                                ].map((stat, index) => (
                                    <Grid item xs={6} sm={3} md={3} key={index}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: index * 0.1 }}
                                            viewport={{ once: true }}
                                            style={{ textAlign: 'center' }}
                                        >
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
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                {stat.label}
                                            </Typography>
                                        </motion.div>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </motion.div>
                </Container>
            </section>
        </>
    )
}

export default Contact