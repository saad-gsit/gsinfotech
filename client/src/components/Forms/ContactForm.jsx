import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion } from 'framer-motion'
import {
    TextField,
    MenuItem,
    Button,
    Grid,
    Box,
    Typography,
    CircularProgress,
    InputAdornment,
    Chip
} from '@mui/material'
import {
    ArrowForward,
    Person,
    Email,
    Business,
    Phone,
    Category,
    Message,
    Send
} from '@mui/icons-material'
import { useAnimation } from '@/hooks/useAnimation'
import { useSubmitContactForm } from '@/hooks/useApi'
import { useToast } from '@/hooks/useToast.js'

// Define validation schema
const validationSchema = yup.object().shape({
    name: yup
        .string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters')
        .matches(/^[a-zA-Z\s\-'.]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),

    email: yup
        .string()
        .required('Email is required')
        .email('Please enter a valid email')
        .max(254, 'Email is too long'),

    company: yup
        .string()
        .optional()
        .max(100, 'Company name is too long'),

    phone: yup
        .string()
        .optional()
        .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),

    service: yup
        .string()
        .required('Please select a service'),

    message: yup
        .string()
        .required('Message is required')
        .min(10, 'Message must be at least 10 characters')
        .max(1000, 'Message must be less than 1000 characters'),
})

const ContactForm = ({ onSuccess, onError }) => {
    const { getVariants } = useAnimation()
    const { showSuccess, showError } = useToast()
    const submitContactMutation = useSubmitContactForm()
    const [focusedField, setFocusedField] = useState(null)
    const isLoading = submitContactMutation.isPending

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm({
        resolver: yupResolver(validationSchema),
    })

    const watchedFields = watch()

    const services = [
        { value: 'Custom Software Development', label: 'Custom Software Development', color: '#6366f1' },
        { value: 'Mobile App Development', label: 'Mobile App Development', color: '#8b5cf6' },
        { value: 'Web Development', label: 'Web Development', color: '#3b82f6' },
        { value: 'UI/UX Design', label: 'UI/UX Design', color: '#ec4899' },
        { value: 'Enterprise Solutions', label: 'Enterprise Solutions', color: '#10b981' },
        { value: 'Consulting', label: 'Consulting', color: '#f59e0b' },
        { value: 'Other', label: 'Other', color: '#6b7280' },
    ]

    const onSubmit = async (data) => {
        try {
            // Map service names to match validation schema
            const serviceMapping = {
                'Custom Software Development': 'custom-software',
                'Mobile App Development': 'mobile-app',
                'Web Development': 'web-development',
                'UI/UX Design': 'ui-ux-design',
                'Enterprise Solutions': 'custom-software',
                'Consulting': 'consulting',
                'Other': 'consulting'
            };

            // Format phone number for validation (if provided)
            let formattedPhone = data.phone;
            if (formattedPhone && formattedPhone.trim()) {
                // Remove any non-digit characters except +
                formattedPhone = formattedPhone.replace(/[^\d+]/g, '');
                // Add + if not present and doesn't start with it
                if (!formattedPhone.startsWith('+')) {
                    formattedPhone = '+1' + formattedPhone.replace(/^\+?1?/, '');
                }
            }

            const submitData = {
                name: data.name.trim(),
                email: data.email.trim(),
                subject: data.service, // Shorter subject to pass title validation (2-200 chars)
                message: data.message.trim(), // Ensure it's at least 10 chars
                serviceType: serviceMapping[data.service] || 'consulting',
            };

            // Only add optional fields if they have values
            if (data.company && data.company.trim()) {
                submitData.company = data.company.trim();
            }

            if (formattedPhone && formattedPhone.length >= 10) {
                submitData.phone = formattedPhone;
            }

            console.log('📤 Submitting contact form with data:', submitData);

            await submitContactMutation.mutateAsync(submitData);

            showSuccess('Thank you! Your message has been sent successfully.')
            reset()

            if (onSuccess) {
                onSuccess()
            }
        } catch (error) {
            console.error('Contact form submission error:', error)

            // Enhanced error logging
            if (error.response?.data) {
                console.error('📋 Server response:', error.response.data);
                if (error.response.data.details) {
                    console.error('📋 Validation errors:', error.response.data.details);
                    // Log each validation error clearly
                    error.response.data.details.forEach(err => {
                        console.error(`❌ Field: ${err.field}, Error: ${err.message}, Value: ${err.value}`);
                    });
                }
            }

            const errorMessage = error?.response?.data?.message || 'Failed to send message. Please try again.'
            showError(errorMessage)

            if (onError) {
                onError()
            }
        }
    }

    const inputAnimation = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    }

    const getFieldStyle = (fieldName) => ({
        '& .MuiInput-underline:before': {
            borderBottomColor: '#e5e7eb',
            borderBottomWidth: 2,
        },
        '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
            borderBottomColor: focusedField === fieldName ? '#6366f1' : '#9ca3af',
        },
        '& .MuiInput-underline:after': {
            borderBottomColor: '#6366f1',
            borderBottomWidth: 2,
        },
        '& .MuiInputLabel-root': {
            color: '#6b7280',
            fontWeight: 500,
            '&.Mui-focused': {
                color: '#6366f1',
            }
        },
        '& .MuiInput-root': {
            fontSize: '1rem',
            color: '#1f2937',
            fontWeight: 400,
        },
        '& .MuiFormHelperText-root': {
            marginTop: '8px',
            fontSize: '0.75rem',
        }
    })

    return (
        <motion.div
            variants={getVariants('fadeInUp')}
            initial="hidden"
            animate="visible"
            className="relative"
        >
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />

            <form onSubmit={handleSubmit(onSubmit)} className="relative space-y-8">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <motion.div
                            custom={0}
                            variants={inputAnimation}
                            initial="hidden"
                            animate="visible"
                        >
                            <TextField
                                {...register('name')}
                                label="Your Name"
                                fullWidth
                                required
                                error={!!errors.name}
                                helperText={errors.name?.message}
                                variant="standard"
                                onFocus={() => setFocusedField('name')}
                                onBlur={() => setFocusedField(null)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person style={{ color: focusedField === 'name' ? '#6366f1' : '#9ca3af' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={getFieldStyle('name')}
                            />
                        </motion.div>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <motion.div
                            custom={1}
                            variants={inputAnimation}
                            initial="hidden"
                            animate="visible"
                        >
                            <TextField
                                {...register('email')}
                                label="Email Address"
                                type="email"
                                fullWidth
                                required
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                variant="standard"
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email style={{ color: focusedField === 'email' ? '#6366f1' : '#9ca3af' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={getFieldStyle('email')}
                            />
                        </motion.div>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <motion.div
                            custom={2}
                            variants={inputAnimation}
                            initial="hidden"
                            animate="visible"
                        >
                            <TextField
                                {...register('company')}
                                label="Company (Optional)"
                                fullWidth
                                variant="standard"
                                onFocus={() => setFocusedField('company')}
                                onBlur={() => setFocusedField(null)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Business style={{ color: focusedField === 'company' ? '#6366f1' : '#9ca3af' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={getFieldStyle('company')}
                            />
                        </motion.div>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <motion.div
                            custom={3}
                            variants={inputAnimation}
                            initial="hidden"
                            animate="visible"
                        >
                            <TextField
                                {...register('phone')}
                                label="Phone Number (Optional)"
                                type="tel"
                                fullWidth
                                variant="standard"
                                onFocus={() => setFocusedField('phone')}
                                onBlur={() => setFocusedField(null)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Phone style={{ color: focusedField === 'phone' ? '#6366f1' : '#9ca3af' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={getFieldStyle('phone')}
                            />
                        </motion.div>
                    </Grid>

                    <Grid item xs={12}>
                        <motion.div
                            custom={4}
                            variants={inputAnimation}
                            initial="hidden"
                            animate="visible"
                        >
                            <TextField
                                {...register('service')}
                                select
                                label="Service Interested In"
                                fullWidth
                                required
                                error={!!errors.service}
                                helperText={errors.service?.message}
                                variant="standard"
                                onFocus={() => setFocusedField('service')}
                                onBlur={() => setFocusedField(null)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Category style={{ color: focusedField === 'service' ? '#6366f1' : '#9ca3af' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    ...getFieldStyle('service'),
                                    '& .MuiSelect-select': {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                    }
                                }}
                                defaultValue=""
                            >
                                <MenuItem value="" disabled>
                                    <em style={{ color: '#9ca3af' }}>Choose a service</em>
                                </MenuItem>
                                {services.map((service) => (
                                    <MenuItem
                                        key={service.value}
                                        value={service.value}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: `${service.color}10`,
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    backgroundColor: service.color,
                                                }}
                                            />
                                            {service.label}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </motion.div>
                    </Grid>

                    <Grid item xs={12}>
                        <motion.div
                            custom={5}
                            variants={inputAnimation}
                            initial="hidden"
                            animate="visible"
                        >
                            <TextField
                                {...register('message')}
                                label="Tell us about your project"
                                multiline
                                rows={6}
                                fullWidth
                                required
                                error={!!errors.message}
                                helperText={errors.message?.message || `${watchedFields.message?.length || 0} characters`}
                                variant="standard"
                                onFocus={() => setFocusedField('message')}
                                onBlur={() => setFocusedField(null)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                                            <Message style={{ color: focusedField === 'message' ? '#6366f1' : '#9ca3af' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    ...getFieldStyle('message'),
                                    '& .MuiInputBase-root': {
                                        alignItems: 'flex-start',
                                    }
                                }}
                            />
                        </motion.div>
                    </Grid>
                </Grid>

                <motion.div
                    custom={6}
                    variants={inputAnimation}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-12"
                >
                    {/* Form Progress Indicator */}
                    <Box className="flex items-center gap-2">
                        <Typography variant="caption" color="text.secondary">
                            Form Progress
                        </Typography>
                        <Box className="flex gap-1">
                            {['name', 'email', 'service', 'message'].map((field) => (
                                <Box
                                    key={field}
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: watchedFields[field] ? '#6366f1' : '#e5e7eb',
                                        transition: 'all 0.3s ease',
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        size="large"
                        sx={{
                            background: isLoading
                                ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: '#fff',
                            padding: '14px 40px',
                            borderRadius: '50px',
                            fontSize: '0.95rem',
                            letterSpacing: '0.5px',
                            fontWeight: 500,
                            boxShadow: isLoading
                                ? 'none'
                                : '0 10px 30px -10px rgba(99, 102, 241, 0.5)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 15px 35px -10px rgba(99, 102, 241, 0.6)',
                            },
                            '&:active': {
                                transform: 'translateY(0)',
                            },
                            '&:disabled': {
                                transform: 'none',
                            },
                            transition: 'all 0.3s ease',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                transition: 'left 0.5s ease',
                            },
                            '&:hover::before': {
                                left: '100%',
                            },
                        }}
                    >
                        {isLoading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <CircularProgress size={20} color="inherit" />
                                <span>Sending...</span>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <span>Send Message</span>
                                <Send fontSize="small" />
                            </Box>
                        )}
                    </Button>

                    {/* Success Animation Overlay */}
                    {isLoading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: 2,
                                zIndex: 10,
                            }}
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 180, 360],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Send sx={{ color: 'white', fontSize: 28 }} />
                                </Box>
                            </motion.div>
                        </Box>
                    )}
                </motion.div>
            </form>
        </motion.div>
    )
}

export default ContactForm