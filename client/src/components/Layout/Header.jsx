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
    Typography
} from '@mui/material'
import {
    Menu as MenuIcon,
    Close as CloseIcon
} from '@mui/icons-material'
import { toggleMobileMenu } from '@/store/slices/uiSlice'

const Header = () => {
    const location = useLocation()
    const dispatch = useDispatch()
    const { mobileMenuOpen } = useSelector(state => state.ui)
    const [scrolled, setScrolled] = useState(false)

    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 50,
    })

    useEffect(() => {
        setScrolled(trigger)
    }, [trigger])

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'Services', href: '/services' }, // Simple services link
        { name: 'Projects', href: '/projects' },
        { name: 'Team', href: '/team' },
        { name: 'Blog', href: '/blog' },
        { name: 'Contact', href: '/contact' },
    ]

    return (
        <>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.98)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(10px)' : 'none',
                    borderBottom: scrolled ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    color: scrolled ? '#000' : '#000',
                }}
            >
                <Toolbar className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center no-underline">
                        <Typography variant="h5" className="font-medium tracking-tight text-black">
                            GS<span className="font-light">infotech</span>
                        </Typography>
                    </Link>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Desktop Navigation */}
                    <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 4 }}>
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="no-underline"
                            >
                                <Button
                                    className={`text-sm font-light tracking-wide normal-case ${location.pathname === item.href ||
                                        (item.href === '/services' && location.pathname.startsWith('/services'))
                                        ? 'text-black font-medium'
                                        : 'text-gray-600 hover:text-black'
                                        }`}
                                    sx={{
                                        minWidth: 'auto',
                                        padding: '4px 8px',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: 'transparent',
                                            transform: 'translateY(-1px)',
                                        }
                                    }}
                                >
                                    {item.name}
                                </Button>
                            </Link>
                        ))}

                        <Box className="ml-4">
                            <Link to="/contact" className="no-underline">
                                <Button
                                    variant="contained"
                                    className="bg-black hover:bg-gray-900 text-white rounded-none px-6 py-2 text-sm font-light tracking-wide normal-case shadow-none"
                                    sx={{
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                        }
                                    }}
                                >
                                    Start a Project
                                </Button>
                            </Link>
                        </Box>
                    </Box>

                    {/* Mobile menu button */}
                    <IconButton
                        onClick={() => dispatch(toggleMobileMenu())}
                        sx={{ display: { lg: 'none' }, color: 'black' }}
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
                        backgroundColor: '#fff',
                    }
                }}
            >
                <Box className="h-full flex flex-col">
                    <Box className="flex justify-between items-center p-6 border-b">
                        <Typography variant="h6" className="font-medium">
                            Menu
                        </Typography>
                        <IconButton onClick={() => dispatch(toggleMobileMenu())}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Box className="flex-1 p-6 overflow-y-auto">
                        {/* Main Navigation */}
                        {navigation.map((item, index) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    to={item.href}
                                    onClick={() => dispatch(toggleMobileMenu())}
                                    className="no-underline"
                                >
                                    <Box
                                        className={`py-4 border-b text-lg font-light transition-colors ${location.pathname === item.href ||
                                                (item.href === '/services' && location.pathname.startsWith('/services'))
                                                ? 'text-black font-medium'
                                                : 'text-gray-600 hover:text-black'
                                            }`}
                                    >
                                        {item.name}
                                    </Box>
                                </Link>
                            </motion.div>
                        ))}

                        {/* Mobile Quick Links */}
                        <Box className="mt-8 pt-6 border-t">
                            <Typography variant="overline" className="text-gray-400 text-xs mb-4 block">
                                Quick Links
                            </Typography>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: (navigation.length + 1) * 0.05 }}
                            >
                                <Link
                                    to="/projects"
                                    onClick={() => dispatch(toggleMobileMenu())}
                                    className="no-underline"
                                >
                                    <Box className="py-2 text-gray-600 font-light hover:text-black transition-colors">
                                        View Our Work
                                    </Box>
                                </Link>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: (navigation.length + 2) * 0.05 }}
                            >
                                <Link
                                    to="/about"
                                    onClick={() => dispatch(toggleMobileMenu())}
                                    className="no-underline"
                                >
                                    <Box className="py-2 text-gray-600 font-light hover:text-black transition-colors">
                                        About Our Team
                                    </Box>
                                </Link>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: (navigation.length + 3) * 0.05 }}
                            >
                                <Link
                                    to="/services"
                                    onClick={() => dispatch(toggleMobileMenu())}
                                    className="no-underline"
                                >
                                    <Box className="py-2 text-gray-600 font-light hover:text-black transition-colors">
                                        Our Services
                                    </Box>
                                </Link>
                            </motion.div>
                        </Box>
                    </Box>

                    {/* Mobile CTA Button */}
                    <Box className="p-6 border-t bg-gray-50">
                        <Link
                            to="/contact"
                            onClick={() => dispatch(toggleMobileMenu())}
                            className="no-underline"
                        >
                            <Button
                                variant="contained"
                                fullWidth
                                className="bg-black hover:bg-gray-900 text-white rounded-none py-3 text-base font-light tracking-wide normal-case"
                                sx={{
                                    boxShadow: 'none',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                        transform: 'translateY(-1px)'
                                    }
                                }}
                            >
                                Start a Project
                            </Button>
                        </Link>

                        {/* Mobile Contact Info */}
                        <Box className="mt-4 text-center">
                            <Typography variant="caption" color="text.secondary">
                                Ready to discuss your project?
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                                Let's create something amazing together
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Drawer>

            {/* Spacer */}
            <Toolbar sx={{ minHeight: { xs: 80, md: 96 } }} />
        </>
    )
}

export default Header