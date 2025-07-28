// client/src/pages/admin/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton
} from '@mui/material';
import {
    Email,
    Lock,
    Visibility,
    VisibilityOff,
    AdminPanelSettings
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth } from '../../store/slices/authSlice';
import { loginAdmin } from '../../store/slices/authThunks';

// Validation schema
const loginSchema = yup.object({
    email: yup
        .string()
        .email('Please enter a valid email')
        .required('Email is required'),
    password: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required')
});

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, loading, error } = useSelector(selectAuth);
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    // Redirect if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: yupResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const onSubmit = async (data) => {
        try {
            setLocalError('');
            const resultAction = await dispatch(loginAdmin(data));

            if (loginAdmin.fulfilled.match(resultAction)) {
                navigate('/admin/dashboard');
            } else {
                setLocalError(resultAction.payload || 'Login failed. Please try again.');
            }
        } catch (err) {
            setLocalError(err.message || 'Login failed. Please try again.');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 2
            }}
        >
            {/* Background pattern */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
          `,
                    zIndex: 1
                }}
            />

            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Paper
                        elevation={24}
                        sx={{
                            padding: 6,
                            borderRadius: 4,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                    >
                        {/* Header */}
                        <Box textAlign="center" mb={4}>
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        borderRadius: 3,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto',
                                        mb: 3,
                                        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                                    }}
                                >
                                    <AdminPanelSettings sx={{ fontSize: 40, color: 'white' }} />
                                </Box>
                            </motion.div>

                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1
                                }}
                            >
                                Admin Portal
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Sign in to manage your website
                            </Typography>
                        </Box>

                        {/* Error Alert */}
                        {(error || localError) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                    {error || localError}
                                </Alert>
                            </motion.div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Box mb={3}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    type="email"
                                    {...register('email')}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': {
                                                borderColor: '#667eea',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#667eea',
                                            },
                                        },
                                    }}
                                />
                            </Box>

                            <Box mb={4}>
                                <TextField
                                    fullWidth
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock color="action" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={togglePasswordVisibility}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': {
                                                borderColor: '#667eea',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#667eea',
                                            },
                                        },
                                    }}
                                />
                            </Box>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={isSubmitting || loading}
                                    sx={{
                                        height: 56,
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #5a67d8 0%, #6b46a1 100%)',
                                            boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)',
                                        },
                                        '&:disabled': {
                                            background: 'rgba(0, 0, 0, 0.12)',
                                        },
                                    }}
                                >
                                    {isSubmitting || loading ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>
                            </motion.div>
                        </form>

                        {/* Footer */}
                        <Box textAlign="center" mt={4}>
                            <Typography variant="body2" color="text.secondary">
                                Protected by advanced security measures
                            </Typography>
                        </Box>
                    </Paper>
                </motion.div>

                {/* Floating elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '10%',
                        left: '10%',
                        width: 60,
                        height: 60,
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '50%',
                        animation: 'float 6s ease-in-out infinite',
                        zIndex: 1,
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: '15%',
                        right: '15%',
                        width: 40,
                        height: 40,
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '50%',
                        animation: 'float 4s ease-in-out infinite reverse',
                        zIndex: 1,
                    }}
                />
            </Container>

            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
        </Box>
    );
};

export default Login;