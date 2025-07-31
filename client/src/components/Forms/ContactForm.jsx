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
    Send,
    CheckCircle
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
        { value: 'Custom Software Development', label: 'Custom Software Development', color: 'var(--sage-400)' },
        { value: 'Mobile App Development', label: 'Mobile App Development', color: 'var(--coral-400)' },
        { value: 'Web Development', label: 'Web Development', color: 'var(--sand-600)' },
        { value: 'UI/UX Design', label: 'UI/UX Design', color: 'var(--coral-500)' },
        { value: 'Enterprise Solutions', label: 'Enterprise Solutions', color: 'var(--sage-500)' },
        { value: 'Consulting', label: 'Consulting', color: 'var(--stone-600)' },
        { value: 'Other', label: 'Other', color: 'var(--stone-500)' },
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
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1]
            }
        })
    }

    const getFieldStyle = (fieldName) => ({
        '& .MuiInput-underline:before': {
            borderBottomColor: 'var(--stone-200)',
            borderBottomWidth: 2,
        },
        '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
            borderBottomColor: focusedField === fieldName ? 'var(--sage-400)' : 'var(--stone-300)',
        },
        '& .MuiInput-underline:after': {
            borderBottomColor: 'var(--sage-400)',
            borderBottomWidth: 2,
        },
        '& .MuiInputLabel-root': {
            color: 'var(--stone-600)',
            fontWeight: 500,
            fontSize: '1rem',
            '&.Mui-focused': {
                color: 'var(--sage-400)',
            },
            '&.Mui-error': {
                color: 'var(--coral-500)',
            }
        },
        '& .MuiInput-root': {
            fontSize: '1rem',
            color: 'var(--stone-800)',
            fontWeight: 400,
            transition: 'all 0.3s ease',
        },
        '& .MuiFormHelperText-root': {
            marginTop: '8px',
            fontSize: '0.75rem',
            '&.Mui-error': {
                color: 'var(--coral-500)',
            }
        },
        '& .MuiInputAdornment-root': {
            marginRight: '12px',
        }
    })

    const getProgressColor = () => {
        const requiredFields = ['name', 'email', 'service', 'message']
        const completedFields = requiredFields.filter(field => watchedFields[field]?.trim())
        const progress = completedFields.length / requiredFields.length

        if (progress >= 1) return 'var(--sage-400)'
        if (progress >= 0.5) return 'var(--sand-500)'
        return 'var(--stone-300)'
    }

    return (
        <motion.div
            variants={getVariants('fadeInUp')}
            initial="hidden"
            animate="visible"
            style={{ position: 'relative' }}
        >
            {/* Enhanced background decoration with theme colors */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, var(--sage-100) 0%, transparent 70%)',
                    opacity: 0.6,
                    filter: 'blur(30px)',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -20,
                    left: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, var(--coral-100) 0%, transparent 70%)',
                    opacity: 0.4,
                    filter: 'blur(25px)',
                }}
            />

            <form onSubmit={handleSubmit(onSubmit)} style={{ position: 'relative', zIndex: 2 }}>
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
                                            <Person
                                                sx={{
                                                    color: focusedField === 'name' ? 'var(--sage-400)' : 'var(--stone-400)',
                                                    transition: 'color 0.3s ease'
                                                }}
                                            />
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
                                            <Email
                                                sx={{
                                                    color: focusedField === 'email' ? 'var(--sage-400)' : 'var(--stone-400)',
                                                    transition: 'color 0.3s ease'
                                                }}
                                            />
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
                                            <Business
                                                sx={{
                                                    color: focusedField === 'company' ? 'var(--sage-400)' : 'var(--stone-400)',
                                                    transition: 'color 0.3s ease'
                                                }}
                                            />
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
                                            <Phone
                                                sx={{
                                                    color: focusedField === 'phone' ? 'var(--sage-400)' : 'var(--stone-400)',
                                                    transition: 'color 0.3s ease'
                                                }}
                                            />
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
                                            <Category
                                                sx={{
                                                    color: focusedField === 'service' ? 'var(--sage-400)' : 'var(--stone-400)',
                                                    transition: 'color 0.3s ease'
                                                }}
                                            />
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
                                    <em style={{ color: 'var(--stone-400)' }}>Choose a service</em>
                                </MenuItem>
                                {services.map((service) => (
                                    <MenuItem
                                        key={service.value}
                                        value={service.value}
                                        sx={{
                                            py: 1.5,
                                            '&:hover': {
                                                backgroundColor: `${service.color}15`,
                                            },
                                            '&.Mui-selected': {
                                                backgroundColor: `${service.color}20`,
                                                '&:hover': {
                                                    backgroundColor: `${service.color}25`,
                                                }
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box
                                                sx={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    backgroundColor: service.color,
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <Typography variant="body1" sx={{ color: 'var(--stone-800)' }}>
                                                {service.label}
                                            </Typography>
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
                                helperText={errors.message?.message ||
                                    `${watchedFields.message?.length || 0}/1000 characters`}
                                variant="standard"
                                onFocus={() => setFocusedField('message')}
                                onBlur={() => setFocusedField(null)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                                            <Message
                                                sx={{
                                                    color: focusedField === 'message' ? 'var(--sage-400)' : 'var(--stone-400)',
                                                    transition: 'color 0.3s ease'
                                                }}
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    ...getFieldStyle('message'),
                                    '& .MuiInputBase-root': {
                                        alignItems: 'flex-start',
                                    },
                                    '& .MuiFormHelperText-root': {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        color: errors.message ? 'var(--coral-500)' : 'var(--stone-500)',
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
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2rem',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '3rem'
                    }}
                >
                    {/* Enhanced Form Progress Indicator */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, width: '100%', justifyContent: 'center' }}>
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'var(--stone-600)',
                                fontWeight: 500,
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                                fontSize: '0.75rem'
                            }}
                        >
                            Progress
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {['name', 'email', 'service', 'message'].map((field, index) => {
                                const isCompleted = watchedFields[field]?.trim()
                                const isCurrent = focusedField === field

                                return (
                                    <motion.div
                                        key={field}
                                        animate={{
                                            scale: isCurrent ? 1.3 : 1,
                                            backgroundColor: isCompleted ? 'var(--sage-400)' :
                                                isCurrent ? 'var(--sand-400)' : 'var(--stone-200)'
                                        }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                        style={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            position: 'relative',
                                        }}
                                    >
                                        {isCompleted && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: 0.2, duration: 0.3 }}
                                                style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <CheckCircle
                                                    sx={{
                                                        fontSize: 12,
                                                        color: 'white',
                                                    }}
                                                />
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )
                            })}
                        </Box>
                        <Typography
                            variant="caption"
                            sx={{
                                color: getProgressColor(),
                                fontWeight: 500,
                                fontSize: '0.75rem'
                            }}
                        >
                            {(() => {
                                const completed = ['name', 'email', 'service', 'message']
                                    .filter(field => watchedFields[field]?.trim()).length
                                return `${completed}/4 Complete`
                            })()}
                        </Typography>
                    </Box>

                    {/* Enhanced Submit Button */}
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            size="large"
                            sx={{
                                background: isLoading
                                    ? 'linear-gradient(135deg, var(--stone-400) 0%, var(--stone-500) 100%)'
                                    : 'linear-gradient(135deg, var(--sage-400) 0%, var(--sage-500) 100%)',
                                color: '#fff',
                                padding: '16px 48px',
                                borderRadius: '50px',
                                fontSize: '1rem',
                                letterSpacing: '0.025em',
                                fontWeight: 500,
                                minWidth: 200,
                                boxShadow: isLoading
                                    ? 'none'
                                    : '0 12px 32px -8px rgba(139, 148, 113, 0.4)',
                                position: 'relative',
                                overflow: 'hidden',
                                border: 'none',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover:not(:disabled)': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 16px 40px -8px rgba(139, 148, 113, 0.5)',
                                    background: 'linear-gradient(135deg, var(--sage-500) 0%, var(--sage-600) 100%)',
                                },
                                '&:active:not(:disabled)': {
                                    transform: 'translateY(-1px)',
                                },
                                '&:disabled': {
                                    transform: 'none',
                                    cursor: 'not-allowed',
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: '-100%',
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                                    transition: 'left 0.6s ease',
                                },
                                '&:hover:not(:disabled)::before': {
                                    left: '100%',
                                },
                            }}
                        >
                            {isLoading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CircularProgress
                                        size={20}
                                        sx={{ color: 'white' }}
                                        thickness={4}
                                    />
                                    <span>Sending Message...</span>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <span>Send Message</span>
                                    <motion.div
                                        animate={{ x: [0, 4, 0] }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <Send sx={{ fontSize: 18 }} />
                                    </motion.div>
                                </Box>
                            )}
                        </Button>

                        {/* Success Animation Overlay */}
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '50px',
                                    zIndex: 10,
                                    backdropFilter: 'blur(4px)',
                                }}
                            >
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 180, 360],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--sage-400) 0%, var(--sage-500) 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 8px 25px -8px rgba(139, 148, 113, 0.4)',
                                        }}
                                    >
                                        <Send sx={{ color: 'white', fontSize: 24 }} />
                                    </Box>
                                </motion.div>
                            </motion.div>
                        )}
                    </Box>

                    {/* Form Footer */}
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'var(--stone-500)',
                                fontSize: '0.75rem',
                                lineHeight: 1.6,
                                maxWidth: 400,
                                mx: 'auto',
                                display: 'block'
                            }}
                        >
                            By submitting this form, you agree to our privacy policy and
                            consent to being contacted about your project.
                        </Typography>

                        {/* Trust Indicators */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, mt: 2 }}>
                            {[
                                { icon: '🔒', text: 'Secure & Private' },
                                { icon: '⚡', text: '24h Response' },
                                { icon: '💬', text: 'Free Consultation' }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 + index * 0.1 }}
                                >
                                    <Chip
                                        icon={<span style={{ fontSize: '0.75rem' }}>{item.icon}</span>}
                                        label={item.text}
                                        size="small"
                                        sx={{
                                            backgroundColor: 'var(--stone-50)',
                                            color: 'var(--stone-600)',
                                            fontSize: '0.7rem',
                                            height: 28,
                                            borderRadius: '14px',
                                            border: '1px solid var(--stone-100)',
                                            '& .MuiChip-icon': {
                                                fontSize: '0.75rem',
                                                marginLeft: '8px',
                                            }
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </Box>
                    </Box>
                </motion.div>
            </form>
        </motion.div>
    )
}

export default ContactForm
