import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
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
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()

    // Get URL parameters or use defaults
    const urlPage = parseInt(searchParams.get('page')) || 1
    const urlCategory = searchParams.get('category') || 'all'
    const urlSearch = searchParams.get('search') || ''

    // Use URL parameters as state
    const [selectedCategory, setSelectedCategory] = useState(urlCategory)
    const [page, setPage] = useState(urlPage)
    const [searchTerm, setSearchTerm] = useState(urlSearch)

    // Update URL when state changes
    const updateURL = (newPage, newCategory, newSearch) => {
        const params = new URLSearchParams()

        if (newPage > 1) params.set('page', newPage.toString())
        if (newCategory !== 'all') params.set('category', newCategory)
        if (newSearch) params.set('search', newSearch)

        setSearchParams(params)
    }

    // Handle page change
    const handlePageChange = (newPage) => {
        setPage(newPage)
        updateURL(newPage, selectedCategory, searchTerm)
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Handle category change
    const handleCategoryChange = (category) => {
        setSelectedCategory(category)
        setPage(1) // Reset to page 1 when changing category
        updateURL(1, category, searchTerm)
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Handle search change
    const handleSearchChange = (search) => {
        setSearchTerm(search)
        setPage(1) // Reset to page 1 when searching
        updateURL(1, selectedCategory, search)
    }

    // Sync state with URL parameters on mount and URL changes
    useEffect(() => {
        setPage(urlPage)
        setSelectedCategory(urlCategory)
        setSearchTerm(urlSearch)
    }, [urlPage, urlCategory, urlSearch])

    // Build query parameters for API
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

    // Use your existing React Query hooks with dependency on queryParams
    const {
        data: blogData,
        isLoading,
        error,
        refetch,
        isError,
        isFetching
    } = useBlogPosts(queryParams, {
        // Add these options to ensure proper refetching
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 0, // Always consider data stale
        cacheTime: 1000 * 60 * 5, // Cache for 5 minutes
    })

    const { data: featuredPostsData } = useFeaturedPosts(1)
    const { data: categoriesData, isError: categoriesError } = useBlogCategories()

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

    // BlogCard component remains the same
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
                            height: isLarge ? '500px' : '420px',
                            border: 'none',
                            borderRadius: '24px',
                            backgroundColor: 'white',
                            boxShadow: '0 8px 32px -8px rgba(139, 148, 113, 0.15)',
                            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
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
                                height: isLarge ? 240 : 180,
                                overflow: 'hidden',
                                backgroundColor: '#f8f9fa',
                                flexShrink: 0
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
                        <Box sx={{ p: isLarge ? 3 : 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {/* Meta Information */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexShrink: 0 }}>
                                <Avatar
                                    sx={{
                                        width: 28,
                                        height: 28,
                                        backgroundColor: 'var(--sage-100)',
                                        color: 'var(--sage-600)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }}
                                >
                                    {(post.author_name || post.author || 'GS')[0]}
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'var(--stone-600)',
                                            fontWeight: 500,
                                            display: 'block',
                                            lineHeight: 1.2,
                                            fontSize: '0.75rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {post.author_name || post.author || 'GS Team'}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'var(--stone-500)',
                                            fontSize: '0.7rem'
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
                                variant={isLarge ? "h6" : "subtitle1"}
                                sx={{
                                    fontWeight: 600,
                                    color: 'var(--stone-800)',
                                    lineHeight: 1.3,
                                    mb: 2,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    fontSize: isLarge ? '1.1rem' : '1rem',
                                    minHeight: isLarge ? '56px' : '52px',
                                    flexShrink: 0
                                }}
                            >
                                {post.title}
                            </Typography>

                            {/* Excerpt */}
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'var(--stone-600)',
                                    lineHeight: 1.5,
                                    mb: 2,
                                    display: '-webkit-box',
                                    WebkitLineClamp: isLarge ? 3 : 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    fontSize: '0.875rem',
                                    flex: 1
                                }}
                            >
                                {post.excerpt || post.description || 'Discover insights and ideas from our digital innovation journey.'}
                            </Typography>

                            {/* Footer */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, pt: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <VisibilityOutlined sx={{ fontSize: 14, color: 'var(--stone-400)' }} />
                                    <Typography variant="caption" sx={{ color: 'var(--stone-500)', fontSize: '0.75rem' }}>
                                        {post.views || Math.floor(Math.random() * 500) + 100}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'var(--sage-600)',
                                            fontWeight: 500,
                                            fontSize: '0.8rem',
                                        }}
                                    >
                                        Read More
                                    </Typography>
                                    <ArrowOutward sx={{ fontSize: 14, color: 'var(--sage-600)' }} />
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
                {/* Hero Section - Keep the same */}
                <section
                    style={{
                        paddingTop: '8rem',
                        paddingBottom: '2rem',
                        position: 'relative',
                        background: 'linear-gradient(135deg, var(--sage-50) 0%, var(--sand-50) 100%)',
                        overflow: 'hidden'
                    }}
                >
                    {/* Background Elements */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '20%',
                            right: '8%',
                            width: 200,
                            height: 200,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, var(--sage-400) 0%, transparent 70%)',
                            opacity: 0.15,
                            filter: 'blur(40px)',
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: '10%',
                            left: '5%',
                            width: 150,
                            height: 150,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, var(--coral-400) 0%, transparent 70%)',
                            opacity: 0.12,
                            filter: 'blur(35px)',
                        }}
                    />

                    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                        >
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                >
                                    <Chip
                                        icon={<ArticleOutlined sx={{ fontSize: 16 }} />}
                                        label="INSIGHTS & IDEAS"
                                        sx={{
                                            backgroundColor: 'var(--sage-400)',
                                            color: 'white',
                                            fontWeight: 500,
                                            mb: 3,
                                            px: 3,
                                            py: 0.5,
                                            borderRadius: '50px',
                                            fontSize: '0.75rem',
                                            letterSpacing: '0.1em',
                                        }}
                                    />
                                </motion.div>

                                <Typography
                                    variant="h1"
                                    sx={{
                                        fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' },
                                        fontWeight: 300,
                                        lineHeight: 0.9,
                                        letterSpacing: '-0.02em',
                                        mb: 3,
                                        color: 'var(--stone-800)',
                                    }}
                                >
                                    Stories That
                                    <br />
                                    <span style={{ fontWeight: 600, color: 'var(--sage-600)' }}>Inspire</span>
                                </Typography>

                                <Typography
                                    variant="h5"
                                    sx={{
                                        color: 'var(--stone-600)',
                                        fontWeight: 300,
                                        lineHeight: 1.6,
                                        maxWidth: '700px',
                                        mx: 'auto',
                                        mb: 4,
                                        fontSize: { xs: '1.1rem', md: '1.25rem' }
                                    }}
                                >
                                    Dive deep into the world of digital innovation, design thinking,
                                    and the technologies shaping tomorrow.
                                </Typography>
                            </Box>

                            {/* Stats Bar */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: { xs: 2, sm: 4 },
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            borderRadius: '16px',
                                            px: { xs: 2, sm: 4 },
                                            py: 2,
                                            backdropFilter: 'blur(20px)',
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                            boxShadow: '0 8px 25px -8px rgba(139, 148, 113, 0.15)',
                                            flexWrap: 'nowrap',
                                            overflowX: 'auto',
                                            '&::-webkit-scrollbar': { display: 'none' },
                                            msOverflowStyle: 'none',
                                            scrollbarWidth: 'none'
                                        }}
                                    >
                                        <Box sx={{ textAlign: 'center', minWidth: '60px' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--sage-600)', fontSize: { xs: '1.2rem', md: '1.5rem' }, lineHeight: 1 }}>
                                                {total || '50+'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'var(--stone-500)', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.05em' }}>
                                                Articles
                                            </Typography>
                                        </Box>

                                        <Box sx={{ width: 1, height: 20, backgroundColor: 'var(--stone-200)' }} />

                                        <Box sx={{ textAlign: 'center', minWidth: '60px' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--coral-500)', fontSize: { xs: '1.2rem', md: '1.5rem' }, lineHeight: 1 }}>
                                                {categories.length - 1}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'var(--stone-500)', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.05em' }}>
                                                Categories
                                            </Typography>
                                        </Box>

                                        <Box sx={{ width: 1, height: 20, backgroundColor: 'var(--stone-200)' }} />

                                        <Box sx={{ textAlign: 'center', minWidth: '60px' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--sand-600)', fontSize: { xs: '1.2rem', md: '1.5rem' }, lineHeight: 1 }}>
                                                10K+
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'var(--stone-500)', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.05em' }}>
                                                Readers
                                            </Typography>
                                        </Box>

                                        <Box sx={{ width: 1, height: 20, backgroundColor: 'var(--stone-200)' }} />

                                        <Box sx={{ textAlign: 'center', minWidth: '60px' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--stone-600)', fontSize: { xs: '1.2rem', md: '1.5rem' }, lineHeight: 1 }}>
                                                Weekly
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'var(--stone-500)', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.05em' }}>
                                                Updates
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </motion.div>
                        </motion.div>
                    </Container>
                </section>

                {/* Categories Filter - Updated with proper handlers */}
                <section
                    style={{
                        padding: '1.5rem 0',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderBottom: '1px solid var(--stone-100)',
                        position: 'sticky',
                        top: '4rem',
                        zIndex: 100,
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <Container maxWidth="lg">
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    backgroundColor: 'var(--stone-50)',
                                    borderRadius: '18px',
                                    p: 0.75,
                                    border: '1px solid var(--stone-100)',
                                    overflowX: 'auto',
                                    maxWidth: '100%',
                                    '&::-webkit-scrollbar': {
                                        height: '4px',
                                        display: 'block'
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        backgroundColor: 'transparent'
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: 'var(--stone-300)',
                                        borderRadius: '2px'
                                    },
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: 'var(--stone-300) transparent'
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
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <span>{category.label}</span>
                                                    <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>({category.count})</span>
                                                </Box>
                                            }
                                            onClick={() => handleCategoryChange(category.id)}
                                            sx={{
                                                cursor: 'pointer',
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                px: 2,
                                                py: 0.75,
                                                height: 32,
                                                borderRadius: '12px',
                                                fontWeight: 500,
                                                fontSize: '0.75rem',
                                                letterSpacing: '0.025em',
                                                whiteSpace: 'nowrap',
                                                ...(selectedCategory === category.id
                                                    ? {
                                                        backgroundColor: category.color,
                                                        color: 'white',
                                                        boxShadow: `0 4px 16px -4px ${category.color}60`,
                                                        transform: 'translateY(-1px)',
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
                                fontSize: '0.8rem',
                                fontWeight: 500
                            }}
                        >
                            {isLoading || isFetching ? 'Loading...' :
                                `${posts.length} ${posts.length === 1 ? 'article' : 'articles'}${selectedCategory !== 'all' ? ` in ${categories.find(c => c.id === selectedCategory)?.label}` : ''}`}
                        </Typography>
                    </Container>
                </section>

                {/* Featured Post Section - Keep the same but add loading state */}
                {!isLoading && featuredPost && (
                    <section style={{ padding: '4rem 0', backgroundColor: 'var(--sage-25)' }}>
                        {/* Keep the same featured post content */}
                        <Container maxWidth="lg">
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
                                        mb: 4,
                                        color: 'var(--stone-800)',
                                        textAlign: 'center',
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    Featured Article
                                </Typography>

                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Link to={`/blog/${featuredPost.slug || featuredPost.id}`} style={{ textDecoration: 'none', maxWidth: '900px', width: '100%' }}>
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
                                                <Grid item xs={12} md={6}>
                                                    <Box sx={{ position: 'relative', height: { xs: 250, md: 400 }, overflow: 'hidden' }}>
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
                                                                background: 'linear-gradient(45deg, rgba(139, 148, 113, 0.6) 0%, transparent 60%)',
                                                            }}
                                                        />

                                                        {/* Featured Badge */}
                                                        <Box sx={{ position: 'absolute', top: 20, left: 20 }}>
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

                                                <Grid item xs={12} md={6}>
                                                    <Box sx={{ p: { xs: 3, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                        {/* Author & Date */}
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                                            <Avatar
                                                                sx={{
                                                                    width: 36,
                                                                    height: 36,
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
                                                                        gap: 0.5
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
                                                            variant="h4"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: 'var(--stone-900)',
                                                                lineHeight: 1.3,
                                                                mb: 2,
                                                                fontSize: { xs: '1.5rem', md: '2rem' },
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
                                                                mb: 3,
                                                                fontSize: '1rem',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 3,
                                                                WebkitBoxOrient: 'vertical',
                                                                overflow: 'hidden',
                                                            }}
                                                        >
                                                            {featuredPost.excerpt || featuredPost.description}
                                                        </Typography>

                                                        {/* Meta Info */}
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
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
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--sage-600)' }}>
                                                            <Typography
                                                                variant="h6"
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    fontSize: '1rem',
                                                                }}
                                                            >
                                                                Read Full Article
                                                            </Typography>
                                                            <ArrowOutward sx={{ fontSize: 18 }} />
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Card>
                                    </Link>
                                </Box>
                            </motion.div>
                        </Container>
                    </section>
                )}

                {/* Blog Posts Grid - Updated with loading indicator */}
                <section style={{ padding: '4rem 0', backgroundColor: 'white' }}>
                    <Container maxWidth="lg">
                        {/* Loading State */}
                        {(isLoading || isFetching) && (
                            <Box>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontSize: { xs: '2rem', md: '2.5rem' },
                                        fontWeight: 300,
                                        mb: 4,
                                        color: 'var(--stone-800)',
                                        textAlign: 'center',
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    Latest Articles
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 4,
                                        justifyContent: 'center'
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
                                            <Card sx={{ borderRadius: '24px', overflow: 'hidden', height: '420px' }}>
                                                <Skeleton variant="rectangular" height={180} />
                                                <Box sx={{ p: 2.5 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                        <Skeleton variant="circular" width={28} height={28} />
                                                        <Box sx={{ flex: 1 }}>
                                                            <Skeleton variant="text" width="60%" height={14} />
                                                            <Skeleton variant="text" width="40%" height={12} />
                                                        </Box>
                                                    </Box>
                                                    <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
                                                    <Skeleton variant="text" width="70%" height={18} sx={{ mb: 2 }} />
                                                    <Skeleton variant="text" width="100%" height={14} sx={{ mb: 1 }} />
                                                    <Skeleton variant="text" width="80%" height={14} />
                                                </Box>
                                            </Card>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Error State */}
                        {isError && (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <Box
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            backgroundColor: 'var(--coral-50)',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 3,
                                        }}
                                    >
                                        <ArticleOutlined sx={{ fontSize: 40, color: 'var(--coral-400)' }} />
                                    </Box>
                                    <Typography variant="h5" sx={{ color: 'var(--stone-700)', fontWeight: 300, mb: 2 }}>
                                        Unable to load articles
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'var(--stone-500)', mb: 3, maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}>
                                        {error?.response?.data?.message || error?.message || 'Something went wrong while fetching our latest insights.'}
                                    </Typography>
                                    <Button
                                        onClick={() => refetch()}
                                        startIcon={<Refresh />}
                                        sx={{
                                            backgroundColor: 'var(--sage-400)',
                                            color: 'white',
                                            borderRadius: '50px',
                                            px: 4,
                                            py: 1.5,
                                            fontWeight: 500,
                                            '&:hover': {
                                                backgroundColor: 'var(--sage-500)',
                                            }
                                        }}
                                    >
                                        Try Again
                                    </Button>
                                </motion.div>
                            </Box>
                        )}

                        {/* Posts Grid */}
                        {!isLoading && !isFetching && !isError && posts && (
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
                                            mb: 4,
                                            color: 'var(--stone-800)',
                                            textAlign: 'center',
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        Latest Articles
                                    </Typography>

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
                                            {posts.map((post, index) => (
                                                <Box
                                                    key={`post-${post.id || index}`}
                                                    sx={{
                                                        width: { xs: '100%', sm: 'calc(50% - 16px)', lg: 'calc(33.333% - 21.33px)' },
                                                        maxWidth: '350px',
                                                        minWidth: '280px'
                                                    }}
                                                >
                                                    <BlogCard post={post} index={index} />
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>

                                    {/* Empty State */}
                                    {posts.length === 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6 }}
                                            style={{ textAlign: 'center', padding: '4rem 0' }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 120,
                                                    height: 120,
                                                    backgroundColor: 'var(--sage-50)',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mx: 'auto',
                                                    mb: 4,
                                                    border: '6px solid var(--sage-100)',
                                                }}
                                            >
                                                <SearchOutlined sx={{ fontSize: 48, color: 'var(--sage-400)' }} />
                                            </Box>

                                            <Typography
                                                variant="h4"
                                                sx={{
                                                    color: 'var(--stone-700)',
                                                    fontWeight: 300,
                                                    mb: 2,
                                                    fontSize: { xs: '1.75rem', md: '2rem' }
                                                }}
                                            >
                                                No Articles Found
                                            </Typography>

                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    color: 'var(--stone-500)',
                                                    fontWeight: 300,
                                                    mb: 4,
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

                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                                                <Button
                                                    onClick={() => handleCategoryChange('all')}
                                                    variant="contained"
                                                    sx={{
                                                        backgroundColor: 'var(--sage-400)',
                                                        color: 'white',
                                                        borderRadius: '50px',
                                                        px: 4,
                                                        py: 1.5,
                                                        fontWeight: 500,
                                                        fontSize: '0.9rem',
                                                        '&:hover': {
                                                            backgroundColor: 'var(--sage-500)',
                                                            transform: 'translateY(-2px)',
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
                                                            px: 4,
                                                            py: 1.5,
                                                            fontWeight: 500,
                                                            fontSize: '0.9rem',
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

                        {/* Fixed Pagination - Updated with proper handlers */}
                        {pagination?.totalPages > 1 && !isLoading && !isFetching && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        backgroundColor: 'var(--stone-50)',
                                        borderRadius: '16px',
                                        p: 0.5,
                                        border: '1px solid var(--stone-100)',
                                    }}
                                >
                                    <IconButton
                                        onClick={() => handlePageChange(Math.max(1, page - 1))}
                                        disabled={page === 1}
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '10px',
                                            color: page === 1 ? 'var(--stone-400)' : 'var(--stone-600)',
                                            '&:hover': {
                                                backgroundColor: page === 1 ? 'transparent' : 'var(--stone-100)',
                                            },
                                            '&:disabled': {
                                                color: 'var(--stone-300)',
                                            }
                                        }}
                                    >
                                        <ArrowOutward sx={{ transform: 'rotate(180deg)', fontSize: 18 }} />
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
                                                onClick={() => handlePageChange(pageNum)}
                                                sx={{
                                                    minWidth: 36,
                                                    height: 36,
                                                    borderRadius: '10px',
                                                    fontWeight: 500,
                                                    fontSize: '0.8rem',
                                                    transition: 'all 0.3s ease',
                                                    ...(page === pageNum
                                                        ? {
                                                            backgroundColor: 'var(--sage-400)',
                                                            color: 'white',
                                                            boxShadow: '0 4px 12px -4px rgba(139, 148, 113, 0.4)',
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
                                        onClick={() => handlePageChange(Math.min(pagination.totalPages, page + 1))}
                                        disabled={page === pagination.totalPages}
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: '10px',
                                            color: page === pagination.totalPages ? 'var(--stone-400)' : 'var(--stone-600)',
                                            '&:hover': {
                                                backgroundColor: page === pagination.totalPages ? 'transparent' : 'var(--stone-100)',
                                            },
                                            '&:disabled': {
                                                color: 'var(--stone-300)',
                                            }
                                        }}
                                    >
                                        <ArrowOutward sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </Box>
                            </motion.div>
                        )}
                    </Container>
                </section>

                {/* Newsletter/CTA Section - Keep the same */}
                <section
                    style={{
                        padding: '6rem 0',
                        background: 'linear-gradient(135deg, var(--stone-800) 0%, var(--stone-900) 100%)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Background Elements */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '20%',
                            right: '10%',
                            width: 300,
                            height: 300,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, var(--sage-400) 0%, transparent 70%)',
                            opacity: 0.08,
                            filter: 'blur(60px)',
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: '15%',
                            left: '8%',
                            width: 250,
                            height: 250,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, var(--coral-400) 0%, transparent 70%)',
                            opacity: 0.06,
                            filter: 'blur(50px)',
                        }}
                    />

                    {/* Pattern Overlay */}
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            opacity: 0.02,
                            backgroundImage: `repeating-linear-gradient(
                                45deg,
                                transparent,
                                transparent 40px,
                                rgba(255,255,255,0.1) 40px,
                                rgba(255,255,255,0.1) 42px
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
                                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                                    fontWeight: 300,
                                    mb: 3,
                                    color: 'white',
                                    letterSpacing: '-0.02em',
                                    lineHeight: 1.1,
                                }}
                            >
                                Stay Updated with
                                <br />
                                <span style={{ fontWeight: 600, color: 'var(--sage-300)' }}>
                                    Our Latest Insights
                                </span>
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
                                    fontSize: { xs: '1.1rem', md: '1.25rem' }
                                }}
                            >
                                Join thousands of professionals who get our weekly insights on design, development, and digital innovation delivered straight to their inbox.
                            </Typography>

                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={3}
                                justifyContent="center"
                                sx={{ mb: 8 }}
                            >
                                <Link to="/contact" style={{ textDecoration: 'none' }}>
                                    <Button
                                        variant="contained"
                                        endIcon={<ArrowOutward />}
                                        sx={{
                                            background: 'linear-gradient(135deg, var(--sage-400) 0%, var(--sage-500) 100%)',
                                            color: 'white',
                                            borderRadius: '50px',
                                            px: 6,
                                            py: 2.5,
                                            fontSize: '1rem',
                                            fontWeight: 500,
                                            letterSpacing: '0.025em',
                                            textTransform: 'none',
                                            boxShadow: '0 12px 32px -8px rgba(139, 148, 113, 0.4)',
                                            transition: 'all 0.4s ease',
                                            minWidth: '200px',
                                            '&:hover': {
                                                transform: 'translateY(-3px)',
                                                boxShadow: '0 16px 40px -8px rgba(139, 148, 113, 0.5)',
                                            }
                                        }}
                                    >
                                        Subscribe Now
                                    </Button>
                                </Link>

                                <Link to="/about" style={{ textDecoration: 'none' }}>
                                    <Button
                                        variant="outlined"
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
                                            minWidth: '200px',
                                            backdropFilter: 'blur(10px)',
                                            '&:hover': {
                                                borderColor: 'white',
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 24px -8px rgba(255, 255, 255, 0.2)',
                                            }
                                        }}
                                    >
                                        Learn About Us
                                    </Button>
                                </Link>
                            </Stack>

                            {/* Blog Stats - Center Aligned */}
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 4,
                                        justifyContent: 'center',
                                        maxWidth: '600px'
                                    }}
                                >
                                    {[
                                        { value: total || '50+', label: 'Articles Published' },
                                        { value: '10K+', label: 'Monthly Readers' },
                                        { value: categories.length - 1, label: 'Categories' },
                                        { value: 'Weekly', label: 'New Content' }
                                    ].map((stat, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                textAlign: 'center',
                                                minWidth: { xs: 'calc(50% - 16px)', sm: '120px' }
                                            }}
                                        >
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                                viewport={{ once: true }}
                                                style={{ textAlign: 'center' }}
                                            >
                                                <Typography
                                                    variant="h4"
                                                    sx={{
                                                        color: 'white',
                                                        fontWeight: 600,
                                                        mb: 0.5,
                                                        fontSize: { xs: '1.5rem', md: '1.75rem' }
                                                    }}
                                                >
                                                    {stat.value}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: 'rgba(255, 255, 255, 0.7)',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 400,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em'
                                                    }}
                                                >
                                                    {stat.label}
                                                </Typography>
                                            </motion.div>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            {/* Trust Statement */}
                            <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: '1rem',
                                        lineHeight: 1.6,
                                        fontStyle: 'italic',
                                        maxWidth: 500,
                                        mx: 'auto'
                                    }}
                                >
                                    "Knowledge shared is knowledge multiplied. Join our community of forward-thinking professionals who are shaping the future of digital innovation."
                                </Typography>
                            </Box>
                        </motion.div>
                    </Container>
                </section>

                {/* Enhanced Background Decorations */}
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
                            x: [0, 20, 0],
                            y: [0, -15, 0],
                            rotate: [0, 1, 0]
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{
                            position: 'absolute',
                            top: '20%',
                            right: '-5%',
                            width: '300px',
                            height: '300px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, var(--sage-100) 0%, transparent 70%)',
                            opacity: 0.2,
                            filter: 'blur(50px)',
                        }}
                    />
                    <motion.div
                        animate={{
                            x: [0, -15, 0],
                            y: [0, 20, 0],
                            rotate: [0, -1, 0]
                        }}
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 10
                        }}
                        style={{
                            position: 'absolute',
                            bottom: '20%',
                            left: '-5%',
                            width: '250px',
                            height: '250px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, var(--coral-100) 0%, transparent 70%)',
                            opacity: 0.15,
                            filter: 'blur(40px)',
                        }}
                    />
                </Box>
            </Box>
        </>
    )
}

export default Blog