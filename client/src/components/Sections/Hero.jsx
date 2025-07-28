import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Stack,
    Chip
} from '@mui/material'
import {
    EastOutlined,
    AutoAwesomeOutlined,
    SpeedOutlined,
    WorkspacePremiumOutlined,
    RocketLaunchOutlined
} from '@mui/icons-material'


const Hero = () => {
    const { scrollY } = useScroll()
    const y1 = useTransform(scrollY, [0, 300], [0, 50])
    const y2 = useTransform(scrollY, [0, 300], [0, -30])

    const stats = [
        { value: '250+', label: 'Projects Delivered' },
        { value: '10+', label: 'Years Experience' },
        { value: '95%', label: 'Client Satisfaction' }
    ]

    const highlights = [
        { icon: <SpeedOutlined />, text: 'Fast Delivery' },
        { icon: <WorkspacePremiumOutlined />, text: 'Premium Quality' }
    ]

    return (
        <section className="min-h-screen flex items-center relative overflow-hidden bg-white">
            {/* Subtle background elements */}
            <motion.div
                style={{ y: y1 }}
                className="absolute top-1/4 right-0 w-96 h-96 bg-gray-100 rounded-full opacity-50 blur-3xl"
            />
            <motion.div
                style={{ y: y2 }}
                className="absolute bottom-0 left-0 w-72 h-72 bg-gray-50 rounded-full opacity-50 blur-3xl"
            />

            <Container maxWidth="lg" className="relative z-10">
                <Grid container spacing={8} alignItems="center">
                    <Grid item xs={12} lg={7}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            {/* Minimal badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-block mb-8"
                            >
                                <Chip
                                    icon={<AutoAwesomeOutlined sx={{ fontSize: 16 }} />}
                                    label="Digital Innovation Studio"
                                    size="small"
                                    className="bg-black text-white font-light px-3"
                                    sx={{ borderRadius: 0 }}
                                />
                            </motion.div>

                            <Typography
                                variant="h1"
                                className="text-5xl md:text-6xl lg:text-7xl font-light mb-6 leading-[1.1] tracking-tight"
                            >
                                We build digital
                                <br />
                                products that
                                <br />
                                <span className="font-semibold">make impact</span>
                            </Typography>

                            <Typography
                                variant="h5"
                                className="text-gray-600 mb-10 font-light max-w-xl leading-relaxed"
                            >
                                Transform your vision into exceptional digital experiences
                                with our expertise in strategy, design, and development.
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} className="mb-16">
                                <Link to="/contact" className="no-underline">
                                    <Button
                                        variant="contained"
                                        size="large"
                                        endIcon={<EastOutlined />}
                                        className="bg-black hover:bg-gray-900 text-white rounded-none px-8 py-4 text-base font-light tracking-wide normal-case"
                                        sx={{
                                            '&:hover': {
                                                transform: 'translateX(4px)',
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Start a Project
                                    </Button>
                                </Link>

                                <Link to="/projects" className="no-underline">
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        className="border-black text-black hover:bg-black hover:text-white rounded-none px-8 py-4 text-base font-light tracking-wide normal-case"
                                    >
                                        View Our Work
                                    </Button>
                                </Link>
                            </Stack>

                            {/* Minimal stats */}
                            <Grid container spacing={4}>
                                {stats.map((stat, index) => (
                                    <Grid item xs={4} key={index}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 + index * 0.1 }}
                                        >
                                            <Typography variant="h3" className="font-light mb-1">
                                                {stat.value}
                                            </Typography>
                                            <Typography variant="caption" className="text-gray-500 uppercase tracking-wider text-xs">
                                                {stat.label}
                                            </Typography>
                                        </motion.div>
                                    </Grid>
                                ))}
                            </Grid>
                        </motion.div>
                    </Grid>

                    <Grid item xs={12} lg={5}>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            {/* Main visual element */}
                            <Box className="relative">
                                <Box className="bg-black rounded-lg p-12 relative overflow-hidden">
                                    {/* Subtle pattern */}
                                    <Box
                                        className="absolute inset-0 opacity-10"
                                        sx={{
                                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`
                                        }}
                                    />

                                    {/* Central icon */}
                                    <motion.div
                                        animate={{
                                            rotate: 360,
                                        }}
                                        transition={{
                                            duration: 20,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                        className="relative z-10"
                                    >
                                        <RocketLaunchOutlined
                                            className="text-white mx-auto"
                                            sx={{ fontSize: 120 }}
                                        />
                                    </motion.div>
                                </Box>

                                {/* Floating cards */}
                                {highlights.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        whileHover={{ scale: 1.05 }}
                                        className={`absolute ${index === 0
                                                ? '-top-4 -left-4'
                                                : '-bottom-4 -right-4'
                                            } bg-white border border-gray-200 p-4 shadow-lg`}
                                    >
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Box className="text-black">
                                                {item.icon}
                                            </Box>
                                            <Typography variant="body2" className="font-medium">
                                                {item.text}
                                            </Typography>
                                        </Stack>
                                    </motion.div>
                                ))}
                            </Box>
                        </motion.div>
                    </Grid>
                </Grid>
            </Container>
        </section>
    )
}

export default Hero