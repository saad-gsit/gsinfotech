import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Box,
    Button,
    Chip,
    Avatar,
    Stack
} from '@mui/material'
import {
    Code,
    PhoneAndroid,
    Computer,
    Palette,
    Engineering,
    ArrowForward,
    CheckCircle,
    Schedule
} from '@mui/icons-material'

const ServiceCard = ({
    service,
    index = 0,
    compact = false,
    showFeatures = true,
    showTechnologies = true
}) => {
    const serviceCategories = {
        'web_development': { label: 'Web Development', icon: <Code />, color: '#2196F3' },
        'mobile_development': { label: 'Mobile Development', icon: <PhoneAndroid />, color: '#4CAF50' },
        'custom_software': { label: 'Custom Software', icon: <Computer />, color: '#FF9800' },
        'ui_ux_design': { label: 'UI/UX Design', icon: <Palette />, color: '#E91E63' },
        'enterprise_solutions': { label: 'Enterprise Solutions', icon: <Engineering />, color: '#9C27B0' }
    }

    const categoryData = serviceCategories[service.category] || {
        label: service.category,
        icon: <Code />,
        color: '#666'
    }

    return (
        <Box sx={{ height: '100%' }}> {/* Outer wrapper for proper height */}
            <Card
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'visible', // IMPORTANT: Keep visible to prevent cutoff
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #f0f0f0',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    pb: 0, // Remove any default padding at bottom
                    '&:hover': {
                        transform: compact ? 'translateY(-4px)' : 'translateY(-8px)',
                        boxShadow: compact ? '0 8px 25px rgba(0,0,0,0.12)' : '0 20px 40px rgba(0,0,0,0.15)',
                        '& .service-icon': {
                            transform: 'scale(1.1)',
                            bgcolor: categoryData.color,
                            color: 'white'
                        },
                        '& .learn-more-btn': {
                            bgcolor: categoryData.color,
                            color: 'white',
                            borderColor: categoryData.color
                        }
                    }
                }}
            >
                <CardContent sx={{
                    flexGrow: 1,
                    p: 3,
                    pb: 2,
                }}>
                    {/* Service Icon */}
                    <Box sx={{ mb: 2 }}>
                        <Avatar
                            className="service-icon"
                            sx={{
                                width: 48,
                                height: 48,
                                bgcolor: 'grey.100',
                                color: categoryData.color,
                                transition: 'all 0.3s ease',
                                fontSize: '1.5rem'
                            }}
                        >
                            {categoryData.icon}
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
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            mb: 1.5,
                            lineHeight: 1.3,
                            color: 'text.primary',
                            fontSize: '1.1rem'
                        }}
                    >
                        {service.name}
                    </Typography>

                    {/* Service Description */}
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                            mb: 2,
                            lineHeight: 1.6,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontSize: '0.875rem'
                        }}
                    >
                        {service.short_description}
                    </Typography>

                    {/* Features List */}
                    {showFeatures && service.features && service.features.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Stack spacing={0.5}>
                                {service.features.slice(0, 2).map((feature, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                    >
                                        <CheckCircle
                                            sx={{
                                                fontSize: 14,
                                                color: categoryData.color
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'text.secondary',
                                                fontSize: '0.75rem',
                                                lineHeight: 1.5
                                            }}
                                        >
                                            {feature}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    )}

                    {/* Timeline Info */}
                    {service.estimated_timeline && (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                        }}>
                            <Schedule sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                                {service.estimated_timeline}
                            </Typography>
                        </Box>
                    )}
                </CardContent>

                {/* Button Section - Ensure it's always visible */}
                <Box sx={{ p: 3, pt: 0 }}>
                    <Button
                        component={Link}
                        to={`/services/${service.slug}`}
                        className="learn-more-btn"
                        fullWidth
                        variant="outlined"
                        endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                        sx={{
                            borderColor: 'grey.300',
                            color: 'text.primary',
                            fontWeight: 'medium',
                            py: 1,
                            fontSize: '0.875rem',
                            transition: 'all 0.3s ease',
                            textTransform: 'none',
                            '&:hover': {
                                borderColor: 'transparent'
                            }
                        }}
                    >
                        Learn More
                    </Button>
                </Box>
            </Card>
        </Box>
    )
}

export default ServiceCard