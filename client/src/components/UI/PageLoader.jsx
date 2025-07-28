// client/src/components/UI/PageLoader.jsx - Fixed version
import React from 'react';
import { motion } from 'framer-motion';
import { Box, CircularProgress, Typography } from '@mui/material';

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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                zIndex: 9999,
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    textAlign: 'center',
                    color: 'white',
                }}
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{ marginBottom: 24 }}
                >
                    <CircularProgress
                        size={60}
                        thickness={4}
                        sx={{
                            color: 'white',
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                        }}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        GS Infotech
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Loading your experience...
                    </Typography>
                </motion.div>
            </motion.div>
        </Box>
    );
};

export default PageLoader;