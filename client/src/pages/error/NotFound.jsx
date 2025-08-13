import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
    Box,
    Container,
    Typography,
    Button,
    Stack,
} from '@mui/material'
import {
    HomeOutlined,
    SupportAgentOutlined,
    ArrowOutward,
    SentimentDissatisfiedOutlined
} from '@mui/icons-material'

const NotFound = () => {
    const { scrollY } = useScroll()
    const y1 = useTransform(scrollY, [0, 300], [0, 30])
    const y2 = useTransform(scrollY, [0, 300], [0, -20])

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'white'
            }}
        >
            {/* Background Elements */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, var(--sand-50) 0%, var(--sage-50) 50%, var(--coral-50) 100%)',
                    opacity: 0.5,
                }}
            />

            {/* Floating Elements */}
            <motion.div
                style={{ y: y1 }}
                className="absolute top-20 right-10 w-72 h-72 rounded-full"
                sx={{
                    background: 'radial-gradient(circle, var(--sage-400) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    opacity: 0.3,
                }}
            />
            <motion.div
                style={{ y: y2 }}
                className="absolute bottom-20 left-10 w-64 h-64 rounded-full"
                sx={{
                    background: 'radial-gradient(circle, var(--coral-400) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    opacity: 0.3,
                }}
            />

            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                        <Box
                            sx={{
                                width: 120,
                                height: 120,
                                backgroundColor: 'var(--sage-50)',
                                borderRadius: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 4,
                                boxShadow: '0 10px 30px -10px rgba(157, 176, 130, 0.3)',
                            }}
                        >
                            <SentimentDissatisfiedOutlined
                                sx={{
                                    fontSize: 64,
                                    color: 'var(--sage-400)',
                                }}
                            />
                        </Box>
                    </motion.div>

                    {/* 404 Text */}
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: '6rem', sm: '8rem', md: '10rem' },
                            fontWeight: 300,
                            lineHeight: 0.8,
                            letterSpacing: '-0.02em',
                            mb: 3,
                            background: 'linear-gradient(135deg, var(--sage-400) 0%, var(--coral-400) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            position: 'relative',
                        }}
                    >
                        404
                    </Typography>

                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                            fontWeight: 300,
                            mb: 3,
                            color: 'var(--stone-800)',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Oops! Page not found
                    </Typography>

                    <Typography
                        variant="h6"
                        sx={{
                            color: 'var(--stone-600)',
                            fontWeight: 300,
                            lineHeight: 1.6,
                            mb: 6,
                            maxWidth: '600px',
                            mx: 'auto',
                            fontSize: { xs: '1rem', md: '1.25rem' }
                        }}
                    >
                        The page you're looking for seems to have wandered off.
                        Don't worry, even the best of us get lost sometimes.
                    </Typography>

                    {/* Action Buttons */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={3}
                        justifyContent="center"
                        sx={{ mb: 6 }}
                    >
                        <Link to="/" className="no-underline">
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<HomeOutlined />}
                                sx={{
                                    backgroundColor: 'var(--sage-400)',
                                    color: 'white',
                                    borderRadius: '50px',
                                    px: 5,
                                    py: 2,
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    letterSpacing: '0.025em',
                                    textTransform: 'none',
                                    boxShadow: '0 8px 25px -8px rgba(157, 176, 130, 0.4)',
                                    transition: 'all 0.4s ease',
                                    '&:hover': {
                                        backgroundColor: 'var(--sage-500)',
                                        transform: 'translateY(-3px)',
                                        boxShadow: '0 12px 35px -8px rgba(157, 176, 130, 0.5)'
                                    }
                                }}
                            >
                                Back to Home
                            </Button>
                        </Link>

                        <Link to="/contact" className="no-underline">
                            <Button
                                variant="outlined"
                                size="large"
                                startIcon={<SupportAgentOutlined />}
                                endIcon={<ArrowOutward sx={{ fontSize: 16 }} />}
                                sx={{
                                    borderColor: 'var(--stone-300)',
                                    color: 'var(--stone-700)',
                                    borderRadius: '50px',
                                    px: 5,
                                    py: 2,
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    letterSpacing: '0.025em',
                                    textTransform: 'none',
                                    transition: 'all 0.4s ease',
                                    '&:hover': {
                                        borderColor: 'var(--coral-400)',
                                        backgroundColor: 'var(--coral-50)',
                                        color: 'var(--coral-600)',
                                        transform: 'translateY(-2px)',
                                    }
                                }}
                            >
                                Contact Support
                            </Button>
                        </Link>
                    </Stack>

                    {/* Helpful Links */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'var(--stone-500)',
                                mb: 2,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                            }}
                        >
                            Maybe try these instead?
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={3}
                            justifyContent="center"
                            flexWrap="wrap"
                            sx={{
                                '& a': {
                                    color: 'var(--sage-600)',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    '&:hover': {
                                        color: 'var(--sage-400)',
                                    },
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        width: '0%',
                                        height: '1px',
                                        bottom: '-2px',
                                        left: '50%',
                                        backgroundColor: 'var(--sage-400)',
                                        transition: 'all 0.3s ease',
                                        transform: 'translateX(-50%)',
                                    },
                                    '&:hover::after': {
                                        width: '100%',
                                    }
                                }
                            }}
                        >
                            <Link to="/projects">Projects</Link>
                            <Link to="/services">Services</Link>
                            <Link to="/about">About</Link>
                            <Link to="/blog">Blog</Link>
                        </Stack>
                    </motion.div>

                    {/* Decorative Element */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        style={{ marginTop: '4rem' }}
                    >
                        <Box
                            sx={{
                                width: 200,
                                height: 4,
                                background: 'linear-gradient(90deg, transparent 0%, var(--sage-200) 50%, transparent 100%)',
                                mx: 'auto',
                                borderRadius: '2px',
                            }}
                        />
                    </motion.div>
                </motion.div>
            </Container>

            {/* Bottom Pattern */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '200px',
                    background: 'linear-gradient(to top, var(--sage-50) 0%, transparent 100%)',
                    opacity: 0.5,
                    pointerEvents: 'none',
                }}
            />
        </Box>
    )
}

export default NotFound