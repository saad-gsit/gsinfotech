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
    AttachMoney,
    Schedule,
    Star
} from '@mui/icons-material'

const ServiceCard = ({
    service,
    index = 0,
    compact = false,
    showPricing = true,
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
                    '&:hover': {
                        transform: compact ? 'translateY(-4px)' : 'translateY(-8px)',
                        boxShadow: compact ? '0 8px 25px rgba(0,0,0,0.12)' : '0 20px 40px rgba(0,0,0,0.15)',
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

                <CardContent sx={{ flexGrow: 1, p: compact ? 3 : 4 }}>
                    {/* Service Icon */}
                    <Box sx={{ mb: compact ? 2 : 3 }}>
                        <Avatar
                            className="service-icon"
                            sx={{
                                width: compact ? 48 : 64,
                                height: compact ? 48 : 64,
                                bgcolor: 'grey.100',
                                color: categoryData.color,
                                transition: 'all 0.3s ease',
                                fontSize: compact ? '1.5rem' : '2rem'
                            }}
                        >
                            {service.featured_image ? (
                                <img
                                    src={service.featured_image}
                                    alt={service.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                categoryData.icon
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
                        variant={compact ? "h6" : "h5"}
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
                            mb: compact ? 2 : 3,
                            lineHeight: 1.6,
                            display: '-webkit-box',
                            WebkitLineClamp: compact ? 2 : 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {service.short_description}
                    </Typography>

                    {/* Features List */}
                    {showFeatures && service.features && service.features.length > 0 && (
                        <Box sx={{ mb: compact ? 2 : 3 }}>
                            <Stack spacing={1}>
                                {service.features.slice(0, compact ? 2 : 3).map((feature, idx) => (
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
                                {service.features.length > (compact ? 2 : 3) && (
                                    <Typography
                                        variant="caption"
                                        sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                                    >
                                        +{service.features.length - (compact ? 2 : 3)} more features
                                    </Typography>
                                )}
                            </Stack>
                        </Box>
                    )}

                    {/* Technologies */}
                    {showTechnologies && service.technologies && service.technologies.length > 0 && (
                        <Box sx={{ mb: compact ? 2 : 3 }}>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                {service.technologies.slice(0, compact ? 3 : 4).map((tech, idx) => (
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
                                {service.technologies.length > (compact ? 3 : 4) && (
                                    <Chip
                                        label={`+${service.technologies.length - (compact ? 3 : 4)}`}
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
                    {showPricing && (
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
                    )}
                </CardContent>

                <CardActions sx={{ p: compact ? 3 : 4, pt: 0 }}>
                    <Button
                        component={Link}
                        to={`/services/${service.slug}`}
                        className="learn-more-btn"
                        fullWidth
                        variant="outlined"
                        endIcon={<ArrowForward />}
                        sx={{
                            borderColor: 'grey.300',
                            color: 'text.primary',
                            fontWeight: 'medium',
                            py: compact ? 1 : 1.5,
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
    )
}

export default ServiceCard