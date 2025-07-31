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
    Alert,
    Card
} from '@mui/material'
import {
    LinkedIn,
    Twitter,
    GitHub,
    Language,
    Email,
    Refresh,
    ArrowOutward,
    WorkspacePremiumOutlined,
    GroupsOutlined
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

    const TeamMemberCard = ({ member, index, isLeadership = false }) => (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            className="group cursor-pointer"
        >
            <Link to={`/team/${member.slug || member.id}`} className="no-underline">
                <Card
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        border: '1px solid var(--stone-100)',
                        borderRadius: '24px',
                        backgroundColor: 'white',
                        boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.4s ease',
                        position: 'relative',
                        overflow: 'visible',
                        '&:hover': {
                            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
                            borderColor: isLeadership ? 'var(--sage-400)' : 'var(--coral-400)',
                        }
                    }}
                >
                    {/* Leadership Badge */}
                    {member.is_leadership && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -12,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                backgroundColor: 'var(--sage-400)',
                                color: 'white',
                                px: 2,
                                py: 0.5,
                                borderRadius: '50px',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                boxShadow: '0 4px 12px -2px rgba(157, 176, 130, 0.4)',
                            }}
                        >
                            <WorkspacePremiumOutlined sx={{ fontSize: 14 }} />
                            Leadership
                        </Box>
                    )}

                    {/* Avatar with Status */}
                    <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                        <Avatar
                            src={member.photo || member.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=300&background=9db082&color=fff`}
                            alt={member.name}
                            sx={{
                                width: isLeadership ? 120 : 100,
                                height: isLeadership ? 120 : 100,
                                mx: 'auto',
                                border: `4px solid ${isLeadership ? 'var(--sage-100)' : 'var(--stone-100)'}`,
                                transition: 'all 0.4s ease',
                                filter: 'grayscale(20%)',
                                '&:hover': {
                                    filter: 'grayscale(0%)',
                                    transform: 'scale(1.05)',
                                    borderColor: isLeadership ? 'var(--sage-400)' : 'var(--coral-400)',
                                }
                            }}
                            onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=300&background=9db082&color=fff`
                            }}
                        />

                        {/* Status Indicator */}
                        {member.is_active && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 8,
                                    right: 8,
                                    width: 16,
                                    height: 16,
                                    backgroundColor: 'var(--sage-400)',
                                    borderRadius: '50%',
                                    border: '3px solid white',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                }}
                            />
                        )}
                    </Box>

                    {/* Member Info */}
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            mb: 1,
                            color: 'var(--stone-800)',
                            fontSize: isLeadership ? '1.25rem' : '1.1rem'
                        }}
                    >
                        {member.name}
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            color: isLeadership ? 'var(--sage-600)' : 'var(--coral-600)',
                            mb: 2,
                            fontWeight: 500,
                            fontSize: '0.875rem'
                        }}
                    >
                        {member.position || member.role}
                    </Typography>

                    {member.department && (
                        <Chip
                            label={member.department}
                            size="small"
                            sx={{
                                backgroundColor: 'var(--stone-50)',
                                color: 'var(--stone-600)',
                                fontSize: '0.75rem',
                                mb: 2,
                                borderRadius: '50px',
                            }}
                        />
                    )}

                    {/* Bio Preview */}
                    {member.bio && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'var(--stone-600)',
                                mb: 3,
                                lineHeight: 1.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {member.bio}
                        </Typography>
                    )}

                    {/* Skills */}
                    {member.skills && member.skills.length > 0 && (
                        <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ mb: 3, flexWrap: 'wrap', gap: 0.5 }}>
                            {member.skills.slice(0, 3).map((skill, idx) => (
                                <Chip
                                    key={idx}
                                    label={skill}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'var(--sand-50)',
                                        color: 'var(--sand-600)',
                                        fontSize: '0.7rem',
                                        height: 24,
                                        borderRadius: '12px',
                                    }}
                                />
                            ))}
                            {member.skills.length > 3 && (
                                <Chip
                                    label={`+${member.skills.length - 3}`}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'var(--stone-100)',
                                        color: 'var(--stone-600)',
                                        fontSize: '0.7rem',
                                        height: 24,
                                        borderRadius: '12px',
                                    }}
                                />
                            )}
                        </Stack>
                    )}

                    {/* Experience */}
                    {member.years_experience && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'var(--stone-500)',
                                display: 'block',
                                mb: 2,
                                fontSize: '0.75rem'
                            }}
                        >
                            {member.years_experience}+ years experience
                        </Typography>
                    )}

                    {/* Social Links - Always visible on mobile, hover on desktop */}
                    {member.social_links && Object.keys(member.social_links).length > 0 && (
                        <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                            sx={{
                                opacity: { xs: 1, md: 0 },
                                transition: 'opacity 0.3s ease',
                                '.group:hover &': {
                                    opacity: 1,
                                }
                            }}
                        >
                            {Object.entries(member.social_links).slice(0, 4).map(([platform, url]) => (
                                url && (
                                    <IconButton
                                        key={platform}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        size="small"
                                        onClick={(e) => e.stopPropagation()}
                                        sx={{
                                            color: 'var(--stone-500)',
                                            backgroundColor: 'var(--stone-50)',
                                            width: 32,
                                            height: 32,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                color: 'white',
                                                backgroundColor: 'var(--sage-400)',
                                                transform: 'translateY(-2px)',
                                            }
                                        }}
                                        title={`${member.name} on ${platform}`}
                                    >
                                        {getSocialIcon(platform)}
                                    </IconButton>
                                )
                            ))}
                        </Stack>
                    )}
                </Card>
            </Link>
        </motion.div>
    )

    return (
        <>
            <Helmet>
                <title>Team - GS Infotech | Our People</title>
                <meta name="description" content="Meet the talented individuals who make up our team of developers, designers, and digital strategists." />
            </Helmet>

            {/* Hero Section - Enhanced */}
            <section
                style={{
                    paddingTop: '8rem',
                    paddingBottom: '4rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Background Gradient */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, var(--sage-50) 0%, var(--sand-50) 50%, var(--coral-50) 100%)',
                        opacity: 0.8,
                    }}
                />

                {/* Floating Elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '10%',
                        right: '5%',
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, var(--sage-400) 0%, transparent 70%)',
                        opacity: 0.1,
                        filter: 'blur(40px)',
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        style={{ textAlign: 'center' }}
                    >
                        <Chip
                            icon={<GroupsOutlined sx={{ fontSize: 16 }} />}
                            label="OUR TEAM"
                            sx={{
                                backgroundColor: 'var(--sage-400)',
                                color: 'white',
                                fontWeight: 500,
                                mb: 3,
                                px: 2,
                                borderRadius: '50px',
                                fontSize: '0.75rem',
                                letterSpacing: '0.1em',
                            }}
                        />
                        <Typography
                            variant="h1"
                            sx={{
                                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' },
                                fontWeight: 300,
                                lineHeight: 0.9,
                                letterSpacing: '-0.02em',
                                mb: 4,
                                color: 'var(--stone-800)',
                            }}
                        >
                            Meet the people
                            <br />
                            <span style={{ fontWeight: 600, color: 'var(--sage-600)' }}>behind the magic</span>
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                color: 'var(--stone-600)',
                                fontWeight: 300,
                                lineHeight: 1.6,
                                maxWidth: '700px',
                                mx: 'auto',
                                fontSize: { xs: '1.1rem', md: '1.25rem' }
                            }}
                        >
                            A diverse team of thinkers, creators, and innovators working together
                            to build exceptional digital experiences that make a difference.
                        </Typography>
                    </motion.div>
                </Container>
            </section>

            {/* Team Content */}
            <section style={{ padding: '4rem 0', backgroundColor: 'white', minHeight: '60vh' }}>
                <Container maxWidth="lg">
                    {/* Loading State */}
                    {isLoading && (
                        <Grid container spacing={4}>
                            {[...Array(8)].map((_, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                    <Card sx={{ p: 3, textAlign: 'center', borderRadius: '24px' }}>
                                        <Skeleton
                                            variant="circular"
                                            width={100}
                                            height={100}
                                            sx={{ mx: 'auto', mb: 2 }}
                                        />
                                        <Skeleton variant="text" width="70%" sx={{ mx: 'auto', mb: 1 }} />
                                        <Skeleton variant="text" width="50%" sx={{ mx: 'auto', mb: 2 }} />
                                        <Skeleton variant="text" width="80%" sx={{ mx: 'auto' }} />
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {/* Error State */}
                    {isError && (
                        <Box sx={{ textAlign: 'center', py: 10 }}>
                            <Alert
                                severity="error"
                                sx={{
                                    mb: 3,
                                    maxWidth: 'md',
                                    mx: 'auto',
                                    borderRadius: '16px',
                                    backgroundColor: 'var(--coral-50)',
                                    color: 'var(--coral-600)',
                                    border: '1px solid var(--coral-200)',
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 1 }}>
                                    Unable to load team members
                                </Typography>
                                <Typography variant="body2">
                                    {error?.data?.message || 'Something went wrong while fetching team data.'}
                                </Typography>
                            </Alert>
                            <Button
                                onClick={() => refetch()}
                                startIcon={<Refresh />}
                                sx={{
                                    color: 'var(--sage-600)',
                                    borderColor: 'var(--sage-400)',
                                    '&:hover': {
                                        backgroundColor: 'var(--sage-50)',
                                    }
                                }}
                                variant="outlined"
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
                                <Box sx={{ mb: 8 }}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                        viewport={{ once: true }}
                                        style={{ textAlign: 'center', marginBottom: '3rem' }}
                                    >
                                        <Typography
                                            variant="h2"
                                            sx={{
                                                fontSize: { xs: '2rem', md: '2.5rem' },
                                                fontWeight: 300,
                                                mb: 2,
                                                color: 'var(--stone-800)',
                                                letterSpacing: '-0.02em',
                                            }}
                                        >
                                            Leadership Team
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: 'var(--stone-600)',
                                                maxWidth: '600px',
                                                mx: 'auto'
                                            }}
                                        >
                                            Visionary leaders who guide our mission and drive innovation.
                                        </Typography>
                                    </motion.div>
                                    <Grid container spacing={4} justifyContent="center">
                                        {data.members
                                            .filter(m => m.is_leadership)
                                            .map((member, index) => (
                                                <Grid item xs={12} sm={6} md={4} key={member.id}>
                                                    <TeamMemberCard member={member} index={index} isLeadership={true} />
                                                </Grid>
                                            ))}
                                    </Grid>
                                </Box>
                            )}

                            {/* Regular Team Members */}
                            {data.members?.filter(m => !m.is_leadership).length > 0 && (
                                <Box>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                        viewport={{ once: true }}
                                        style={{ textAlign: 'center', marginBottom: '3rem' }}
                                    >
                                        <Typography
                                            variant="h2"
                                            sx={{
                                                fontSize: { xs: '2rem', md: '2.5rem' },
                                                fontWeight: 300,
                                                mb: 2,
                                                color: 'var(--stone-800)',
                                                letterSpacing: '-0.02em',
                                            }}
                                        >
                                            Our Team
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: 'var(--stone-600)',
                                                maxWidth: '600px',
                                                mx: 'auto'
                                            }}
                                        >
                                            Talented professionals who bring creativity and expertise to every project.
                                        </Typography>
                                    </motion.div>
                                    <Grid container spacing={4}>
                                        {data.members
                                            ?.filter(m => !m.is_leadership)
                                            .map((member, index) => (
                                                <Grid item xs={12} sm={6} md={4} lg={3} key={member.id}>
                                                    <TeamMemberCard member={member} index={index} isLeadership={false} />
                                                </Grid>
                                            ))}
                                    </Grid>
                                </Box>
                            )}
                        </>
                    )}

                    {/* Empty State */}
                    {!isLoading && !isError && data?.members?.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 10 }}>
                            <Box
                                sx={{
                                    width: 120,
                                    height: 120,
                                    backgroundColor: 'var(--stone-100)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                }}
                            >
                                <GroupsOutlined sx={{ fontSize: 48, color: 'var(--stone-400)' }} />
                            </Box>
                            <Typography variant="h6" sx={{ color: 'var(--stone-500)', mb: 1 }}>
                                No team members to display
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'var(--stone-400)' }}>
                                Team members will appear here once they're added.
                            </Typography>
                        </Box>
                    )}
                </Container>
            </section>

            {/* Join Us Section - Enhanced */}
            <section
                style={{
                    padding: '6rem 0',
                    background: 'linear-gradient(135deg, var(--stone-800) 0%, var(--stone-900) 100%)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Background Pattern */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0.05,
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px)`,
                    }}
                />

                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 10 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center' }}
                    >
                        <Typography
                            variant="h2"
                            sx={{
                                fontSize: { xs: '2.5rem', md: '3.5rem' },
                                fontWeight: 300,
                                mb: 3,
                                color: 'white',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Join Our Team
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontWeight: 300,
                                mb: 6,
                                maxWidth: '600px',
                                mx: 'auto',
                                lineHeight: 1.6,
                            }}
                        >
                            We're always looking for talented individuals who share our passion
                            for creating exceptional digital experiences and making a positive impact.
                        </Typography>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" sx={{ mb: 4 }}>
                            <Link to="/careers" className="no-underline">
                                <Button
                                    variant="contained"
                                    size="large"
                                    endIcon={<ArrowOutward />}
                                    sx={{
                                        backgroundColor: 'white',
                                        color: 'var(--stone-800)',
                                        borderRadius: '50px',
                                        px: 6,
                                        py: 2.5,
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        letterSpacing: '0.025em',
                                        textTransform: 'none',
                                        boxShadow: '0 8px 25px -8px rgba(255, 255, 255, 0.3)',
                                        transition: 'all 0.4s ease',
                                        '&:hover': {
                                            backgroundColor: 'var(--sage-50)',
                                            transform: 'translateY(-3px)',
                                            boxShadow: '0 12px 35px -8px rgba(255, 255, 255, 0.4)'
                                        }
                                    }}
                                >
                                    View Open Positions
                                </Button>
                            </Link>
                            <Link to="/contact" className="no-underline">
                                <Button
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                        color: 'white',
                                        borderRadius: '50px',
                                        px: 6,
                                        py: 2.5,
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        letterSpacing: '0.025em',
                                        textTransform: 'none',
                                        transition: 'all 0.4s ease',
                                        '&:hover': {
                                            borderColor: 'white',
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            transform: 'translateY(-2px)',
                                        }
                                    }}
                                >
                                    Get in Touch
                                </Button>
                            </Link>
                        </Stack>

                        {/* Company Culture Highlights */}
                        <Grid container spacing={3} sx={{ mt: 4 }}>
                            {[
                                { icon: '🚀', title: 'Innovation-Driven', desc: 'Work with cutting-edge technology' },
                                { icon: '🌍', title: 'Remote-Friendly', desc: 'Flexible work arrangements' },
                                { icon: '📈', title: 'Growth Focused', desc: 'Continuous learning opportunities' },
                                { icon: '💼', title: 'Competitive Benefits', desc: 'Health, retirement, and more' }
                            ].map((item, index) => (
                                <Grid item xs={6} md={3} key={index}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                    >
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h4" sx={{ mb: 1 }}>
                                                {item.icon}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 500, mb: 0.5 }}>
                                                {item.title}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                {item.desc}
                                            </Typography>
                                        </Box>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>
                    </motion.div>
                </Container>
            </section>
        </>
    )
}

export default Team