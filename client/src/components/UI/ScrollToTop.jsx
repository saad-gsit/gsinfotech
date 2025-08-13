// src/components/UI/ScrollToTop.jsx
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconButton } from '@mui/material'
import { KeyboardArrowUp } from '@mui/icons-material'

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
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1]
                    }}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        zIndex: 1000,
                    }}
                >
                    <div style={{ position: 'relative' }}>
                        {/* Progress ring */}
                        <svg
                            style={{
                                position: 'absolute',
                                top: -3,
                                left: -3,
                                width: 54,
                                height: 54,
                                transform: 'rotate(-90deg)',
                            }}
                        >
                            <circle
                                cx="27"
                                cy="27"
                                r="24"
                                stroke="var(--stone-200)"
                                strokeWidth="2"
                                fill="none"
                            />
                            <motion.circle
                                cx="27"
                                cy="27"
                                r="24"
                                stroke="var(--sage-400)"
                                strokeWidth="2"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 24}`}
                                strokeDashoffset={`${2 * Math.PI * 24 * (1 - scrollProgress / 100)}`}
                                strokeLinecap="round"
                                transition={{ duration: 0.3 }}
                            />
                        </svg>

                        {/* Button */}
                        <IconButton
                            onClick={scrollToTop}
                            sx={{
                                width: 48,
                                height: 48,
                                backgroundColor: 'white',
                                color: 'var(--sage-600)',
                                boxShadow: '0 8px 25px -8px rgba(157, 176, 130, 0.3)',
                                border: '1px solid var(--stone-100)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: 'var(--sage-400)',
                                    color: 'white',
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 12px 35px -8px rgba(157, 176, 130, 0.4)',
                                }
                            }}
                        >
                            <KeyboardArrowUp />
                        </IconButton>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// Alternative minimalist version matching your theme
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
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        zIndex: 1000,
                    }}
                >
                    <IconButton
                        onClick={scrollToTop}
                        sx={{
                            width: 44,
                            height: 44,
                            backgroundColor: 'var(--sage-400)',
                            color: 'white',
                            borderRadius: '50%',
                            boxShadow: '0 4px 20px -4px rgba(157, 176, 130, 0.4)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: 'var(--sage-500)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 30px -4px rgba(157, 176, 130, 0.5)',
                            }
                        }}
                    >
                        <KeyboardArrowUp />
                    </IconButton>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// Elegant floating version with your theme
export const FloatingScrollToTop = () => {
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
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: [0, -8, 0] // Floating animation
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{
                        y: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }
                    }}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        zIndex: 1000,
                    }}
                >
                    <motion.button
                        onClick={scrollToTop}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, var(--sage-400) 0%, var(--sage-500) 100%)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 25px -8px rgba(157, 176, 130, 0.4)',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Shimmer effect */}
                        <motion.div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                            }}
                            animate={{
                                left: '100%'
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        <KeyboardArrowUp style={{ fontSize: 24 }} />
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default ScrollToTop