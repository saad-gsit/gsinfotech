import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
    Container,
    Typography,
    Box,
    Grid,
    Stack,
    Divider,
    Link,
    Button
} from '@mui/material'
import {
    RocketLaunchOutlined,
    SpeedOutlined,
    AutoAwesomeOutlined,
    TrendingUpOutlined,
    GroupsOutlined,
    EmojiObjectsOutlined
} from '@mui/icons-material'

const About = () => {
    const stats = [
        { number: '10+', label: 'Years Experience' },
        { number: '250+', label: 'Projects Delivered' },
        { number: '50+', label: 'Team Members' },
        { number: '95%', label: 'Client Retention' }
    ]

    const values = [
        {
            icon: <RocketLaunchOutlined sx={{ fontSize: 32 }} />,
            title: 'Innovation First',
            description: 'We embrace cutting-edge technologies to build solutions that define the future.'
        },
        {
            icon: <SpeedOutlined sx={{ fontSize: 32 }} />,
            title: 'Performance Focused',
            description: 'Every line of code is optimized for speed, scalability, and reliability.'
        },
        {
            icon: <AutoAwesomeOutlined sx={{ fontSize: 32 }} />,
            title: 'Design Excellence',
            description: 'We craft experiences that are not just functional but truly delightful.'
        }
    ]

    const process = [
        { step: '01', title: 'Listen', description: 'We start by understanding your vision and goals.' },
        { step: '02', title: 'Strategy', description: 'We develop a roadmap aligned with your objectives.' },
        { step: '03', title: 'Execute', description: 'We bring ideas to life with precision and care.' },
        { step: '04', title: 'Iterate', description: 'We continuously improve based on real feedback.' }
    ]

    return (
    <>
            <Helmet>
                <title>About - GS Infotech | Digital Innovation Studio</title>
                <meta name="description" content="We are a digital innovation studio that combines strategy, design, and technology to create products that matter." />
            </Helmet>

            {/* Hero Section */}
            <section className="min-h-[60vh] flex items-center bg-white">
                <Container maxWidth="lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Typography variant="overline" className="text-gray-500 tracking-widest mb-4">
                            ABOUT US
                        </Typography>
                        <Typography variant="h1" className="text-5xl md:text-6xl lg:text-7xl font-light mb-6 leading-tight">
                            We are a team of
                            <br />
                            <span className="font-semibold">digital innovators</span>
                        </Typography>
                        <Typography variant="h5" className="text-gray-600 font-light max-w-3xl leading-relaxed">
                            Combining strategy, design, and technology to create digital products
                            that make a meaningful impact on businesses and their users.
                        </Typography>
                    </motion.div>
                </Container>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gray-50">
                <Container maxWidth="lg">
                    <Grid container spacing={0}>
                        {stats.map((stat, index) => (
                            <Grid item xs={6} md={3} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Box
                                        className="text-center py-8"
                                        sx={{
                                            borderRight: index < stats.length - 1 ? '1px solid #e5e7eb' : 'none',
                                            '@media (max-width: 900px)': {
                                                borderRight: index % 2 === 0 ? '1px solid #e5e7eb' : 'none',
                                                borderBottom: index < 2 ? '1px solid #e5e7eb' : 'none'
                                            }
                                        }}
                                    >
                                        <Typography variant="h2" className="font-light mb-2">
                                            {stat.number}
                                        </Typography>
                                        <Typography variant="body2" className="text-gray-600 uppercase tracking-wider text-xs">
                                            {stat.label}
                                        </Typography>
                                    </Box>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-white">
                <Container maxWidth="lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="mb-16"
                    >
                        <Typography variant="h2" className="text-4xl md:text-5xl font-light mb-6">
                            Our Core Values
                        </Typography>
                        <Typography variant="h6" className="text-gray-600 font-light max-w-2xl">
                            The principles that guide every decision we make and every product we create.
                        </Typography>
                    </motion.div>

                    <Grid container spacing={6}>
                        {values.map((value, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Box className="h-full">
                                        <Box className="mb-6">
                                            {value.icon}
                                        </Box>
                                        <Typography variant="h5" className="font-medium mb-3">
                                            {value.title}
                                        </Typography>
                                        <Typography variant="body1" className="text-gray-600 leading-relaxed">
                                            {value.description}
                                        </Typography>
                                    </Box>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </section>

            {/* Process Section */}
            <section className="py-20 bg-black text-white">
                <Container maxWidth="lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="mb-16"
                    >
                        <Typography variant="h2" className="text-4xl md:text-5xl font-light mb-6">
                            Our Process
                        </Typography>
                        <Typography variant="h6" className="text-gray-400 font-light max-w-2xl">
                            A proven approach to delivering exceptional results.
                        </Typography>
                    </motion.div>

                    <Grid container spacing={4}>
                        {process.map((item, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Box className="relative">
                                        <Typography variant="h1" className="text-8xl font-light text-gray-800 mb-4">
                                            {item.step}
                                        </Typography>
                                        <Typography variant="h6" className="font-medium mb-2">
                                            {item.title}
                                        </Typography>
                                        <Typography variant="body2" className="text-gray-400">
                                            {item.description}
                                        </Typography>
                                    </Box>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gray-50">
                <Container maxWidth="md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <Typography variant="h3" className="font-light mb-6">
                            Ready to work together?
                        </Typography>
                        <Typography variant="h6" className="text-gray-600 font-light mb-8">
                            Let's create something extraordinary.
                        </Typography>
                        <Stack direction="row" spacing={3} justifyContent="center">
                            <Link to="/contact" className="no-underline">
                                <Button
                                    variant="contained"
                                    size="large"
                                    className="bg-black hover:bg-gray-900 text-white rounded-none px-8 py-3 font-light tracking-wide normal-case"
                                >
                                    Start a Conversation
                                </Button>
                            </Link>
                            <Link to="/projects" className="no-underline">
                                <Button
                                    variant="outlined"
                                    size="large"
                                    className="border-black text-black hover:bg-black hover:text-white rounded-none px-8 py-3 font-light tracking-wide normal-case"
                                >
                                    View Our Work
                                </Button>
                            </Link>
                        </Stack>
                    </motion.div>
                </Container>
            </section>
        </>
    )
}

export default About