import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import {
    Box,
    Container,
    Typography,
    Chip,
    Stack,
    IconButton,
    Button,
    Skeleton,
    Grid,
    Alert,
    Card,
    Avatar,
    Divider
} from '@mui/material'
import {
    ArrowOutward,
    CalendarTodayOutlined,
    PersonOutlineOutlined,
    LocalOfferOutlined,
    SearchOutlined,
    TrendingUpOutlined,
    Refresh,
    ArticleOutlined,
    BookmarkBorderOutlined,
    ShareOutlined,
    AccessTimeOutlined,
    VisibilityOutlined
} from '@mui/icons-material'

// Use your existing React Query hooks
import { useBlogPosts, useFeaturedPosts, useBlogCategories } from '@/hooks/useApi'

const Blog = () => {
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [page, setPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')

    // Build query parameters
    const queryParams = {
        page,
        limit: 9,
        status: 'published'
    }

    if (selectedCategory !== 'all') {
        queryParams.category = selectedCategory
    }

    if (searchTerm) {
        queryParams.search = searchTerm
    }

    // Use your existing React Query hooks
    const {
        data: blogData,
        isLoading,
        error,
        refetch,
        isError
    } = useBlogPosts(queryParams)

    const { data: featuredPostsData } = useFeaturedPosts(1)
    const { data: categoriesData, isError: categoriesError } = useBlogCategories()

    // Reset page when category changes
    useEffect(() => {
        setPage(1)
    }, [selectedCategory, searchTerm])

    // Process blog data
    const posts = blogData?.posts || blogData?.data || []
    const total = blogData?.total || posts.length
    const pagination = blogData?.pagination

    // Get featured post
    const featuredPost = featuredPostsData?.posts?.[0] || featuredPostsData?.[0] || posts[0]

    // Process categories with counts and colors
    const [categories, setCategories] = useState([
        { id: 'all', label: 'All Posts', count: 0, color: 'var(--stone-600)' },
        { id: 'development', label: 'Development', count: 0, color: 'var(--sage-500)' },
        { id: 'design', label: 'Design', count: 0, color: 'var(--coral-500)' },
        { id: 'technology', label: 'Technology', count: 0, color: 'var(--sand-600)' },
        { id: 'business', label: 'Business', count: 0, color: 'var(--stone-700)' }
    ])

    // Update categories from API data
    useEffect(() => {
        if (categoriesData && !categoriesError) {
            const apiCategories = categoriesData.map((cat, index) => ({
                id: cat.slug || cat.name.toLowerCase(),
                label: cat.name,
                count: cat.count || 0,
                color: ['var(--sage-500)', 'var(--coral-500)', 'var(--sand-600)', 'var(--stone-700)'][index % 4]
            }))

            setCategories([
                { id: 'all', label: 'All Posts', count: total, color: 'var(--stone-600)' },
                ...apiCategories
            ])
        } else if (posts.length > 0) {
            const categoryCounts = {}
            posts.forEach(post => {
                if (post.category) {
                    categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1
                }
            })

            setCategories(prev => prev.map(cat => ({
                ...cat,
                count: cat.id === 'all' ? total : (categoryCounts[cat.id] || 0)
            })))
        }
    }, [categoriesData, categoriesError, posts, total])

    const BlogCard = ({ post, index, size = 'regular' }) => {
        const isLarge = size === 'large'

        return (
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
                whileHover={{ y: -8 }}
                style={{ height: '100%' }}
            >
                <Link to={`/blog/${post.slug || post.id}`} style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
                    <Card
                        sx={{
                            height: '100%',
                            border: 'none',
                            borderRadius: '24px',
                            backgroundColor: 'white',
                            boxShadow: '0 8px 32px -8px rgba(139, 148, 113, 0.15)',
                            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            '&:hover': {
                                transform: 'translateY(-12px)',
                                boxShadow: '0 32px 64px -12px rgba(139, 148, 113, 0.25)',
                            }
                        }}
                    >
                        {/* Image */}
                        <Box
                            sx={{
                                position: 'relative',
                                height: isLarge ? 300 : 200,
                                overflow: 'hidden',
                                backgroundColor: '#f8f9fa'
                            }}
                        >
                            <motion.img
                                src={post.featured_image || post.image || `https://images.unsplash.com/photo-${['1486312338-8e4fe20b1f5a', '1519389950473-47ba0277781c', '1498050108023-c5249f4df085'][index % 3]}?w=600&h=400&fit=crop`}
                                alt={post.title}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                                onError={(e) => {
                                    e.target.src = `https://images.unsplash.com/photo-1486312338-8e4fe20b1f5a?w=600&h=400&fit=crop`
                                }}
                            />

                            {/* Category Badge */}
                            <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
                                <Chip
                                    icon={post.featured ? <TrendingUpOutlined sx={{ fontSize: 14 }} /> : <LocalOfferOutlined sx={{ fontSize: 14 }} />}
                                    label={post.featured ? 'Featured' : (post.category?.replace('_', ' ') || 'Article')}
                                    sx={{
                                        backgroundColor: post.featured ? 'var(--sage-400)' : 'rgba(255, 255, 255, 0.95)',
                                        color: post.featured ? 'white' : 'var(--stone-700)',
                                        fontWeight: 500,
                                        fontSize: '0.75rem',
                                        backdropFilter: 'blur(8px)',
                                        borderRadius: '12px',
                                    }}
                                />
                            </Box>

                            {/* Reading Time */}
                            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                                <Chip
                                    icon={<AccessTimeOutlined sx={{ fontSize: 14 }} />}
                                    label={post.reading_time || post.readTime || '5 min'}
                                    sx={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                        color: 'white',
                                        fontWeight: 500,
                                        fontSize: '0.75rem',
                                        backdropFilter: 'blur(8px)',
                                        borderRadius: '12px',
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Content */}
                        <Box sx={{ p: isLarge ? 4 : 3 }}>
                            {/* Meta Information */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        backgroundColor: 'var(--sage-100)',
                                        color: 'var(--sage-600)',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {(post.author_name || post.author || 'GS')[0]}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'var(--stone-600)',
                                            fontWeight: 500,
                                            display: 'block',
                                            lineHeight: 1.2
                                        }}
                                    >
                                        {post.author_name || post.author || 'GS Team'}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'var(--stone-500)',
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Title */}
                            <Typography
                                variant={isLarge ? "h5" : "h6"}
                                sx={{
                                    fontWeight: 600,
                                    color: 'var(--stone-800)',
                                    lineHeight: 1.3,
                                    mb: 2,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                                {post.title}
                            </Typography>

                            {/* Excerpt */}
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'var(--stone-600)',
                                    lineHeight: 1.6,
                                    mb: 3,
                                    display: '-webkit-box',
                                    WebkitLineClamp: isLarge ? 3 : 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                                {post.excerpt || post.description || 'Discover insights and ideas from our digital innovation journey.'}
                            </Typography>

                            {/* Footer */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <VisibilityOutlined sx={{ fontSize: 16, color: 'var(--stone-400)' }} />
                                        <Typography variant="caption" sx={{ color: 'var(--stone-500)' }}>
                                            {post.views || Math.floor(Math.random() * 500) + 100}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'var(--sage-600)',
                                            fontWeight: 500,
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        Read More
                                    </Typography>
                                    <ArrowOutward sx={{ fontSize: 16, color: 'var(--sage-600)' }} />
                                </Box>
                            </Box>
                        </Box>
                    </Card>
                </Link>
            </motion.div>
        )
    }

    return (
        <>
            <Helmet>
                <title>Blog - GS Infotech | Digital Innovation Insights</title>
                <meta name="description" content="Explore our thoughts on design, development, and digital innovation. Stay updated with the latest trends and insights from our expert team." />
                <meta name="keywords" content="blog, digital innovation, web development, design, technology, insights" />
            </Helmet>

            <Box sx={{ backgroundColor: 'white', minHeight: '100vh' }}>
                {/* Enhanced Hero Section */}
                <section
                    style={{
                        paddingTop: '8rem',
                        paddingBottom: '4rem',
                        position: 'relative',
                        background: 'linear-gradient(135deg, var(--sage-50) 0%, var(--sand-25) 100%)',
                        overflow: 'hidden'
                    }}
                >
                    {/* Artistic Background Elements */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '20%',
                            right: '8%',
                            width: 250,
                            height: 250,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, var(--sage-200) 0%, transparent 70%)',
                            opacity: 0.4,
                            filter: 'blur(50px)',
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: '10%',
                            left: '5%',
                            width: 180,
                            height: 180,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, var(--coral-200) 0%, transparent 70%)',
                            opacity: 0.3,
                            filter: 'blur(35px)',
                        }}
                    />

                    <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                        >
                            <Box sx={{ textAlign: 'center', mb: 8 }}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                >
                                    <Chip
                                        icon={<ArticleOutlined sx={{ fontSize: 16 }} />}
                                        label="INSIGHTS & IDEAS"
                                        sx={{
                                            backgroundColor: 'var(--sage-600)',
                                            color: 'white',
                                            fontWeight: 600,
                                            mb: 4,
                                            px: 3,
                                            py: 0.5,
                                            borderRadius: '50px',
                                            fontSize: '0.75rem',
                                            letterSpacing: '0.15em',
                                            boxShadow: '0 8px 24px -8px rgba(139, 148, 113, 0.4)',
                                        }}
                                    />
                                </motion.div>

                                <Typography
                                    variant="h1"
                                    sx={{
                                        fontSize: { xs: '3rem', sm: '4rem', md: '5.5rem', lg: '6.5rem' },
                                        fontWeight: 200,
                                        lineHeight: 0.85,
                                        letterSpacing: '-0.03em',
                                        mb: 6,
                                        color: 'var(--stone-900)',
                                        background: 'linear-gradient(135deg, var(--stone-900) 0%, var(--sage-600) 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    Stories That
                                    <br />
                                    <span style={{ fontWeight: 400, fontStyle: 'italic' }}>Inspire</span>
                                </Typography>

                                <Typography
                                    variant="h4"
                                    sx={{
                                        color: 'var(--stone-600)',
                                        fontWeight: 300,
                                        lineHeight: 1.4,
                                        maxWidth: '800px',
                                        mx: 'auto',
                                        mb: 6,
                                        fontSize: { xs: '1.25rem', md: '1.5rem' }
                                    }}
                                >
                                    Dive deep into the world of digital innovation, design thinking,
                                    <br />
                                    and the technologies shaping tomorrow.
                                </Typography>

                                {/* Stats Bar */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                >
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            borderRadius: '24px',
                                            p: 3,
                                            backdropFilter: 'blur(20px)',
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                            boxShadow: '0 16px 40px -12px rgba(139, 148, 113, 0.2)',
                                        }}
                                    >
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h3" sx={{ fontWeight: 600, color: 'var(--sage-600)', fontSize: '2rem' }}>
                                                {total || '50+'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'var(--stone-500)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                                                Articles
                                            </Typography>
                                        </Box>
                                        <Box sx={{ width: 1, height: 40, backgroundColor: 'var(--stone-200)' }} />
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h3" sx={{ fontWeight: 600, color: 'var(--coral-500)', fontSize: '2rem' }}>
                                                {categories.length - 1}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'var(--stone-500)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                                                Categories
                                            </Typography>
                                        </Box>
                                        <Box sx={{ width: 1, height: 40, backgroundColor: 'var(--stone-200)' }} />
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h3" sx={{ fontWeight: 600, color: 'var(--sand-600)', fontSize: '2rem' }}>
                                                10K+
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'var(--stone-500)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                                                Readers
                                            </Typography>
                                        </Box>
                                    </Box>
                                </motion.div>
                            </Box>
                        </motion.div>
                    </Container>
                </section>

                {/* Enhanced Categories Filter */}
                <section
                    style={{
                        padding: '3rem 0',
                        backgroundColor: 'white',
                        borderBottom: '1px solid var(--stone-100)',
                        position: 'sticky',
                        top: 80,
                        zIndex: 50,
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    <Container maxWidth="xl">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    backgroundColor: 'var(--stone-50)',
                                    borderRadius: '20px',
                                    p: 1,
                                    border: '1px solid var(--stone-100)',
                                    overflowX: 'auto',
                                    '&::-webkit-scrollbar': { display: 'none' },
                                    msOverflowStyle: 'none',
                                    scrollbarWidth: 'none'
                                }}
                            >
                                {categories.map((category, index) => (
                                    <motion.div
                                        key={category.id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Chip
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <span>{category.label}</span>
                                                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>({category.count})</span>
                                                </Box>
                                            }
                                            onClick={() => setSelectedCategory(category.id)}
                                            sx={{
                                                cursor: 'pointer',
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                px: 3,
                                                py: 1.5,
                                                height: 44,
                                                borderRadius: '16px',
                                                fontWeight: 600,
                                                fontSize: '0.875rem',
                                                letterSpacing: '0.025em',
                                                whiteSpace: 'nowrap',
                                                ...(selectedCategory === category.id
                                                    ? {
                                                        backgroundColor: category.color,
                                                        color: 'white',
                                                        boxShadow: `0 8px 24px -8px ${category.color}60`,
                                                        transform: 'translateY(-2px)',
                                                    }
                                                    : {
                                                        backgroundColor: 'transparent',
                                                        color: 'var(--stone-600)',
                                                        '&:hover': {
                                                            backgroundColor: 'var(--stone-100)',
                                                            color: 'var(--stone-800)',
                                                        }
                                                    }
                                                )
                                            }}
                                        />
                                    </motion.div>
                                ))}
                            </Box>
                        </Box>

                        {/* Results indicator */}
                        <Typography
                            variant="body2"
                            sx={{
                                textAlign: 'center',
                                color: 'var(--stone-500)',
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }}
                        >
                            {isLoading ? 'Loading amazing content...' :
                                `Showing ${posts.length} ${posts.length === 1 ? 'article' : 'articles'}${selectedCategory !== 'all' ? ` in ${categories.find(c => c.id === selectedCategory)?.label}` : ''}`}
                        </Typography>
                    </Container>
                </section>

                {/* Featured Post Section */}
                {!isLoading && featuredPost && (
                    <section style={{ padding: '6rem 0', backgroundColor: '#fafafa' }}>
                        <Container maxWidth="xl">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontSize: { xs: '2rem', md: '2.5rem' },
                                        fontWeight: 300,
                                        mb: 6,
                                        color: 'var(--stone-800)',
                                        textAlign: 'center',
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    Featured Article
                                </Typography>

                                <Link to={`/blog/${featuredPost.slug || featuredPost.id}`} style={{ textDecoration: 'none' }}>
                                    <Card
                                        sx={{
                                            borderRadius: '32px',
                                            overflow: 'hidden',
                                            backgroundColor: 'white',
                                            boxShadow: '0 24px 60px -12px rgba(139, 148, 113, 0.2)',
                                            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                boxShadow: '0 32px 80px -12px rgba(139, 148, 113, 0.3)',
                                            }
                                        }}
                                    >
                                        <Grid container>
                                            <Grid item xs={12} md={7}>
                                                <Box sx={{ position: 'relative', height: { xs: 300, md: 500 }, overflow: 'hidden' }}>
                                                    <motion.img
                                                        src={featuredPost.featured_image || featuredPost.image || 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=600&fit=crop'}
                                                        alt={featuredPost.title}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                        }}
                                                        whileHover={{ scale: 1.05 }}
                                                        transition={{ duration: 0.6 }}
                                                        onError={(e) => {
                                                            e.target.src = 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=600&fit=crop'
                                                        }}
                                                    />

                                                    {/* Gradient Overlay */}
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            background: 'linear-gradient(45deg, rgba(139, 148, 113, 0.8) 0%, transparent 60%)',
                                                        }}
                                                    />

                                                    {/* Featured Badge */}
                                                    <Box sx={{ position: 'absolute', top: 24, left: 24 }}>
                                                        <Chip
                                                            icon={<TrendingUpOutlined sx={{ fontSize: 16 }} />}
                                                            label="Featured Article"
                                                            sx={{
                                                                backgroundColor: 'var(--sage-400)',
                                                                color: 'white',
                                                                fontWeight: 500,
                                                                fontSize: '0.875rem',
                                                                px: 2,
                                                                borderRadius: '16px',
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} md={5}>
                                                <Box sx={{ p: { xs: 4, md: 6 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                    {/* Author & Date */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                                        <Avatar
                                                            sx={{
                                                                width: 40,
                                                                height: 40,
                                                                backgroundColor: 'var(--sage-100)',
                                                                color: 'var(--sage-600)',
                                                                fontWeight: 600
                                                            }}
                                                        >
                                                            {(featuredPost.author_name || featuredPost.author || 'GS')[0]}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: 'var(--stone-800)',
                                                                    fontWeight: 500,
                                                                    lineHeight: 1.2
                                                                }}
                                                            >
                                                                {featuredPost.author_name || featuredPost.author || 'GS Team'}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: 'var(--stone-500)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1
                                                                }}
                                                            >
                                                                <CalendarTodayOutlined sx={{ fontSize: 12 }} />
                                                                {new Date(featuredPost.published_at || featuredPost.created_at).toLocaleDateString('en-US', {
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    {/* Title */}
                                                    <Typography
                                                        variant="h3"
                                                        sx={{
                                                            fontWeight: 400,
                                                            color: 'var(--stone-900)',
                                                            lineHeight: 1.2,
                                                            mb: 3,
                                                            fontSize: { xs: '1.75rem', md: '2.25rem' },
                                                            letterSpacing: '-0.02em',
                                                        }}
                                                    >
                                                        {featuredPost.title}
                                                    </Typography>

                                                    {/* Excerpt */}
                                                    <Typography
                                                        variant="body1"
                                                        sx={{
                                                            color: 'var(--stone-600)',
                                                            lineHeight: 1.7,
                                                            mb: 4,
                                                            fontSize: '1.1rem',
                                                        }}
                                                    >
                                                        {featuredPost.excerpt || featuredPost.description}
                                                    </Typography>

                                                    {/* Meta Info */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <AccessTimeOutlined sx={{ fontSize: 16, color: 'var(--stone-400)' }} />
                                                            <Typography variant="caption" sx={{ color: 'var(--stone-500)' }}>
                                                                {featuredPost.reading_time || featuredPost.readTime || '8 min read'}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <VisibilityOutlined sx={{ fontSize: 16, color: 'var(--stone-400)' }} />
                                                            <Typography variant="caption" sx={{ color: 'var(--stone-500)' }}>
                                                                {featuredPost.views || Math.floor(Math.random() * 1000) + 500} views
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    {/* Read More Button */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--sage-600)' }}>
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                fontWeight: 500,
                                                                fontSize: '1.1rem',
                                                            }}
                                                        >
                                                            Read Full Article
                                                        </Typography>
                                                        <ArrowOutward sx={{ fontSize: 20 }} />
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Card>
                                </Link>
                            </motion.div>
                        </Container>
                    </section>
                )}

                {/* Blog Posts Grid */}
                <section style={{ padding: '6rem 0', backgroundColor: 'white' }}>
                    <Container maxWidth="xl">
                        {/* Loading State */}
                        {isLoading && (
                            <Box>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontSize: { xs: '2rem', md: '2.5rem' },
                                        fontWeight: 300,
                                        mb: 6,
                                        color: 'var(--stone-800)',
                                        textAlign: 'center',
                                    }}
                                >
                                    Latest Articles
                                </Typography>
                                <Grid container spacing={4}>
                                    {[...Array(6)].map((_, index) => (
                                        <Grid item xs={12} sm={6} lg={4} key={index}>
                                            <Card sx={{ borderRadius: '24px', overflow: 'hidden' }}>
                                                <Skeleton variant="rectangular" height={200} />
                                                <Box sx={{ p: 3 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                        <Skeleton variant="circular" width={32} height={32} />
                                                        <Box sx={{ flex: 1 }}>
                                                            <Skeleton variant="text" width="60%" height={16} />
                                                            <Skeleton variant="text" width="40%" height={14} />
                                                        </Box>
                                                    </Box>
                                                    <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1 }} />
                                                    <Skeleton variant="text" width="70%" height={20} sx={{ mb: 2 }} />
                                                    <Skeleton variant="text" width="100%" height={16} sx={{ mb: 1 }} />
                                                    <Skeleton variant="text" width="80%" height={16} />
                                                </Box>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {/* Error State */}
                        {isError && (
                            <Box sx={{ textAlign: 'center', py: 12 }}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <Box
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            backgroundColor: 'var(--coral-50)',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 4,
                                        }}
                                    >
                                        <ArticleOutlined sx={{ fontSize: 48, color: 'var(--coral-400)' }} />
                                    </Box>
                                    <Typography variant="h4" sx={{ color: 'var(--stone-700)', fontWeight: 300, mb: 2 }}>
                                        Unable to load articles
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'var(--stone-500)', mb: 4, maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}>
                                        {error?.response?.data?.message || error?.message || 'Something went wrong while fetching our latest insights.'}
                                    </Typography>
                                    <Button
                                        onClick={() => refetch()}
                                        startIcon={<Refresh />}
                                        sx={{
                                            backgroundColor: 'var(--sage-600)',
                                            color: 'white',
                                            borderRadius: '50px',
                                            px: 4,
                                            py: 1.5,
                                            fontWeight: 500,
                                            '&:hover': {
                                                backgroundColor: 'var(--sage-700)',
                                            }
                                        }}
                                    >
                                        Try Again
                                    </Button>
                                </motion.div>
                            </Box>
                        )}

                        {/* Posts Grid */}
                        {!isLoading && !isError && posts && (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${selectedCategory}-${page}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <Typography
                                        variant="h3"
                                        sx={{
                                            fontSize: { xs: '2rem', md: '2.5rem' },
                                            fontWeight: 300,
                                            mb: 6,
                                            color: 'var(--stone-800)',
                                            textAlign: 'center',
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        Latest Articles
                                    </Typography>

                                    <Grid container spacing={4}>
                                        {posts.map((post, index) => (
                                            <Grid item xs={12} sm={6} lg={4} key={`post-${post.id || index}`}>
                                                <BlogCard post={post} index={index} />
                                            </Grid>
                                        ))}
                                    </Grid>

                                    {/* Empty State */}
                                    {posts.length === 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6 }}
                                            style={{ textAlign: 'center', padding: '6rem 0' }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 160,
                                                    height: 160,
                                                    backgroundColor: 'var(--sage-50)',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mx: 'auto',
                                                    mb: 6,
                                                    border: '8px solid var(--sage-100)',
                                                }}
                                            >
                                                <SearchOutlined sx={{ fontSize: 64, color: 'var(--sage-400)' }} />
                                            </Box>

                                            <Typography
                                                variant="h3"
                                                sx={{
                                                    color: 'var(--stone-700)',
                                                    fontWeight: 300,
                                                    mb: 3,
                                                    fontSize: { xs: '2rem', md: '2.5rem' }
                                                }}
                                            >
                                                No Articles Found
                                            </Typography>

                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    color: 'var(--stone-500)',
                                                    fontWeight: 300,
                                                    mb: 6,
                                                    maxWidth: 500,
                                                    mx: 'auto',
                                                    lineHeight: 1.6
                                                }}
                                            >
                                                {selectedCategory !== 'all'
                                                    ? `No articles found in the "${categories.find(c => c.id === selectedCategory)?.label}" category. Explore other categories or check back soon for new content.`
                                                    : 'Our team is working on creating amazing content for you. Check back soon for fresh insights and ideas.'
                                                }
                                            </Typography>

                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
                                                <Button
                                                    onClick={() => setSelectedCategory('all')}
                                                    variant="contained"
                                                    sx={{
                                                        backgroundColor: 'var(--sage-600)',
                                                        color: 'white',
                                                        borderRadius: '50px',
                                                        px: 6,
                                                        py: 2,
                                                        fontWeight: 500,
                                                        fontSize: '1rem',
                                                        boxShadow: '0 8px 24px -8px rgba(139, 148, 113, 0.4)',
                                                        '&:hover': {
                                                            backgroundColor: 'var(--sage-700)',
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 12px 32px -8px rgba(139, 148, 113, 0.5)',
                                                        }
                                                    }}
                                                >
                                                    {selectedCategory !== 'all' ? 'View All Articles' : 'Refresh'}
                                                </Button>

                                                <Link to="/contact" style={{ textDecoration: 'none' }}>
                                                    <Button
                                                        variant="outlined"
                                                        sx={{
                                                            borderColor: 'var(--sage-400)',
                                                            color: 'var(--sage-600)',
                                                            borderRadius: '50px',
                                                            px: 6,
                                                            py: 2,
                                                            fontWeight: 500,
                                                            fontSize: '1rem',
                                                            '&:hover': {
                                                                backgroundColor: 'var(--sage-50)',
                                                                borderColor: 'var(--sage-500)',
                                                                transform: 'translateY(-2px)',
                                                            }
                                                        }}
                                                    >
                                                        Subscribe for Updates
                                                    </Button>
                                                </Link>
                                            </Stack>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        )}

                        {/* Enhanced Pagination */}
                        {pagination?.totalPages > 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center' }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        backgroundColor: 'var(--stone-50)',
                                        borderRadius: '20px',
                                        p: 1,
                                        border: '1px solid var(--stone-100)',
                                    }}
                                >
                                    <IconButton
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        sx={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: '12px',
                                            color: page === 1 ? 'var(--stone-400)' : 'var(--stone-600)',
                                            '&:hover': {
                                                backgroundColor: page === 1 ? 'transparent' : 'var(--stone-100)',
                                            },
                                            '&:disabled': {
                                                color: 'var(--stone-300)',
                                            }
                                        }}
                                    >
                                        <ArrowOutward sx={{ transform: 'rotate(180deg)', fontSize: 20 }} />
                                    </IconButton>

                                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                        let pageNum
                                        if (pagination.totalPages <= 5) {
                                            pageNum = i + 1
                                        } else if (page <= 3) {
                                            pageNum = i + 1
                                        } else if (page >= pagination.totalPages - 2) {
                                            pageNum = pagination.totalPages - 4 + i
                                        } else {
                                            pageNum = page - 2 + i
                                        }

                                        return (
                                            <Button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                sx={{
                                                    minWidth: 44,
                                                    height: 44,
                                                    borderRadius: '12px',
                                                    fontWeight: 500,
                                                    fontSize: '0.875rem',
                                                    transition: 'all 0.3s ease',
                                                    ...(page === pageNum
                                                        ? {
                                                            backgroundColor: 'var(--sage-600)',
                                                            color: 'white',
                                                            boxShadow: '0 4px 12px -2px rgba(139, 148, 113, 0.4)',
                                                        }
                                                        : {
                                                            backgroundColor: 'transparent',
                                                            color: 'var(--stone-600)',
                                                            '&:hover': {
                                                                backgroundColor: 'var(--stone-100)',
                                                            }
                                                        }
                                                    )
                                                }}
                                            >
                                                {pageNum}
                                            </Button>
                                        )
                                    })}

                                    <IconButton
                                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                        disabled={page === pagination.totalPages}
                                        sx={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: '12px',
                                            color: page === pagination.totalPages ? 'var(--stone-400)' : 'var(--stone-600)',
                                            '&:hover': {
                                                backgroundColor: page === pagination.totalPages ? 'transparent' : 'var(--stone-100)',
                                            },
                                            '&:disabled': {
                                                color: 'var(--stone-300)',
                                            }
                                        }}
                                    >
                                        <ArrowOutward sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Box>
                            </motion.div>
                        )}
                    </Container>
                </section>

                {/* Newsletter/CTA Section */}
                <section
                    style={{
                        padding: '8rem 0',
                        background: 'linear-gradient(135deg, var(--stone-900) 0%, var(--stone-800) 100%)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Artistic Background Elements */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '20%',
                            right: '10%',
                            width: 400,
                            height: 400,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, var(--sage-400) 0%, transparent 70%)',
                            opacity: 0.1,
                            filter: 'blur(80px)',
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: '10%',
                            left: '5%',
                            width: 300,
                            height: 300,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, var(--coral-400) 0%, transparent 70%)',
                            opacity: 0.08,
                            filter: 'blur(60px)',
                        }}
                    />

                    {/* Geometric Pattern Overlay */}
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            opacity: 0.03,
                            backgroundImage: `repeating-linear-gradient(
                                45deg,
                                transparent,
                                transparent 50px,
                                rgba(255,255,255,0.1) 50px,
                                rgba(255,255,255,0.1) 52px
                            )`,
                        }}
                    />

                    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center' }}
                        >
                            <Typography
                                variant="h2"
                                sx={{
                                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4.5rem' },
                                    fontWeight: 200,
                                    mb: 4,
                                    color: 'white',
                                    letterSpacing: '-0.02em',
                                    lineHeight: 0.9,
                                }}
                            >
                                Stay Updated with
                                <br />
                                <span style={{ fontWeight: 400, fontStyle: 'italic', color: 'var(--sage-300)' }}>
                                    Our Latest Insights
                                </span>
                            </Typography>

                            <Typography
                                variant="h5"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    fontWeight: 300,
                                    mb: 8,
                                    maxWidth: '700px',
                                    mx: 'auto',
                                    lineHeight: 1.5,
                                    fontSize: { xs: '1.25rem', md: '1.5rem' }
                                }}
                            >
                                Join thousands of professionals who get our weekly insights on design, development, and digital innovation delivered straight to their inbox.
                            </Typography>

                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={4}
                                justifyContent="center"
                                sx={{ mb: 10 }}
                            >
                                <Link to="/contact" style={{ textDecoration: 'none' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -3 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            background: 'linear-gradient(135deg, var(--sage-500) 0%, var(--sage-600) 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50px',
                                            padding: '20px 40px',
                                            fontSize: '1.1rem',
                                            fontWeight: 600,
                                            letterSpacing: '0.025em',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            boxShadow: '0 12px 32px -8px rgba(139, 148, 113, 0.4)',
                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            minWidth: '220px',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        Subscribe Now
                                        <ArrowOutward sx={{ fontSize: 20 }} />
                                    </motion.button>
                                </Link>

                                <Link to="/about" style={{ textDecoration: 'none' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -3 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            backgroundColor: 'transparent',
                                            color: 'white',
                                            border: '2px solid rgba(255, 255, 255, 0.3)',
                                            borderRadius: '50px',
                                            padding: '18px 40px',
                                            fontSize: '1.1rem',
                                            fontWeight: 500,
                                            letterSpacing: '0.025em',
                                            cursor: 'pointer',
                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            minWidth: '220px',
                                            backdropFilter: 'blur(10px)',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.borderColor = 'white'
                                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                                            e.target.style.boxShadow = '0 8px 24px -8px rgba(255, 255, 255, 0.2)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                                            e.target.style.backgroundColor = 'transparent'
                                            e.target.style.boxShadow = 'none'
                                        }}
                                    >
                                        Learn About Us
                                    </motion.button>
                                </Link>
                            </Stack>

                            {/* Blog Stats */}
                            <Grid container spacing={4} justifyContent="center" sx={{ maxWidth: 800, mx: 'auto' }}>
                                <Grid item xs={6} md={3}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.1 }}
                                        viewport={{ once: true }}
                                        style={{ textAlign: 'center' }}
                                    >
                                        <Typography
                                            variant="h3"
                                            sx={{
                                                color: 'white',
                                                fontWeight: 600,
                                                mb: 1,
                                                fontSize: { xs: '1.5rem', md: '2rem' }
                                            }}
                                        >
                                            {total || '50+'}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                fontSize: '0.875rem',
                                                fontWeight: 400
                                            }}
                                        >
                                            Articles Published
                                        </Typography>
                                    </motion.div>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                        viewport={{ once: true }}
                                        style={{ textAlign: 'center' }}
                                    >
                                        <Typography
                                            variant="h3"
                                            sx={{
                                                color: 'white',
                                                fontWeight: 600,
                                                mb: 1,
                                                fontSize: { xs: '1.5rem', md: '2rem' }
                                            }}
                                        >
                                            10K+
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                fontSize: '0.875rem',
                                                fontWeight: 400
                                            }}
                                        >
                                            Monthly Readers
                                        </Typography>
                                    </motion.div>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.3 }}
                                        viewport={{ once: true }}
                                        style={{ textAlign: 'center' }}
                                    >
                                        <Typography
                                            variant="h3"
                                            sx={{
                                                color: 'white',
                                                fontWeight: 600,
                                                mb: 1,
                                                fontSize: { xs: '1.5rem', md: '2rem' }
                                            }}
                                        >
                                            {categories.length - 1}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                fontSize: '0.875rem',
                                                fontWeight: 400
                                            }}
                                        >
                                            Categories
                                        </Typography>
                                    </motion.div>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.4 }}
                                        viewport={{ once: true }}
                                        style={{ textAlign: 'center' }}
                                    >
                                        <Typography
                                            variant="h3"
                                            sx={{
                                                color: 'white',
                                                fontWeight: 600,
                                                mb: 1,
                                                fontSize: { xs: '1.5rem', md: '2rem' }
                                            }}
                                        >
                                            Weekly
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                fontSize: '0.875rem',
                                                fontWeight: 400
                                            }}
                                        >
                                            New Content
                                        </Typography>
                                    </motion.div>
                                </Grid>
                            </Grid>

                            {/* Trust Statement */}
                            <Box sx={{ mt: 8, pt: 6, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        fontSize: '1rem',
                                        lineHeight: 1.6,
                                        fontStyle: 'italic',
                                        maxWidth: 600,
                                        mx: 'auto'
                                    }}
                                >
                                    "Knowledge shared is knowledge multiplied. Join our community of forward-thinking professionals who are shaping the future of digital innovation."
                                </Typography>
                            </Box>
                        </motion.div>
                    </Container>
                </section>

                {/* Enhanced Background decorations */}
                <Box
                    sx={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: -10,
                        overflow: 'hidden',
                        pointerEvents: 'none',
                    }}
                >
                    <motion.div
                        animate={{
                            x: [0, 30, 0],
                            y: [0, -20, 0],
                            rotate: [0, 2, 0]
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{
                            position: 'absolute',
                            top: '25%',
                            right: '0',
                            width: '400px',
                            height: '400px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, var(--sage-100) 0%, transparent 70%)',
                            opacity: 0.3,
                            filter: 'blur(60px)',
                        }}
                    />
                    <motion.div
                        animate={{
                            x: [0, -25, 0],
                            y: [0, 30, 0],
                            rotate: [0, -2, 0]
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 5
                        }}
                        style={{
                            position: 'absolute',
                            bottom: '25%',
                            left: '0',
                            width: '350px',
                            height: '350px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, var(--coral-100) 0%, transparent 70%)',
                            opacity: 0.25,
                            filter: 'blur(50px)',
                        }}
                    />
                </Box>
            </Box>
        </>
    )
}

export default Blog