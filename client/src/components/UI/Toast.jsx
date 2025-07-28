// src/components/UI/Toast.jsx - Enhanced version
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Box, IconButton, Typography } from '@mui/material'
import {
    Close,
    CheckCircle,
    Error,
    Warning,
    Info
} from '@mui/icons-material'
import { removeToast } from '@/store/slices/toastSlice'

const Toast = () => {
    const toasts = useSelector(state => state.toast.toasts)
    const dispatch = useDispatch()

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle />
            case 'error':
                return <Error />
            case 'warning':
                return <Warning />
            default:
                return <Info />
        }
    }

    const getGradient = (type) => {
        switch (type) {
            case 'success':
                return 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            case 'error':
                return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            case 'warning':
                return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
            default:
                return 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
        }
    }

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 24,
                right: 24,
                zIndex: 9999,
                maxWidth: 400,
            }}
        >
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 100, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.8 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 40
                        }}
                        style={{ marginBottom: 16 }}
                    >
                        <Box
                            className="glass"
                            sx={{
                                p: 2,
                                pr: 1,
                                display: 'flex',
                                alignItems: 'center',
                                minWidth: 300,
                                borderRadius: 2,
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                    background: getGradient(toast.type),
                                }
                            }}
                        >
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 1.5,
                                    background: getGradient(toast.type),
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 2,
                                    flexShrink: 0,
                                }}
                            >
                                {getIcon(toast.type)}
                            </Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    flex: 1,
                                    color: '#1a1a1a',
                                    fontWeight: 500,
                                }}
                            >
                                {toast.message}
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() => dispatch(removeToast(toast.id))}
                                sx={{
                                    ml: 1,
                                    '&:hover': {
                                        backgroundColor: 'rgba(0,0,0,0.05)',
                                    }
                                }}
                            >
                                <Close fontSize="small" />
                            </IconButton>
                        </Box>
                    </motion.div>
                ))}
            </AnimatePresence>
        </Box>
    )
}

export default Toast