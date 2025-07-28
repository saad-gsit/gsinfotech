import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
    Container,
    Typography,
    Box,
    Grid,
    Stack,
    IconButton,
    Skeleton,
    Avatar,
    Chip,
    Alert
} from '@mui/material'
import {
    LinkedIn,
    Twitter,
    GitHub,
    Language,
    Email,
    Refresh
} from '@mui/icons-material'
import { useTeam } from '@/hooks/useApi'
import { Link } from 'react-router-dom'
import Button from '@/components/UI/Button'

const Team = () => {
    const {
        data,
        isLoading,
        error,
        isError,
        refetch
    } = useTeam()

    const getSocialIcon = (platform) => {
        const icons = {
            linkedin: <LinkedIn />,
            twitter: <Twitter />,
            github: <GitHub />,
            website: <Language />,
            email: <Email />,
            dribbble: <Language />,
            behance: <Language />
        }
        return icons[platform.toLowerCase()] || <Language />
    }

    const TeamMemberCard = ({ member, index }) => (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
        >
            <Link to={`/team/${member.slug || member.id}`} className="no-underline">
                <Box className="text-center">
                    {/* Avatar */}
                    <Box className="relative mb-6 inline-block">
                        <Avatar
                            src={member.photo || member.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=200&background=000&color=fff`}
                            alt={member.name}
                            sx={{
                                width: 200,
                                height: 200,
                                transition: 'all 0.3s ease',
                                filter: 'grayscale(100%)',
                                '&:hover': {
                                    filter: 'grayscale(0%)',
                                    transform: 'scale(1.05)'
                                }
                            }}
                            className="mx-auto"
                            onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=200&background=000&color=fff`
                            }}
                        />

                        {/* Status Indicator */}
                        {member.is_active && (
                            <Box className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                        )}

                        {/* Leadership Badge */}
                        {member.is_leadership && (
                            <Chip
                                label="Leadership"
                                size="small"
                                className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-100 text-yellow-800"
                            />
                        )}
                    </Box>

                    {/* Info */}
                    <Typography variant="h5" className="font-medium mb-1 text-black">
                        {member.name}
                    </Typography>

                    <Typography variant="body1" className="text-gray-600 font-light mb-3">
                        {member.position || member.role}
                    </Typography>

                    {member.department && (
                        <Typography variant="caption" className="text-gray-500 uppercase tracking-wider text-xs block mb-3">
                            {member.department}
                        </Typography>
                    )}

                    {/* Bio Preview */}
                    {member.bio && (
                        <Typography variant="body2" className="text-gray-600 text-center max-w-xs mx-auto mb-4 line-clamp-2">
                            {member.bio}
                        </Typography>
                    )}

                    {/* Skills - Minimal display */}
                    {member.skills && member.skills.length > 0 && (
                        <Stack direction="row" spacing={1} justifyContent="center" className="mt-4 flex-wrap gap-y-1">
                            {member.skills.slice(0, 2).map((skill, idx) => (
                                <Chip
                                    key={idx}
                                    label={skill}
                                    size="small"
                                    className="bg-gray-100 text-gray-600 text-xs"
                                />
                            ))}
                            {member.skills.length > 2 && (
                                <Chip
                                    label={`+${member.skills.length - 2}`}
                                    size="small"
                                    className="bg-gray-100 text-gray-600 text-xs"
                                />
                            )}
                        </Stack>
                    )}

                    {/* Social Links - Show on hover */}
                    {member.social_links && Object.keys(member.social_links).length > 0 && (
                        <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                            className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                            {Object.entries(member.social_links).map(([platform, url]) => (
                                url && (
                                    <IconButton
                                        key={platform}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        size="small"
                                        className="text-gray-600 hover:text-black transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                        title={`${member.name} on ${platform}`}
                                    >
                                        {getSocialIcon(platform)}
                                    </IconButton>
                                )
                            ))}
                        </Stack>
                    )}

                    {/* Years of Experience */}
                    {member.years_experience && (
                        <Typography variant="caption" className="text-gray-500 mt-2 block">
                            {member.years_experience}+ years experience
                        </Typography>
                    )}
                </Box>
            </Link>
        </motion.div>
    )

    return (
        <>
            <Helmet>
                <title>Team - GS Infotech | Our People</title>
                <meta name="description" content="Meet the talented individuals who make up our team of developers, designers, and digital strategists." />
            </Helmet>

            {/* Hero Section */}
            <section className="pt-32 pb-16 bg-white">
                <Container maxWidth="lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Typography variant="overline" className="text-gray-500 tracking-widest mb-4">
                            OUR TEAM
                        </Typography>
                        <Typography variant="h1" className="text-5xl md:text-6xl lg:text-7xl font-light mb-6 leading-tight">
                            Meet the people
                            <br />
                            <span className="font-semibold">behind the magic</span>
                        </Typography>
                        <Typography variant="h5" className="text-gray-600 font-light max-w-3xl">
                            A diverse team of thinkers, creators, and innovators working together
                            to build exceptional digital experiences.
                        </Typography>
                    </motion.div>
                </Container>
            </section>

            {/* Team Content */}
            <section className="py-16 bg-gray-50 min-h-[60vh]">
                <Container maxWidth="lg">
                    {/* Loading State */}
                    {isLoading && (
                        <Grid container spacing={6}>
                            {[...Array(8)].map((_, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                    <Box className="text-center">
                                        <Skeleton
                                            variant="circular"
                                            width={200}
                                            height={200}
                                            className="mx-auto mb-4"
                                        />
                                        <Skeleton variant="text" width="60%" className="mx-auto" />
                                        <Skeleton variant="text" width="40%" className="mx-auto" />
                                        <Skeleton variant="text" width="80%" className="mx-auto" />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {/* Error State */}
                    {isError && (
                        <Box className="text-center py-20">
                            <Alert severity="error" className="mb-4 max-w-md mx-auto">
                                <Typography variant="h6" className="mb-2">
                                    Unable to load team members
                                </Typography>
                                <Typography variant="body2">
                                    {error?.data?.message || 'Something went wrong while fetching team data.'}
                                </Typography>
                            </Alert>
                            <Button
                                onClick={() => refetch()}
                                startIcon={<Refresh />}
                                className="text-black hover:text-gray-700 normal-case"
                            >
                                Try Again
                            </Button>
                        </Box>
                    )}

                    {/* Team Members */}
                    {!isLoading && !isError && data && (
                        <>
                            {/* Leadership Section */}
                            {data.members?.filter(m => m.is_leadership).length > 0 && (
                                <Box className="mb-16">
                                    <Typography variant="h3" className="font-light mb-8 text-center">
                                        Leadership
                                    </Typography>
                                    <Grid container spacing={6} justifyContent="center">
                                        {data.members
                                            .filter(m => m.is_leadership)
                                            .map((member, index) => (
                                                <Grid item xs={12} sm={6} md={4} key={member.id}>
                                                    <TeamMemberCard member={member} index={index} />
                                                </Grid>
                                            ))}
                                    </Grid>
                                </Box>
                            )}

                            {/* Regular Team Members */}
                            <Box>
                                <Typography variant="h3" className="font-light mb-8 text-center">
                                    Our Team
                                </Typography>
                                <Grid container spacing={6}>
                                    {data.members
                                        ?.filter(m => !m.is_leadership)
                                        .map((member, index) => (
                                            <Grid item xs={12} sm={6} md={4} lg={3} key={member.id}>
                                                <TeamMemberCard member={member} index={index} />
                                            </Grid>
                                        ))}
                                </Grid>
                            </Box>
                        </>
                    )}

                    {/* Empty State */}
                    {!isLoading && !isError && data?.members?.length === 0 && (
                        <Box className="text-center py-20">
                            <Typography variant="h6" className="text-gray-500">
                                No team members to display.
                            </Typography>
                        </Box>
                    )}
                </Container>
            </section>

            {/* Join Us Section */}
            <section className="py-20 bg-black text-white">
                <Container maxWidth="md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <Typography variant="h3" className="font-light mb-6">
                            Join Our Team
                        </Typography>
                        <Typography variant="h6" className="text-gray-400 font-light mb-8 max-w-2xl mx-auto">
                            We're always looking for talented individuals who share our passion
                            for creating exceptional digital experiences.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
                            <Link to="/careers" className="no-underline">
                                <Button
                                    variant="contained"
                                    size="large"
                                    className="bg-white text-black hover:bg-gray-100 rounded-none px-8 py-3 font-light tracking-wide normal-case"
                                >
                                    View Open Positions
                                </Button>
                            </Link>
                            <Link to="/contact" className="no-underline">
                                <Button
                                    variant="outlined"
                                    size="large"
                                    className="border-white text-white hover:bg-white hover:text-black rounded-none px-8 py-3 font-light tracking-wide normal-case"
                                >
                                    Get in Touch
                                </Button>
                            </Link>
                        </Stack>
                    </motion.div>
                </Container>
            </section>
        </>
    )
}

export default Team