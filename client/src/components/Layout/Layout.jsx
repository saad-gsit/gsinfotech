import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Box } from '@mui/material'
import Header from './Header'
import Footer from './Footer'
import { useEffect } from 'react'

const Layout = ({ children }) => {
    const location = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [location.pathname])

    return (
        <Box className="min-h-screen flex flex-col bg-white antialiased">
            <Header />

            <AnimatePresence mode="wait">
                <motion.main
                    key={location.pathname}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="flex-1"
                >
                    {children || <Outlet />}
                </motion.main>
            </AnimatePresence>

            <Footer />
        </Box>
    )
}

export default Layout