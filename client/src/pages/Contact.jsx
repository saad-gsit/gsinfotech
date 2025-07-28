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
    Alert
} from '@mui/material'
import {
    EmailOutlined,
    PhoneOutlined,
    LocationOnOutlined,
    AccessTimeOutlined,
    ArrowForward,
    CheckCircle
} from '@mui/icons-material'
import { useState } from 'react'
import ContactForm from '@/components/Forms/ContactForm'

const Contact = () => {
    const [formStatus, setFormStatus] = useState(null) // 'success' | 'error' | null

    const contactInfo = [
        {
            icon: <EmailOutlined />,
            title: 'Email',
            primary: 'hello@gsinfotech.com',
            secondary: 'We\'ll respond within 24 hours'
        },
        {
            icon: <PhoneOutlined />,
            title: 'Phone',
            primary: '+1 (555) 123-4567',
            secondary: 'Monday to Friday, 9AM-6PM EST'
        },
        {
            icon: <LocationOnOutlined />,
            title: 'Office',
            primary: '123 Tech Street, Digital City',
            secondary: 'Visit us at our headquarters'
        }
    ]

    const handleFormSuccess = () => {
        setFormStatus('success')
        // Auto-hide success message after 5 seconds
        setTimeout(() => setFormStatus(null), 5000)
    }

    const handleFormError = () => {
        setFormStatus('error')
        // Auto-hide error message after 5 seconds
        setTimeout(() => setFormStatus(null), 5000)
    }

    return (
        <>
            <Helmet>
                <title>Contact - GS Infotech | Get In Touch</title>
                <meta name="description" content="Ready to start your project? Get in touch with our team to discuss how we can help transform your ideas into reality." />
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
                            CONTACT US
                        </Typography>
                        <Typography variant="h1" className="text-5xl md:text-6xl lg:text-7xl font-light mb-6 leading-tight">
                            Let's start a
                            <br />
                            <span className="font-semibold">conversation</span>
                        </Typography>
                        <Typography variant="h5" className="text-gray-600 font-light max-w-3xl">
                            Have a project in mind? We'd love to hear about it.
                            Take a few minutes to fill out the form and we'll be in touch.
                        </Typography>
                    </motion.div>
                </Container>
            </section>

            {/* Success/Error Messages */}
            {formStatus && (
                <Container maxWidth="lg" className="mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        {formStatus === 'success' && (
                            <Alert
                                severity="success"
                                icon={<CheckCircle />}
                                className="mb-4"
                                onClose={() => setFormStatus(null)}
                            >
                                <Typography variant="h6" className="font-medium mb-1">
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
                                className="mb-4"
                                onClose={() => setFormStatus(null)}
                            >
                                <Typography variant="h6" className="font-medium mb-1">
                                    Failed to send message
                                </Typography>
                                <Typography variant="body2">
                                    Something went wrong. Please try again or contact us directly.
                                </Typography>
                            </Alert>
                        )}
                    </motion.div>
                </Container>
            )}

            {/* Contact Content */}
            <section className="py-16 bg-gray-50">
                <Container maxWidth="lg">
                    <Grid container spacing={8}>
                        {/* Contact Information */}
                        <Grid item xs={12} lg={4}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <Typography variant="h4" className="font-light mb-8">
                                    Get in touch
                                </Typography>

                                <Stack spacing={4} className="mb-8">
                                    {contactInfo.map((info, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                        >
                                            <Box className="flex items-start gap-4">
                                                <Box className="w-12 h-12 bg-black text-white rounded-none flex items-center justify-center flex-shrink-0">
                                                    {info.icon}
                                                </Box>
                                                <Box>
                                                    <Typography variant="overline" className="text-gray-500 text-xs">
                                                        {info.title}
                                                    </Typography>
                                                    <Typography variant="body1" className="font-medium text-black mb-1">
                                                        {info.primary}
                                                    </Typography>
                                                    <Typography variant="caption" className="text-gray-600">
                                                        {info.secondary}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </motion.div>
                                    ))}
                                </Stack>

                                <Divider className="my-8" />

                                {/* Office Hours */}
                                <Box>
                                    <Typography variant="h6" className="font-light mb-4">
                                        Office Hours
                                    </Typography>
                                    <Stack spacing={2}>
                                        <Box className="flex items-center gap-2 text-gray-600">
                                            <AccessTimeOutlined fontSize="small" />
                                            <Typography variant="body2">
                                                Monday - Friday: 9:00 AM - 6:00 PM
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" className="text-gray-600 ml-8">
                                            Saturday - Sunday: Closed
                                        </Typography>
                                    </Stack>
                                </Box>

                                <Divider className="my-8" />

                                {/* Quick Response */}
                                <Paper
                                    elevation={0}
                                    className="p-6 bg-black text-white"
                                    sx={{ borderRadius: 0 }}
                                >
                                    <Typography variant="h6" className="font-medium mb-2">
                                        Need urgent help?
                                    </Typography>
                                    <Typography variant="body2" className="text-gray-300 mb-4">
                                        For urgent inquiries, please call us directly.
                                    </Typography>
                                    <Box className="flex items-center gap-2">
                                        <Typography variant="body2" className="font-light">
                                            Priority Support
                                        </Typography>
                                        <ArrowForward fontSize="small" />
                                    </Box>
                                </Paper>
                            </motion.div>
                        </Grid>

                        {/* Contact Form */}
                        <Grid item xs={12} lg={8}>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <Paper
                                    elevation={0}
                                    className="p-8 md:p-12 bg-white"
                                    sx={{ borderRadius: 0 }}
                                >
                                    <Typography variant="h4" className="font-light mb-2">
                                        Send us a message
                                    </Typography>
                                    <Typography variant="body1" className="text-gray-600 mb-8">
                                        Fill out the form below and we'll get back to you as soon as possible.
                                    </Typography>

                                    <ContactForm
                                        onSuccess={handleFormSuccess}
                                        onError={handleFormError}
                                    />
                                </Paper>
                            </motion.div>
                        </Grid>
                    </Grid>
                </Container>
            </section>

            {/* Map Section (Optional) */}
            <section className="h-96 bg-gray-200 relative">
                <Box className="absolute inset-0 flex items-center justify-center">
                    <Box className="text-center">
                        <LocationOnOutlined sx={{ fontSize: 48 }} className="text-gray-400 mb-4" />
                        <Typography variant="h6" className="text-gray-600 font-light">
                            123 Tech Street, Digital City
                        </Typography>
                        <Typography variant="body2" className="text-gray-500">
                            Our headquarters location
                        </Typography>
                    </Box>
                </Box>
            </section>
        </>
    )
}

export default Contact