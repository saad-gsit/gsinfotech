import { Link } from 'react-router-dom'
import {
    Box,
    Container,
    Grid,
    Typography,
    IconButton,
    Stack,
    Divider
} from '@mui/material'
import {
    LinkedIn,
    Twitter,
    GitHub,
    Instagram,
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
            icon: <LinkedIn sx={{ fontSize: 18 }} />,
            href: 'https://linkedin.com/company/gsinfotech',
            name: 'LinkedIn',
        },
        {
            icon: <Twitter sx={{ fontSize: 18 }} />,
            href: 'https://twitter.com/gsinfotech',
            name: 'Twitter',
        },
        {
            icon: <GitHub sx={{ fontSize: 18 }} />,
            href: 'https://github.com/gsinfotech',
            name: 'GitHub',
        },
        {
            icon: <Instagram sx={{ fontSize: 18 }} />,
            href: 'https://instagram.com/gsinfotech',
            name: 'Instagram',
        }
    ]

    return (
        <footer>
            <Box
                sx={{
                    backgroundColor: 'var(--stone-900)',
                    borderTop: '1px solid var(--stone-800)',
                }}
            >
                <Container maxWidth="lg">
                    {/* Main Footer Content */}
                    <Box sx={{ py: 6 }}>
                        <Grid container spacing={4}>
                            {/* Brand Section */}
                            <Grid item xs={12} md={3}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '1.25rem',
                                            mb: 2
                                        }}
                                    >
                                        GS Infotech
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontWeight: 300,
                                            lineHeight: 1.6,
                                            mb: 3
                                        }}
                                    >
                                        Creating digital experiences that inspire and deliver exceptional results.
                                    </Typography>

                                    {/* Social Links */}
                                    <Stack direction="row" spacing={1}>
                                        {socialLinks.map((social) => (
                                            <IconButton
                                                key={social.name}
                                                component="a"
                                                href={social.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                size="small"
                                                sx={{
                                                    color: 'rgba(255, 255, 255, 0.6)',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        color: 'var(--sage-400)',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                    }
                                                }}
                                            >
                                                {social.icon}
                                            </IconButton>
                                        ))}
                                    </Stack>
                                </Box>
                            </Grid>

                            {/* Links Sections */}
                            <Grid item xs={12} md={6}>
                                <Grid container spacing={4}>
                                    <Grid item xs={6} sm={4}>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                color: 'var(--sage-400)',
                                                fontWeight: 600,
                                                mb: 2,
                                                fontSize: '0.875rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}
                                        >
                                            Company
                                        </Typography>
                                        <Stack spacing={1.5}>
                                            {footerLinks.company.map((link) => (
                                                <Link key={link.name} to={link.href} className="no-underline">
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: 'rgba(255, 255, 255, 0.6)',
                                                            fontWeight: 300,
                                                            fontSize: '0.875rem',
                                                            transition: 'color 0.3s ease',
                                                            '&:hover': {
                                                                color: 'white',
                                                            }
                                                        }}
                                                    >
                                                        {link.name}
                                                    </Typography>
                                                </Link>
                                            ))}
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={6} sm={4}>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                color: 'var(--coral-400)',
                                                fontWeight: 600,
                                                mb: 2,
                                                fontSize: '0.875rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}
                                        >
                                            Services
                                        </Typography>
                                        <Stack spacing={1.5}>
                                            {footerLinks.services.map((link) => (
                                                <Link key={link.name} to={link.href} className="no-underline">
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: 'rgba(255, 255, 255, 0.6)',
                                                            fontWeight: 300,
                                                            fontSize: '0.875rem',
                                                            transition: 'color 0.3s ease',
                                                            '&:hover': {
                                                                color: 'white',
                                                            }
                                                        }}
                                                    >
                                                        {link.name}
                                                    </Typography>
                                                </Link>
                                            ))}
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} sm={4}>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                color: 'var(--sand-400)',
                                                fontWeight: 600,
                                                mb: 2,
                                                fontSize: '0.875rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}
                                        >
                                            Resources
                                        </Typography>
                                        <Stack spacing={1.5}>
                                            {footerLinks.resources.map((link) => (
                                                <Link key={link.name} to={link.href} className="no-underline">
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: 'rgba(255, 255, 255, 0.6)',
                                                            fontWeight: 300,
                                                            fontSize: '0.875rem',
                                                            transition: 'color 0.3s ease',
                                                            '&:hover': {
                                                                color: 'white',
                                                            }
                                                        }}
                                                    >
                                                        {link.name}
                                                    </Typography>
                                                </Link>
                                            ))}
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Contact Info */}
                            <Grid item xs={12} md={3}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        color: 'white',
                                        fontWeight: 600,
                                        mb: 2,
                                        fontSize: '0.875rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}
                                >
                                    Get in Touch
                                </Typography>
                                <Stack spacing={1.5}>
                                    <Box
                                        component="a"
                                        href="mailto:hello@gsinfotech.com"
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            textDecoration: 'none',
                                            color: 'inherit',
                                        }}
                                    >
                                        <EmailOutlined sx={{ fontSize: 16, color: 'var(--sage-400)' }} />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.6)',
                                                fontSize: '0.875rem',
                                                transition: 'color 0.3s ease',
                                                '&:hover': { color: 'white' }
                                            }}
                                        >
                                            hello@gsinfotech.com
                                        </Typography>
                                    </Box>

                                    <Box
                                        component="a"
                                        href="tel:+15551234567"
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            textDecoration: 'none',
                                            color: 'inherit',
                                        }}
                                    >
                                        <PhoneOutlined sx={{ fontSize: 16, color: 'var(--coral-400)' }} />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.6)',
                                                fontSize: '0.875rem',
                                                transition: 'color 0.3s ease',
                                                '&:hover': { color: 'white' }
                                            }}
                                        >
                                            +1 (555) 123-4567
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocationOnOutlined sx={{ fontSize: 16, color: 'var(--sand-400)' }} />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.6)',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            San Francisco, CA
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Divider */}
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                    {/* Bottom Section */}
                    <Box sx={{ py: 3 }}>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    fontSize: '0.813rem',
                                    textAlign: { xs: 'center', sm: 'left' }
                                }}
                            >
                                © {currentYear} GS Infotech. All rights reserved.
                            </Typography>

                            <Stack
                                direction="row"
                                spacing={3}
                                divider={
                                    <Box
                                        sx={{
                                            width: 4,
                                            height: 4,
                                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                            borderRadius: '50%'
                                        }}
                                    />
                                }
                            >
                                <Link to="/privacy" className="no-underline">
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            fontSize: '0.813rem',
                                            transition: 'color 0.3s ease',
                                            '&:hover': { color: 'white' }
                                        }}
                                    >
                                        Privacy
                                    </Typography>
                                </Link>
                                <Link to="/terms" className="no-underline">
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            fontSize: '0.813rem',
                                            transition: 'color 0.3s ease',
                                            '&:hover': { color: 'white' }
                                        }}
                                    >
                                        Terms
                                    </Typography>
                                </Link>
                            </Stack>
                        </Stack>
                    </Box>
                </Container>
            </Box>
        </footer>
    )
}

export default Footer