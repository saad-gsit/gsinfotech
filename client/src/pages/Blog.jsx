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
    Alert
} from '@mui/material'
import {
    EastOutlined,
    CalendarTodayOutlined,
    PersonOutlineOutlined,
    LocalOfferOutlined,
    SearchOutlined,
    TrendingUpOutlined,
    Refresh
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

    // Process categories with counts
    const [categories, setCategories] = useState([
        { id: 'all', label: 'All Posts', count: 0 },
        { id: 'development', label: 'Development', count: 0 },
        { id: 'design', label: 'Design', count: 0 },
        { id: 'technology', label: 'Technology', count: 0 },
        { id: 'business', label: 'Business', count: 0 }
    ])

    // Update categories from API data
    useEffect(() => {
        if (categoriesData && !categoriesError) {
            const apiCategories = categoriesData.map(cat => ({
                id: cat.slug || cat.name.toLowerCase(),
                label: cat.name,
                count: cat.count || 0
            }))

            setCategories([
                { id: 'all', label: 'All Posts', count: total },
                ...apiCategories
            ])
        } else if (posts.length > 0) {
            // Fallback: calculate from posts
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

    return (
        <>
            <Helmet>
                <title>Blog - GS Infotech | Insights & Ideas</title>
                <meta name="description" content="Thoughts on design, development, and digital innovation from our team." />
            </Helmet>

            <Box className="bg-white min-h-screen">
                {/* Hero Section - Minimal */}
                <section className="pt-32 pb-20 bg-gray-50 relative overflow-hidden">
                    {/* Subtle pattern */}
                    <div className="absolute inset-0 opacity-[0.02]">
                        <div className="absolute h-full w-full" style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }} />
                    </div>

                    <Container maxWidth="lg" className="relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-3xl"
                        >
                            <Typography variant="overline" className="text-gray-500 tracking-widest mb-4">
                                BLOG
                            </Typography>

                            <Typography variant="h1" className="text-6xl md:text-7xl font-light mb-6 leading-[0.9]">
                                Insights &
                                <br />
                                <span className="font-semibold">Ideas</span>
                            </Typography>

                            <Typography variant="h5" className="text-gray-600 font-light leading-relaxed">
                                Thoughts on design, development, and digital innovation from our team.
                            </Typography>
                        </motion.div>
                    </Container>
                </section>

                {/* Categories - Minimal Pills */}
                <section className="py-8 border-b border-gray-200 sticky top-0 bg-white z-40">
                    <Container maxWidth="lg">
                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{
                                overflowX: 'auto',
                                '&::-webkit-scrollbar': { display: 'none' },
                                msOverflowStyle: 'none',
                                scrollbarWidth: 'none'
                            }}
                        >
                            {categories.map((category, index) => (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Chip
                                        label={
                                            <Box className="flex items-center gap-2">
                                                <span>{category.label}</span>
                                                <span className="text-xs text-gray-400">({category.count})</span>
                                            </Box>
                                        }
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`
                                            cursor-pointer px-4 py-2 font-light tracking-wide
                                            ${selectedCategory === category.id
                                                ? 'bg-black text-white'
                                                : 'bg-transparent border-gray-300 hover:border-black'
                                            }
                                        `}
                                        variant={selectedCategory === category.id ? "filled" : "outlined"}
                                        sx={{
                                            borderRadius: '0',
                                            transition: 'all 0.3s ease',
                                            '& .MuiChip-label': {
                                                px: 2,
                                                py: 1
                                            }
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </Stack>

                        {/* Results count */}
                        {!isLoading && (
                            <Typography variant="caption" className="text-gray-500 mt-2 block">
                                {total} posts found
                                {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                            </Typography>
                        )}
                    </Container>
                </section>

                {/* Featured Post - Clean Layout */}
                {!isLoading && featuredPost && (
                    <section className="py-16 bg-white">
                        <Container maxWidth="lg">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <Link to={`/blog/${featuredPost.slug || featuredPost.id}`} className="no-underline">
                                    <Box className="group cursor-pointer">
                                        <Grid container spacing={6} alignItems="center">
                                            <Grid item xs={12} md={6}>
                                                <Box className="relative overflow-hidden">
                                                    <img
                                                        src={featuredPost.featured_image || featuredPost.image || 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=400&fit=crop'}
                                                        alt={featuredPost.title}
                                                        className="w-full h-96 object-cover transition-transform duration-700 group-hover:scale-105"
                                                        onError={(e) => {
                                                            e.target.src = 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=400&fit=crop'
                                                        }}
                                                    />
                                                    <Box className="absolute top-4 left-4">
                                                        <Chip
                                                            icon={<TrendingUpOutlined className="text-xs" />}
                                                            label="Featured"
                                                            size="small"
                                                            className="bg-white/90 backdrop-blur-sm font-medium"
                                                        />
                                                    </Box>
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Box className="py-8">
                                                    <Stack direction="row" spacing={3} className="mb-4 text-sm text-gray-500">
                                                        <Box className="flex items-center gap-1">
                                                            <PersonOutlineOutlined fontSize="small" />
                                                            {featuredPost.author_name || featuredPost.author || 'GS Team'}
                                                        </Box>
                                                        <Box className="flex items-center gap-1">
                                                            <CalendarTodayOutlined fontSize="small" />
                                                            {new Date(featuredPost.published_at || featuredPost.created_at).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </Box>
                                                        <Box>{featuredPost.reading_time || featuredPost.readTime || '5 min read'}</Box>
                                                    </Stack>

                                                    <Typography
                                                        variant="h3"
                                                        className="font-light mb-4 leading-tight group-hover:text-gray-700 transition-colors"
                                                    >
                                                        {featuredPost.title}
                                                    </Typography>

                                                    <Typography
                                                        variant="body1"
                                                        className="text-gray-600 mb-6 leading-relaxed"
                                                    >
                                                        {featuredPost.excerpt || featuredPost.description}
                                                    </Typography>

                                                    <Box className="flex items-center text-black font-medium">
                                                        Read Article
                                                        <EastOutlined className="ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Link>
                            </motion.div>
                        </Container>
                    </section>
                )}

                {/* Blog Posts Grid - Minimal Cards */}
                <section className="py-16 bg-gray-50">
                    <Container maxWidth="lg">
                        {/* Loading State */}
                        {isLoading && (
                            <Grid container spacing={4}>
                                {[...Array(6)].map((_, index) => (
                                    <Grid item xs={12} md={6} lg={4} key={index}>
                                        <Box>
                                            <Skeleton variant="rectangular" height={240} sx={{ mb: 2 }} />
                                            <Skeleton variant="text" height={32} width="80%" sx={{ mb: 1 }} />
                                            <Skeleton variant="text" height={24} sx={{ mb: 2 }} />
                                            <Skeleton variant="text" height={20} width="60%" />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        )}

                        {/* Error State */}
                        {isError && (
                            <Box className="text-center py-12">
                                <Alert severity="error" className="mb-4 max-w-md mx-auto">
                                    <Typography variant="h6" className="mb-2">
                                        Unable to load blog posts
                                    </Typography>
                                    <Typography variant="body2">
                                        {error?.response?.data?.message || error?.message || 'Something went wrong while fetching blog posts.'}
                                    </Typography>
                                </Alert>
                                <Button
                                    variant="outlined"
                                    onClick={() => refetch()}
                                    startIcon={<Refresh />}
                                    className="border-black text-black hover:bg-black hover:text-white rounded-none"
                                >
                                    Try Again
                                </Button>
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
                                    <Grid container spacing={4}>
                                        {posts.map((post, index) => (
                                            <Grid item xs={12} md={6} lg={4} key={`post-${post.id || index}`}>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                                    whileHover={{ y: -8 }}
                                                >
                                                    <Link to={`/blog/${post.slug || post.id}`} className="no-underline">
                                                        <Box className="group cursor-pointer h-full">
                                                            <Box className="bg-white h-full transition-all duration-300 hover:shadow-xl">
                                                                {/* Image */}
                                                                <Box className="relative overflow-hidden">
                                                                    <img
                                                                        src={post.featured_image || post.image || `https://images.unsplash.com/photo-${['1486312338-8e4fe20b1f5a', '1519389950473-47ba0277781c', '1498050108023-c5249f4df085'][index % 3]}?w=400&h=250&fit=crop`}
                                                                        alt={post.title}
                                                                        className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-105"
                                                                        onError={(e) => {
                                                                            e.target.src = `https://images.unsplash.com/photo-1486312338-8e4fe20b1f5a?w=400&h=250&fit=crop`
                                                                        }}
                                                                    />
                                                                    {post.category && (
                                                                        <Box className="absolute top-4 left-4">
                                                                            <Chip
                                                                                label={post.category.replace('_', ' ')}
                                                                                size="small"
                                                                                className="bg-white/90 backdrop-blur-sm text-xs font-medium"
                                                                            />
                                                                        </Box>
                                                                    )}
                                                                </Box>

                                                                {/* Content */}
                                                                <Box className="p-8">
                                                                    <Stack direction="row" spacing={2} className="mb-4 text-sm text-gray-500">
                                                                        <Box className="flex items-center gap-1">
                                                                            <CalendarTodayOutlined sx={{ fontSize: 14 }} />
                                                                            {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                                                                                month: 'short',
                                                                                day: 'numeric',
                                                                                year: 'numeric'
                                                                            })}
                                                                        </Box>
                                                                        <Box>•</Box>
                                                                        <Box>{post.reading_time || post.readTime || '5 min read'}</Box>
                                                                    </Stack>

                                                                    <Typography
                                                                        variant="h5"
                                                                        className="font-medium mb-3 leading-tight group-hover:text-gray-700 transition-colors line-clamp-2"
                                                                    >
                                                                        {post.title}
                                                                    </Typography>

                                                                    <Typography
                                                                        variant="body2"
                                                                        className="text-gray-600 mb-4 leading-relaxed line-clamp-3"
                                                                    >
                                                                        {post.excerpt || post.description}
                                                                    </Typography>

                                                                    <Box className="flex items-center justify-between">
                                                                        <Box className="flex items-center gap-2">
                                                                            <Box className="w-8 h-8 rounded-full bg-gray-200" />
                                                                            <Typography variant="body2" className="text-gray-600">
                                                                                {post.author_name || post.author || 'GS Team'}
                                                                            </Typography>
                                                                        </Box>

                                                                        <IconButton
                                                                            size="small"
                                                                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                                        >
                                                                            <EastOutlined fontSize="small" />
                                                                        </IconButton>
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </Link>
                                                </motion.div>
                                            </Grid>
                                        ))}
                                    </Grid>

                                    {/* Empty State */}
                                    {posts.length === 0 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center py-16"
                                        >
                                            <Box className="max-w-md mx-auto">
                                                <Box className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                                                    <SearchOutlined className="text-gray-400 text-3xl" />
                                                </Box>
                                                <Typography variant="h5" className="font-light mb-3">
                                                    No posts found
                                                </Typography>
                                                <Typography variant="body1" className="text-gray-600 mb-6">
                                                    {selectedCategory !== 'all'
                                                        ? `No posts found in the "${selectedCategory}" category.`
                                                        : 'No blog posts available at the moment.'
                                                    }
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => setSelectedCategory('all')}
                                                    className="border-black text-black hover:bg-black hover:text-white rounded-none"
                                                >
                                                    View All Posts
                                                </Button>
                                            </Box>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        )}

                        {/* Pagination */}
                        {pagination?.totalPages > 1 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="mt-16 flex justify-center"
                            >
                                <Stack direction="row" spacing={1}>
                                    <IconButton
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="border border-gray-300 rounded-none hover:bg-black hover:text-white hover:border-black disabled:opacity-50"
                                    >
                                        <EastOutlined className="rotate-180" />
                                    </IconButton>

                                    {[...Array(pagination.totalPages)].map((_, i) => (
                                        <Button
                                            key={i + 1}
                                            onClick={() => setPage(i + 1)}
                                            className={`
                                                min-w-12 h-12 rounded-none font-light
                                                ${page === i + 1
                                                    ? 'bg-black text-white'
                                                    : 'bg-transparent text-black hover:bg-gray-100'
                                                }
                                            `}
                                        >
                                            {i + 1}
                                        </Button>
                                    ))}

                                    <IconButton
                                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                        disabled={page === pagination.totalPages}
                                        className="border border-gray-300 rounded-none hover:bg-black hover:text-white hover:border-black disabled:opacity-50"
                                    >
                                        <EastOutlined />
                                    </IconButton>
                                </Stack>
                            </motion.div>
                        )}
                    </Container>
                </section>

                {/* Background decoration */}
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 right-0 w-96 h-96 bg-gray-100 rounded-full blur-3xl opacity-30"></div>
                    <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gray-100 rounded-full blur-3xl opacity-30"></div>
                </div>
            </Box>
        </>
    )
}

export default Blog