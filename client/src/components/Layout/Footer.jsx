import { Link } from 'react-router-dom'
import {
    Box,
    Container,
    Grid,
    Typography,
    IconButton,
    TextField,
    Button,
    Divider,
    Stack
} from '@mui/material'
import {
    LinkedIn,
    Twitter,
    GitHub,
    Instagram,
    EastOutlined,
    FiberManualRecord
} from '@mui/icons-material'
import { motion } from 'framer-motion'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    const footerLinks = {
        company: [
            { name: 'About', href: '/about' },
            { name: 'Team', href: '/team' },
            { name: 'Careers', href: '/careers' },
            { name: 'Contact', href: '/contact' }
        ],
        services: [
            { name: 'Strategy', href: '/services/strategy-consulting' },
            { name: 'Design', href: '/services/product-design' },
            { name: 'Development', href: '/services/development' },
            { name: 'Cloud', href: '/services/cloud-devops' }
        ],
        resources: [
            { name: 'Blog', href: '/blog' },
            { name: 'Case Studies', href: '/projects' },
            { name: 'Privacy', href: '/privacy' },
            { name: 'Terms', href: '/terms' }
        ]
    }

    const socialLinks = [
        { icon: <LinkedIn />, href: '#' },
        { icon: <Twitter />, href: '#' },
        { icon: <GitHub />, href: '#' },
        { icon: <Instagram />, href: '#' }
    ]

    return (
        <footer className="bg-white border-t border-gray-200">
            <Container maxWidth="lg" className="py-16">
                {/* Main Footer Content */}
                <Grid container spacing={8}>
                    {/* Brand Column */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h5" className="font-medium mb-4">
                            GS<span className="font-light">infotech</span>
                        </Typography>
                        <Typography variant="body2" className="text-gray-600 mb-6 font-light leading-relaxed">
                            We create digital experiences that matter.
                            Strategy, Design, Development.
                        </Typography>

                        {/* Social Links */}
                        <Stack direction="row" spacing={1}>
                            {socialLinks.map((social, index) => (
                                <IconButton
                                    key={index}
                                    href={social.href}
                                    target="_blank"
                                    className="text-gray-600 hover:text-black transition-colors"
                                    size="small"
                                >
                                    {social.icon}
                                </IconButton>
                            ))}
                        </Stack>
                    </Grid>

                    {/* Links Columns */}
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={4}>
                            <Grid item xs={6} sm={4}>
                                <Typography variant="overline" className="text-gray-500 text-xs tracking-wider mb-4 block">
                                    Company
                                </Typography>
                                {footerLinks.company.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        className="no-underline"
                                    >
                                        <Typography
                                            variant="body2"
                                            className="text-gray-600 hover:text-black mb-3 font-light transition-colors"
                                        >
                                            {link.name}
                                        </Typography>
                                    </Link>
                                ))}
                            </Grid>

                            <Grid item xs={6} sm={4}>
                                <Typography variant="overline" className="text-gray-500 text-xs tracking-wider mb-4 block">
                                    Services
                                </Typography>
                                {footerLinks.services.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        className="no-underline"
                                    >
                                        <Typography
                                            variant="body2"
                                            className="text-gray-600 hover:text-black mb-3 font-light transition-colors"
                                        >
                                            {link.name}
                                        </Typography>
                                    </Link>
                                ))}
                            </Grid>

                            <Grid item xs={6} sm={4}>
                                <Typography variant="overline" className="text-gray-500 text-xs tracking-wider mb-4 block">
                                    Resources
                                </Typography>
                                {footerLinks.resources.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        className="no-underline"
                                    >
                                        <Typography
                                            variant="body2"
                                            className="text-gray-600 hover:text-black mb-3 font-light transition-colors"
                                        >
                                            {link.name}
                                        </Typography>
                                    </Link>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Newsletter Section */}
                <Box className="mt-12 pt-12 border-t border-gray-200">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" className="font-light mb-2">
                                Stay in the loop
                            </Typography>
                            <Typography variant="body2" className="text-gray-600 font-light">
                                Get updates on our latest projects and insights.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box className="flex gap-2">
                                <TextField
                                    fullWidth
                                    placeholder="Enter your email"
                                    variant="outlined"
                                    size="small"
                                    className="bg-gray-50"
                                    InputProps={{
                                        sx: {
                                            borderRadius: 0,
                                            '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.1)' },
                                            '&:hover fieldset': { borderColor: 'rgba(0, 0, 0, 0.2)' },
                                            '&.Mui-focused fieldset': { borderColor: 'black' }
                                        }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    endIcon={<EastOutlined />}
                                    className="bg-black hover:bg-gray-900 text-white rounded-none px-6 normal-case whitespace-nowrap"
                                >
                                    Subscribe
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Bottom Bar */}
                <Box className="mt-12 pt-8 border-t border-gray-200">
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={2}
                    >
                        <Typography variant="body2" className="text-gray-500 font-light">
                            © {currentYear} GS Infotech. All rights reserved.
                        </Typography>

                        <Stack direction="row" spacing={2} alignItems="center">
                            <Link to="/privacy" className="no-underline">
                                <Typography variant="body2" className="text-gray-500 hover:text-black font-light transition-colors">
                                    Privacy
                                </Typography>
                            </Link>
                            <FiberManualRecord sx={{ fontSize: 4 }} className="text-gray-400" />
                            <Link to="/terms" className="no-underline">
                                <Typography variant="body2" className="text-gray-500 hover:text-black font-light transition-colors">
                                    Terms
                                </Typography>
                            </Link>
                            <FiberManualRecord sx={{ fontSize: 4 }} className="text-gray-400" />
                            <Link to="/sitemap" className="no-underline">
                                <Typography variant="body2" className="text-gray-500 hover:text-black font-light transition-colors">
                                    Sitemap
                                </Typography>
                            </Link>
                        </Stack>
                    </Stack>
                </Box>
            </Container>
        </footer>
    )
}

export default Footer