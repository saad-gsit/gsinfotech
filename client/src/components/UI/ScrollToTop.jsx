// src/components/UI/ScrollToTop.jsx
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconButton, Tooltip } from '@mui/material'
import { KeyboardArrowUp, RocketLaunch } from '@mui/icons-material'

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false)
    const [scrollProgress, setScrollProgress] = useState(0)

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button when page is scrolled more than 300px
            if (window.pageYOffset > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }

            // Calculate scroll progress
            const windowHeight = window.innerHeight
            const documentHeight = document.documentElement.scrollHeight - windowHeight
            const scrolled = window.scrollY
            const progress = (scrolled / documentHeight) * 100
            setScrollProgress(progress)
        }

        window.addEventListener('scroll', toggleVisibility)
        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 100 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 100 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20
                    }}
                    className="fixed bottom-8 right-8 z-40"
                >
                    <Tooltip title="Back to top" placement="left" arrow>
                        <div className="relative group">
                            {/* Progress ring */}
                            <svg className="absolute inset-0 w-14 h-14 transform -rotate-90">
                                <circle
                                    cx="28"
                                    cy="28"
                                    r="25"
                                    stroke="rgba(229, 231, 235, 0.5)"
                                    strokeWidth="3"
                                    fill="none"
                                />
                                <motion.circle
                                    cx="28"
                                    cy="28"
                                    r="25"
                                    stroke="url(#gradient)"
                                    strokeWidth="3"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 25}`}
                                    strokeDashoffset={`${2 * Math.PI * 25 * (1 - scrollProgress / 100)}`}
                                    strokeLinecap="round"
                                    transition={{ duration: 0.3 }}
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            {/* Button */}
                            <motion.button
                                onClick={scrollToTop}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="relative w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center overflow-hidden group"
                            >
                                {/* Hover effect */}
                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />

                                {/* Icon */}
                                <KeyboardArrowUp
                                    className="transform group-hover:translate-y-[-2px] transition-transform duration-300"
                                    sx={{ fontSize: 28 }}
                                />
                            </motion.button>
                        </div>
                    </Tooltip>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// Alternative minimalist version
export const MinimalScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.pageYOffset > 300)
        }

        window.addEventListener('scroll', toggleVisibility)
        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-40 w-12 h-12 bg-black text-white rounded-none shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                >
                    <KeyboardArrowUp className="transform group-hover:translate-y-[-2px] transition-transform duration-200" />
                </motion.button>
            )}
        </AnimatePresence>
    )
}

// Alternative rocket version (fun variant)
export const RocketScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false)
    const [isLaunching, setIsLaunching] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.pageYOffset > 300)
        }

        window.addEventListener('scroll', toggleVisibility)
        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [])

    const scrollToTop = () => {
        setIsLaunching(true)
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
            setTimeout(() => setIsLaunching(false), 500)
        }, 300)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: isLaunching ? -100 : 0,
                        rotate: isLaunching ? -45 : 0
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20
                    }}
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                >
                    <RocketLaunch
                        className={`transform transition-all duration-300 ${isLaunching ? 'scale-125' : 'group-hover:scale-110'}`}
                        sx={{ fontSize: 24 }}
                    />

                    {/* Launch effect */}
                    {isLaunching && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 3 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white rounded-full"
                        />
                    )}
                </motion.button>
            )}
        </AnimatePresence>
    )
}

export default ScrollToTop