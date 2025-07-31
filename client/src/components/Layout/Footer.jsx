import { Link } from 'react-router-dom'
import {
    Box,
    Container,
    Grid,
    Typography,
    IconButton,
    TextField,
    Button,
    Stack,
    Avatar
} from '@mui/material'
import {
    LinkedIn,
    Twitter,
    GitHub,
    Instagram,
    ArrowOutward,
    EmailOutlined,
    LocationOnOutlined,
    PhoneOutlined
} from '@mui/icons-material'
import { motion } from 'framer-motion'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    const footerLinks = {
        company: [
            { name: 'About Us', href: '/about' },
            { name: 'Our Team', href: '/team' },
            { name: 'Careers', href: '/careers' },
            { name: 'Contact', href: '/contact' }
        ],
        services: [
            { name: 'Web Development', href: '/services/web-development' },
            { name: 'Mobile Apps', href: '/services/mobile-development' },
            { name: 'UI/UX Design', href: '/services/ui-ux-design' },
            { name: 'Consulting', href: '/services/consulting' }
        ],
        resources: [
            { name: 'Blog', href: '/blog' },
            { name: 'Case Studies', href: '/projects' },
            { name: 'Privacy Policy', href: '/privacy' },
            { name: 'Terms of Service', href: '/terms' }
        ]
    }

    const socialLinks = [
        {
            icon: <LinkedIn />,
            href: 'https://linkedin.com/company/gsinfotech',
            name: 'LinkedIn',
            color: 'var(--sage-400)'
        },
        {
            icon: <Twitter />,
            href: 'https://twitter.com/gsinfotech',
            name: 'Twitter',
            color: 'var(--coral-400)'
        },
        {
            icon: <GitHub />,
            href: 'https://github.com/gsinfotech',
            name: 'GitHub',
            color: 'var(--stone-400)'
        },
        {
            icon: <Instagram />,
            href: 'https://instagram.com/gsinfotech',
            name: 'Instagram',
            color: 'var(--sand-400)'
        }
    ]

    const contactInfo = [
        {
            icon: <EmailOutlined />,
            text: 'hello@gsinfotech.com',
            href: 'mailto:hello@gsinfotech.com'
        },
        {
            icon: <PhoneOutlined />,
            text: '+1 (555) 123-4567',
            href: 'tel:+15551234567'
        },
        {
            icon: <LocationOnOutlined />,
            text: 'San Francisco, CA',
            href: '#'
        }
    ]

    return (
        <footer>
            {/* Main Footer */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, var(--stone-900) 0%, var(--stone-800) 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Subtle Background Pattern */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0.03,
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px)`,
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
                    <Box sx={{ py: 8 }}>
                        <Grid container spacing={6}>
                            {/* Brand & Description */}
                            <Grid item xs={12} md={4}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                    viewport={{ once: true }}
                                >
                                    {/* Logo */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <Avatar
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                backgroundColor: 'var(--sage-400)',
                                                mr: 2,
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                                                GS
                                            </Typography>
                                        </Avatar>
                                        <Typography variant="h5" sx={{ color: 'white', fontWeight: 300 }}>
                                            GS<span style={{ fontWeight: 600 }}>infotech</span>
                                        </Typography>
                                    </Box>

                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            fontWeight: 300,
                                            mb: 4,
                                            lineHeight: 1.7,
                                        }}
                                    >
                                        We create digital experiences that inspire, engage, and deliver exceptional results for businesses worldwide.
                                    </Typography>

                                    {/* Contact Info */}
                                    <Stack spacing={2}>
                                        {contactInfo.map((contact, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                                viewport={{ once: true }}
                                            >
                                                <Box
                                                    component={contact.href !== '#' ? 'a' : 'div'}
                                                    href={contact.href !== '#' ? contact.href : undefined}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1.5,
                                                        textDecoration: 'none',
                                                        color: 'inherit',
                                                        cursor: contact.href !== '#' ? 'pointer' : 'default',
                                                        transition: 'color 0.3s ease',
                                                        '&:hover': contact.href !== '#' ? {
                                                            color: 'var(--sage-400)',
                                                        } : {}
                                                    }}
                                                >
                                                    <Box sx={{
                                                        color: 'rgba(255, 255, 255, 0.6)',
                                                        fontSize: '1.2rem',
                                                        transition: 'color 0.3s ease'
                                                    }}>
                                                        {contact.icon}
                                                    </Box>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: 'rgba(255, 255, 255, 0.8)',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        {contact.text}
                                                    </Typography>
                                                </Box>
                                            </motion.div>
                                        ))}
                                    </Stack>
                                </motion.div>
                            </Grid>

                            {/* Links Sections */}
                            <Grid item xs={12} md={6}>
                                <Grid container spacing={4}>
                                    {/* Company Links */}
                                    <Grid item xs={12} sm={4}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: 0.1 }}
                                            viewport={{ once: true }}
                                        >
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    color: 'var(--sage-400)',
                                                    fontWeight: 500,
                                                    mb: 3,
                                                    fontSize: '1rem'
                                                }}
                                            >
                                                Company
                                            </Typography>
                                            <Stack spacing={2}>
                                                {footerLinks.company.map((link, index) => (
                                                    <motion.div
                                                        key={link.name}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        whileInView={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                                        viewport={{ once: true }}
                                                    >
                                                        <Link to={link.href} className="no-underline">
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                                    fontWeight: 300,
                                                                    transition: 'all 0.3s ease',
                                                                    position: 'relative',
                                                                    '&:hover': {
                                                                        color: 'white',
                                                                        transform: 'translateX(4px)',
                                                                    }
                                                                }}
                                                            >
                                                                {link.name}
                                                            </Typography>
                                                        </Link>
                                                    </motion.div>
                                                ))}
                                            </Stack>
                                        </motion.div>
                                    </Grid>

                                    {/* Services Links */}
                                    <Grid item xs={12} sm={4}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: 0.2 }}
                                            viewport={{ once: true }}
                                        >
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    color: 'var(--coral-400)',
                                                    fontWeight: 500,
                                                    mb: 3,
                                                    fontSize: '1rem'
                                                }}
                                            >
                                                Services
                                            </Typography>
                                            <Stack spacing={2}>
                                                {footerLinks.services.map((link, index) => (
                                                    <motion.div
                                                        key={link.name}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        whileInView={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                                        viewport={{ once: true }}
                                                    >
                                                        <Link to={link.href} className="no-underline">
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                                    fontWeight: 300,
                                                                    transition: 'all 0.3s ease',
                                                                    '&:hover': {
                                                                        color: 'white',
                                                                        transform: 'translateX(4px)',
                                                                    }
                                                                }}
                                                            >
                                                                {link.name}
                                                            </Typography>
                                                        </Link>
                                                    </motion.div>
                                                ))}
                                            </Stack>
                                        </motion.div>
                                    </Grid>

                                    {/* Resources Links */}
                                    <Grid item xs={12} sm={4}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: 0.3 }}
                                            viewport={{ once: true }}
                                        >
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    color: 'var(--sand-400)',
                                                    fontWeight: 500,
                                                    mb: 3,
                                                    fontSize: '1rem'
                                                }}
                                            >
                                                Resources
                                            </Typography>
                                            <Stack spacing={2}>
                                                {footerLinks.resources.map((link, index) => (
                                                    <motion.div
                                                        key={link.name}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        whileInView={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                                        viewport={{ once: true }}
                                                    >
                                                        <Link to={link.href} className="no-underline">
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                                    fontWeight: 300,
                                                                    transition: 'all 0.3s ease',
                                                                    '&:hover': {
                                                                        color: 'white',
                                                                        transform: 'translateX(4px)',
                                                                    }
                                                                }}
                                                            >
                                                                {link.name}
                                                            </Typography>
                                                        </Link>
                                                    </motion.div>
                                                ))}
                                            </Stack>
                                        </motion.div>
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Newsletter & Social */}
                            <Grid item xs={12} md={2}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    viewport={{ once: true }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: 'white',
                                            fontWeight: 500,
                                            mb: 3,
                                            fontSize: '1rem'
                                        }}
                                    >
                                        Stay Connected
                                    </Typography>

                                    {/* Newsletter */}
                                    <Box sx={{ mb: 4 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.8)',
                                                mb: 2,
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            Get updates & insights
                                        </Typography>
                                        <Stack spacing={2}>
                                            <TextField
                                                fullWidth
                                                placeholder="Enter email"
                                                variant="outlined"
                                                size="small"
                                                InputProps={{
                                                    sx: {
                                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '8px',
                                                        color: 'white',
                                                        '& .MuiOutlinedInput-root': {
                                                            '& fieldset': {
                                                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                                            },
                                                            '&:hover fieldset': {
                                                                borderColor: 'var(--sage-400)',
                                                            },
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: 'var(--sage-400)',
                                                            },
                                                        },
                                                        '& .MuiInputBase-input::placeholder': {
                                                            color: 'rgba(255, 255, 255, 0.6)',
                                                            opacity: 1,
                                                        },
                                                    }
                                                }}
                                            />
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                endIcon={<ArrowOutward />}
                                                sx={{
                                                    backgroundColor: 'var(--sage-400)',
                                                    color: 'white',
                                                    borderRadius: '8px',
                                                    py: 1,
                                                    fontWeight: 500,
                                                    textTransform: 'none',
                                                    '&:hover': {
                                                        backgroundColor: 'var(--sage-500)',
                                                    }
                                                }}
                                            >
                                                Subscribe
                                            </Button>
                                        </Stack>
                                    </Box>

                                    {/* Social Links */}
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.8)',
                                                mb: 2,
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            Follow us
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                            {socialLinks.map((social, index) => (
                                                <motion.div
                                                    key={social.name}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    whileInView={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                                    viewport={{ once: true }}
                                                    whileHover={{ y: -3 }}
                                                >
                                                    <IconButton
                                                        component="a"
                                                        href={social.href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        sx={{
                                                            width: 36,
                                                            height: 36,
                                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                            color: 'rgba(255, 255, 255, 0.7)',
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                backgroundColor: social.color,
                                                                color: 'white',
                                                                transform: 'translateY(-3px)',
                                                                boxShadow: `0 4px 12px -2px ${social.color}40`,
                                                            }
                                                        }}
                                                        title={`Follow us on ${social.name}`}
                                                    >
                                                        {social.icon}
                                                    </IconButton>
                                                </motion.div>
                                            ))}
                                        </Stack>
                                    </Box>
                                </motion.div>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Bottom Section */}
                    <Box
                        sx={{
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            py: 4
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={3}
                                alignItems={{ xs: 'center', sm: 'center' }}
                                justifyContent="space-between"
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        fontSize: '0.875rem',
                                        textAlign: { xs: 'center', sm: 'left' }
                                    }}
                                >
                                    © {currentYear} GS Infotech. All rights reserved.
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            backgroundColor: 'var(--coral-400)',
                                            borderRadius: '50%',
                                            animation: 'pulse 2s infinite',
                                            '@keyframes pulse': {
                                                '0%': { opacity: 1 },
                                                '50%': { opacity: 0.5 },
                                                '100%': { opacity: 1 },
                                            }
                                        }}
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        Made with passion in India
                                    </Typography>
                                </Box>
                            </Stack>
                        </motion.div>
                    </Box>
                </Container>
            </Box>
        </footer>
    )
}

export default Footer