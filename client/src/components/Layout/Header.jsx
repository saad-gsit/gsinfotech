import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
    AppBar,
    Toolbar,
    IconButton,
    Drawer,
    Box,
    Button,
    useScrollTrigger,
    Typography,
    Stack
} from '@mui/material'
import {
    Menu as MenuIcon,
    Close as CloseIcon,
    ArrowOutward
} from '@mui/icons-material'
import { toggleMobileMenu } from '@/store/slices/uiSlice'

const Header = () => {
    const location = useLocation()
    const dispatch = useDispatch()
    const { mobileMenuOpen } = useSelector(state => state.ui)
    const [scrolled, setScrolled] = useState(false)

    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 30,
    })

    useEffect(() => {
        setScrolled(trigger)
    }, [trigger])

    const navigation = [
        { name: 'Work', href: '/projects' },
        { name: 'Services', href: '/services' },
        { name: 'About', href: '/about' },
        { name: 'Journal', href: '/blog' },
        { name: 'Contact', href: '/contact' },
    ]

    return (
        <>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    backgroundColor: scrolled
                        ? 'var(--sand-100)'
                        : 'transparent',
                    backdropFilter: scrolled ? 'blur(20px)' : 'none',
                    borderBottom: scrolled ? '1px solid var(--sage-100)' : 'none',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                <Toolbar className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-6">
                    {/* Logo */}
                    <Link to="/" className="flex items-center no-underline group">
                        <motion.div
                            className="flex items-center"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="w-8 h-8 bg-sage-400 rounded-full mr-3 flex items-center justify-center">
                                <Typography variant="body2" className="text-white font-semibold text-sm">
                                    GS
                                </Typography>
                            </div>
                            <Typography
                                variant="h6"
                                className="font-medium tracking-tight text-stone-800 group-hover:text-sage-600 transition-colors duration-300"
                            >
                                GS Infotech
                            </Typography>
                        </motion.div>
                    </Link>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Desktop Navigation */}
                    <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 1 }}>
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="no-underline"
                            >
                                <Button
                                    sx={{
                                        px: 3,
                                        py: 1.5,
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        letterSpacing: '0.025em',
                                        textTransform: 'none',
                                        borderRadius: '50px',
                                        transition: 'all 0.3s ease',
                                        color: location.pathname === item.href ||
                                            (item.href === '/services' && location.pathname.startsWith('/services'))
                                            ? 'var(--sage-600)'
                                            : 'var(--stone-600)',
                                        backgroundColor: location.pathname === item.href ||
                                            (item.href === '/services' && location.pathname.startsWith('/services'))
                                            ? 'var(--sage-50)'
                                            : 'transparent',
                                        '&:hover': {
                                            color: 'var(--stone-800)',
                                            backgroundColor: 'var(--stone-50)',
                                        }
                                    }}
                                >
                                    {item.name}
                                </Button>
                            </Link>
                        ))}

                        <Box className="ml-6 pl-6" sx={{ borderLeft: '1px solid var(--stone-200)' }}>
                            <Link to="/contact" className="no-underline">
                                <Button
                                    variant="contained"
                                    endIcon={<ArrowOutward className="text-sm" />}
                                    sx={{
                                        backgroundColor: 'var(--sage-400)',
                                        color: 'white',
                                        borderRadius: '50px',
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        letterSpacing: '0.025em',
                                        textTransform: 'none',
                                        boxShadow: 'none',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            backgroundColor: 'var(--sage-500)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 25px -8px rgba(157, 176, 130, 0.5)'
                                        }
                                    }}
                                >
                                    Let's Talk
                                </Button>
                            </Link>
                        </Box>
                    </Box>

                    {/* Mobile menu button */}
                    <IconButton
                        onClick={() => dispatch(toggleMobileMenu())}
                        sx={{
                            display: { lg: 'none' },
                            color: 'var(--stone-800)',
                            '&:hover': {
                                backgroundColor: 'var(--stone-50)'
                            }
                        }}
                    >
                        {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                anchor="right"
                open={mobileMenuOpen}
                onClose={() => dispatch(toggleMobileMenu())}
                PaperProps={{
                    sx: {
                        width: '100%',
                        maxWidth: 400,
                        background: `linear-gradient(135deg, var(--sand-100) 0%, var(--sage-50) 100%)`,
                    }
                }}
            >
                <Box className="h-full flex flex-col">
                    {/* Header */}
                    <Box className="flex justify-between items-center p-8" sx={{ borderBottom: '1px solid var(--stone-200)' }}>
                        <Typography variant="h6" className="font-medium text-stone-800">
                            Navigation
                        </Typography>
                        <IconButton
                            onClick={() => dispatch(toggleMobileMenu())}
                            sx={{ color: 'var(--stone-600)', '&:hover': { color: 'var(--stone-800)' } }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Navigation Links */}
                    <Box className="flex-1 p-8 overflow-y-auto">
                        <Stack spacing={1}>
                            {navigation.map((item, index) => (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        to={item.href}
                                        onClick={() => dispatch(toggleMobileMenu())}
                                        className="no-underline"
                                    >
                                        <Box
                                            sx={{
                                                py: 2,
                                                px: 3,
                                                borderRadius: '16px',
                                                fontSize: '1.25rem',
                                                fontWeight: 500,
                                                transition: 'all 0.3s ease',
                                                color: location.pathname === item.href ||
                                                    (item.href === '/services' && location.pathname.startsWith('/services'))
                                                    ? 'var(--sage-600)'
                                                    : 'var(--stone-700)',
                                                backgroundColor: location.pathname === item.href ||
                                                    (item.href === '/services' && location.pathname.startsWith('/services'))
                                                    ? 'rgba(255, 255, 255, 0.7)'
                                                    : 'transparent',
                                                '&:hover': {
                                                    color: 'var(--stone-900)',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                                }
                                            }}
                                        >
                                            {item.name}
                                        </Box>
                                    </Link>
                                </motion.div>
                            ))}
                        </Stack>
                    </Box>

                    {/* Mobile CTA */}
                    <Box className="p-8" sx={{ borderTop: '1px solid var(--stone-200)' }}>
                        <Link
                            to="/contact"
                            onClick={() => dispatch(toggleMobileMenu())}
                            className="no-underline"
                        >
                            <Button
                                variant="contained"
                                fullWidth
                                endIcon={<ArrowOutward />}
                                sx={{
                                    backgroundColor: 'var(--sage-400)',
                                    color: 'white',
                                    borderRadius: '16px',
                                    py: 2,
                                    fontSize: '1.125rem',
                                    fontWeight: 500,
                                    letterSpacing: '0.025em',
                                    textTransform: 'none',
                                    boxShadow: 'none',
                                    '&:hover': {
                                        backgroundColor: 'var(--sage-500)',
                                    }
                                }}
                            >
                                Let's Talk
                            </Button>
                        </Link>

                        <Box className="mt-6 text-center">
                            <Typography variant="body2" sx={{ color: 'var(--stone-600)', lineHeight: 1.6 }}>
                                Ready to bring your vision to life?
                                <br />
                                Let's create something beautiful together.
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Drawer>

            {/* Spacer */}
            <Toolbar sx={{ minHeight: { xs: 88, md: 104 } }} />
        </>
    )
}

export default Header