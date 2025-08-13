// client/src/components/UI/PageLoader.jsx - Redesigned version
import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';

const PageLoader = () => {
    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--sand-50) 0%, var(--sage-50) 50%, var(--coral-50) 100%)',
                backdropFilter: 'blur(20px)',
                zIndex: 9999,
            }}
        >
            {/* Blur overlay */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(10px)',
                }}
            />

            {/* Floating background elements */}
            <motion.div
                animate={{
                    x: [0, 30, 0],
                    y: [0, -20, 0],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    position: 'absolute',
                    top: '20%',
                    right: '20%',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, var(--sage-400) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    opacity: 0.5,
                }}
            />
            <motion.div
                animate={{
                    x: [0, -20, 0],
                    y: [0, 30, 0],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
                style={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '20%',
                    width: '250px',
                    height: '250px',
                    background: 'radial-gradient(circle, var(--coral-400) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    opacity: 0.5,
                }}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {/* Custom loader */}
                <Box sx={{ position: 'relative', width: 80, height: 80, mx: 'auto', mb: 4 }}>
                    {/* Outer ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '3px solid transparent',
                            borderTopColor: 'var(--sage-400)',
                            borderRightColor: 'var(--sage-300)',
                        }}
                    />

                    {/* Middle ring */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        style={{
                            position: 'absolute',
                            inset: '10px',
                            borderRadius: '50%',
                            border: '3px solid transparent',
                            borderTopColor: 'var(--coral-400)',
                            borderBottomColor: 'var(--coral-300)',
                        }}
                    />

                    {/* Inner dot */}
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        style={{
                            position: 'absolute',
                            inset: '25px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--sage-400) 0%, var(--coral-400) 100%)',
                            boxShadow: '0 8px 25px -8px rgba(157, 176, 130, 0.4)',
                        }}
                    />
                </Box>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            mb: 1.5,
                            background: 'linear-gradient(135deg, var(--sage-600) 0%, var(--sage-400) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        GS Infotech
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                        <motion.div
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'var(--stone-600)',
                                    fontWeight: 300,
                                    letterSpacing: '0.05em',
                                }}
                            >
                                Loading
                            </Typography>
                        </motion.div>

                        {/* Animated dots */}
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {[0, 0.2, 0.4].map((delay, index) => (
                                <motion.span
                                    key={index}
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: delay,
                                        ease: "easeInOut"
                                    }}
                                    style={{
                                        display: 'inline-block',
                                        width: 4,
                                        height: 4,
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--sage-400)',
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                </motion.div>
            </motion.div>

            {/* Progress bar at bottom */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    overflow: 'hidden',
                }}
            >
                <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, var(--sage-400), transparent)',
                    }}
                />
            </Box>
        </Box>
    );
};

export default PageLoader;