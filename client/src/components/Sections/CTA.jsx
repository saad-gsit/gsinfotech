import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Box,
    Container,
    Typography,
    Button,
    Stack
} from '@mui/material'
import { EastOutlined, AutoAwesomeOutlined } from '@mui/icons-material'

const CTA = () => {
    return (
        <section className="relative overflow-hidden">
            {/* Main CTA - Black background with subtle texture */}
            <Box className="bg-black text-white py-32 relative">
                {/* Subtle grid pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03]">
                    <div className="absolute h-full w-full" style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }} />
                </div>

                {/* Gradient accent - very subtle */}
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-5">
                    <div className="absolute inset-0 bg-gradient-to-l from-white to-transparent" />
                </div>

                <Container maxWidth="md" className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        {/* Small accent */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 mb-8"
                        >
                            <AutoAwesomeOutlined className="text-white/60" sx={{ fontSize: 20 }} />
                            <Typography variant="overline" className="text-white/60 tracking-[0.2em] font-light">
                                LET'S COLLABORATE
                            </Typography>
                            <AutoAwesomeOutlined className="text-white/60" sx={{ fontSize: 20 }} />
                        </motion.div>

                        {/* Main heading */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Typography
                                variant="h2"
                                className="text-5xl md:text-6xl lg:text-7xl font-light mb-8 leading-[0.95]"
                            >
                                Ready to create
                                <br />
                                something{' '}
                                <span className="font-semibold italic">extraordinary?</span>
                            </Typography>
                        </motion.div>

                        {/* Subtext */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            <Typography
                                variant="h6"
                                className="text-gray-400 mb-12 font-light max-w-2xl mx-auto leading-relaxed"
                            >
                                Let's transform your vision into reality.
                                Work with us to build digital experiences that matter.
                            </Typography>
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            viewport={{ once: true }}
                        >
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={3}
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Link to="/contact" className="no-underline">
                                    <Button
                                        variant="contained"
                                        size="large"
                                        endIcon={<EastOutlined />}
                                        className="bg-white text-black hover:bg-gray-100 rounded-none px-10 py-4 text-base font-light tracking-wide normal-case shadow-none min-w-[220px]"
                                        sx={{
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 10px 30px rgba(255,255,255,0.1)'
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
                                        className="border-white/30 text-white hover:bg-white hover:text-black hover:border-white rounded-none px-10 py-4 text-base font-light tracking-wide normal-case min-w-[220px]"
                                        sx={{
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        View Our Work
                                    </Button>
                                </Link>
                            </Stack>
                        </motion.div>

                        {/* Bottom accent line */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            viewport={{ once: true }}
                            className="mt-20 mx-auto w-24 h-px bg-white/20"
                        />
                    </motion.div>
                </Container>
            </Box>

            {/* Alternative minimal design - White background version */}
            {/* Uncomment to use this version instead */}
            {/* 
            <Box className="bg-white py-32 relative">
                <Container maxWidth="md" className="text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <Typography 
                            variant="h2" 
                            className="text-6xl md:text-7xl font-light mb-8 leading-tight"
                        >
                            Let's work
                            <br />
                            <span className="font-semibold">together</span>
                        </Typography>

                        <Typography 
                            variant="h6" 
                            className="text-gray-600 mb-12 font-light max-w-xl mx-auto"
                        >
                            Ready to take the next step? We're here to help bring your ideas to life.
                        </Typography>

                        <Link to="/contact" className="no-underline">
                            <Button
                                variant="contained"
                                size="large"
                                endIcon={<EastOutlined />}
                                className="bg-black hover:bg-gray-900 text-white rounded-none px-12 py-4 text-lg font-light tracking-wide normal-case shadow-none"
                            >
                                Get in Touch
                            </Button>
                        </Link>
                    </motion.div>
                </Container>
            </Box>
            */}
        </section>
    )
}

export default CTA