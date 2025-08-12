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

    const TeamMemberCard = ({ member, index }) => (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            className="group"
            style={{ height: '100%' }}
        >
            {/* Removed Link wrapper and cursor-pointer class */}
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
                    height: '480px', // Fixed height for equal cards
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
                        borderColor: 'var(--sage-400)',
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
                            zIndex: 2
                        }}
                    >
                        <WorkspacePremiumOutlined sx={{ fontSize: 14 }} />
                        Leadership
                    </Box>
                )}

                {/* Avatar Section - Fixed Space */}
                <Box sx={{ mb: 3, flexShrink: 0 }}>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Avatar
                            src={member.photo || member.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=300&background=9db082&color=fff`}
                            alt={member.name}
                            sx={{
                                width: 100,
                                height: 100,
                                mx: 'auto',
                                border: '4px solid var(--stone-100)',
                                transition: 'all 0.4s ease',
                                filter: 'grayscale(20%)',
                                '&:hover': {
                                    filter: 'grayscale(0%)',
                                    transform: 'scale(1.05)',
                                    borderColor: 'var(--sage-400)',
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
                </Box>

                {/* Name and Position - Fixed Space */}
                <Box sx={{ mb: 2, flexShrink: 0, minHeight: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            mb: 1,
                            color: 'var(--stone-800)',
                            fontSize: '1.1rem',
                            lineHeight: 1.3,
                            minHeight: '26px'
                        }}
                    >
                        {member.name}
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            color: 'var(--sage-600)',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            minHeight: '20px'
                        }}
                    >
                        {member.position || member.role}
                    </Typography>
                </Box>

                {/* Department - Fixed Space */}
                <Box sx={{ mb: 3, flexShrink: 0, minHeight: '32px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                    {member.department && (
                        <Chip
                            label={member.department}
                            size="small"
                            sx={{
                                backgroundColor: 'var(--stone-50)',
                                color: 'var(--stone-600)',
                                fontSize: '0.75rem',
                                borderRadius: '50px',
                                height: '24px'
                            }}
                        />
                    )}
                </Box>

                {/* Bio Section - Flexible Space */}
                <Box sx={{ flex: 1, mb: 3, display: 'flex', alignItems: 'flex-start' }}>
                    {member.bio && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'var(--stone-600)',
                                lineHeight: 1.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                fontSize: '0.85rem'
                            }}
                        >
                            {member.bio}
                        </Typography>
                    )}
                </Box>

                {/* Skills Section - Fixed Space */}
                <Box sx={{ mb: 3, flexShrink: 0, minHeight: '30px' }}>
                    {member.skills && member.skills.length > 0 && (
                        <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="center"
                            sx={{ flexWrap: 'wrap', gap: 0.5 }}
                        >
                            {member.skills.slice(0, 2).map((skill, idx) => (
                                <Chip
                                    key={idx}
                                    label={skill}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'var(--sand-50)',
                                        color: 'var(--sand-600)',
                                        fontSize: '0.7rem',
                                        height: 22,
                                        borderRadius: '11px',
                                    }}
                                />
                            ))}
                            {member.skills.length > 2 && (
                                <Chip
                                    label={`+${member.skills.length - 2}`}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'var(--stone-100)',
                                        color: 'var(--stone-600)',
                                        fontSize: '0.7rem',
                                        height: 22,
                                        borderRadius: '11px',
                                    }}
                                />
                            )}
                        </Stack>
                    )}
                </Box>

                {/* Experience - Fixed Space */}
                <Box sx={{ mb: 3, flexShrink: 0, minHeight: '20px' }}>
                    {member.years_experience && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'var(--stone-500)',
                                fontSize: '0.75rem'
                            }}
                        >
                            {member.years_experience}+ years experience
                        </Typography>
                    )}
                </Box>

                {/* Social Links - Bottom Fixed */}
                <Box sx={{ flexShrink: 0 }}>
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
                </Box>
            </Card>
        </motion.div>
    )

    return (
        <>
            <Helmet>
                <title>Team - GS Infotech | Our People</title>
                <meta name="description" content="Meet the talented individuals who make up our team of developers, designers, and digital strategists." />
            </Helmet>

            {/* Hero Section - Center Aligned */}
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
                    <Box sx={{ textAlign: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
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
                    </Box>
                </Container>
            </section>

            {/* Team Content - 3 Cards Per Row using Flexbox */}
            <section style={{ padding: '6rem 0', backgroundColor: 'white', minHeight: '60vh' }}>
                <Container maxWidth="lg">
                    {/* Loading State */}
                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 4,
                                    justifyContent: 'center',
                                    maxWidth: '1200px'
                                }}
                            >
                                {[...Array(6)].map((_, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            width: { xs: '100%', sm: 'calc(50% - 16px)', lg: 'calc(33.333% - 21.33px)' },
                                            maxWidth: '350px'
                                        }}
                                    >
                                        <Card sx={{ p: 3, textAlign: 'center', borderRadius: '24px', height: '480px' }}>
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
                                    </Box>
                                ))}
                            </Box>
                        </Box>
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

                    {/* Team Members - Flexbox Layout for Equal Sizing */}
                    {!isLoading && !isError && data && data.members?.length > 0 && (
                        <Box>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                                style={{ textAlign: 'center', marginBottom: '4rem' }}
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
                                    Our Team Members
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: 'var(--stone-600)',
                                        maxWidth: '600px',
                                        mx: 'auto',
                                        lineHeight: 1.6
                                    }}
                                >
                                    Talented professionals bringing creativity, expertise, and innovation to every project we undertake.
                                </Typography>
                            </motion.div>

                            {/* Flexbox Container for Equal-Sized Cards */}
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 4,
                                        justifyContent: 'center',
                                        maxWidth: '1200px'
                                    }}
                                >
                                    {data.members.map((member, index) => (
                                        <Box
                                            key={member.id}
                                            sx={{
                                                width: { xs: '100%', sm: 'calc(50% - 16px)', lg: 'calc(33.333% - 21.33px)' },
                                                maxWidth: '350px',
                                                minWidth: '280px'
                                            }}
                                        >
                                            <TeamMemberCard member={member} index={index} />
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
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

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
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

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" sx={{ mb: 6 }}>
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

                        {/* Company Culture Highlights - Flexbox for Equal Sizing */}
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 3,
                                    justifyContent: 'center',
                                    maxWidth: '800px'
                                }}
                            >
                                {[
                                    { icon: '🚀', title: 'Innovation-Driven', desc: 'Work with cutting-edge technology' },
                                    { icon: '🌍', title: 'Remote-Friendly', desc: 'Flexible work arrangements' },
                                    { icon: '📈', title: 'Growth Focused', desc: 'Continuous learning opportunities' },
                                    { icon: '💼', title: 'Competitive Benefits', desc: 'Health, retirement, and more' }
                                ].map((item, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            width: { xs: 'calc(50% - 12px)', sm: 'calc(25% - 18px)' },
                                            minWidth: '150px',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: index * 0.1 }}
                                            viewport={{ once: true }}
                                        >
                                            <Typography variant="h4" sx={{ mb: 1, fontSize: '2rem' }}>
                                                {item.icon}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 500, mb: 0.5 }}>
                                                {item.title}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem' }}>
                                                {item.desc}
                                            </Typography>
                                        </motion.div>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </motion.div>
                </Container>
            </section>
        </>
    )
}

export default Team