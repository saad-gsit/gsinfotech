import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
    Container,
    Typography,
    Box,
    Chip,
    Stack,
    Button,
    Alert,
    Skeleton
} from '@mui/material'
import {
    ArrowBackOutlined,
    CalendarTodayOutlined,
    AccessTimeOutlined,
    LocalOfferOutlined
} from '@mui/icons-material'

// Updated import - using React Query hook
import { useBlogPost } from '@/hooks/useApi'

const BlogPost = () => {
    const { slug } = useParams()

    // Updated hook usage - using React Query
    const { data, isLoading, error, isError } = useBlogPost(slug)

    // Loading state
    if (isLoading) {
        return (
            <Container maxWidth="lg" className="pt-32 pb-16">
                <Box className="max-w-4xl mx-auto">
                    <Skeleton variant="text" width={200} height={32} className="mb-8" />
                    <Skeleton variant="text" width="80%" height={64} className="mb-4" />
                    <Skeleton variant="text" width="60%" height={32} className="mb-8" />
                    <Skeleton variant="rectangular" width="100%" height={400} className="mb-8" />
                    <Skeleton variant="text" width="100%" height={24} className="mb-2" />
                    <Skeleton variant="text" width="100%" height={24} className="mb-2" />
                    <Skeleton variant="text" width="80%" height={24} />
                </Box>
            </Container>
        )
    }

    // Error state
    if (isError || !data) {
        return (
            <Container maxWidth="lg" className="pt-32 pb-16">
                <Box className="max-w-4xl mx-auto text-center">
                    <Alert severity="error" className="mb-8">
                        <Typography variant="h6" className="mb-2">
                            Post Not Found
                        </Typography>
                        <Typography variant="body2">
                            {error?.response?.data?.message || "The blog post you're looking for doesn't exist."}
                        </Typography>
                    </Alert>
                    <Link to="/blog" className="no-underline">
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackOutlined />}
                            className="border-black text-black hover:bg-black hover:text-white rounded-none"
                        >
                            Back to Blog
                        </Button>
                    </Link>
                </Box>
            </Container>
        )
    }

    // Handle different response structures
    const post = data.post || data

    return (
        <>
            <Helmet>
                <title>{post.title} - GS Infotech Blog</title>
                <meta name="description" content={post.excerpt || post.description} />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.excerpt || post.description} />
                {post.featured_image && <meta property="og:image" content={post.featured_image} />}
            </Helmet>

            <article className="bg-white">
                {/* Hero Section */}
                <section className="pt-32 pb-16 bg-gray-50">
                    <Container maxWidth="lg">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-4xl mx-auto"
                        >
                            {/* Breadcrumb */}
                            <Link to="/blog" className="no-underline">
                                <Button
                                    startIcon={<ArrowBackOutlined />}
                                    className="text-gray-600 hover:text-black mb-8 normal-case"
                                >
                                    Back to Blog
                                </Button>
                            </Link>

                            {/* Post Meta */}
                            <Stack direction="row" spacing={3} className="mb-6 text-sm text-gray-500">
                                <Box className="flex items-center gap-1">
                                    <CalendarTodayOutlined fontSize="small" />
                                    {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </Box>
                                {post.reading_time && (
                                    <Box className="flex items-center gap-1">
                                        <AccessTimeOutlined fontSize="small" />
                                        {post.reading_time} min read
                                    </Box>
                                )}
                                {post.author_name && (
                                    <Box>
                                        By {post.author_name}
                                    </Box>
                                )}
                            </Stack>

                            {/* Title */}
                            <Typography
                                variant="h1"
                                className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight"
                            >
                                {post.title}
                            </Typography>

                            {/* Excerpt */}
                            {post.excerpt && (
                                <Typography
                                    variant="h6"
                                    className="text-gray-600 font-light mb-8 leading-relaxed"
                                >
                                    {post.excerpt}
                                </Typography>
                            )}

                            {/* Tags */}
                            {(post.tags || post.category) && (
                                <Stack direction="row" spacing={1} className="flex-wrap gap-y-2">
                                    {post.category && (
                                        <Chip
                                            icon={<LocalOfferOutlined fontSize="small" />}
                                            label={post.category.replace('_', ' ')}
                                            className="bg-black text-white rounded-none"
                                            size="small"
                                        />
                                    )}
                                    {post.tags && Array.isArray(post.tags) && post.tags.map((tag, index) => (
                                        <Chip
                                            key={index}
                                            label={`#${tag}`}
                                            variant="outlined"
                                            className="border-gray-300 text-gray-600 rounded-none"
                                            size="small"
                                        />
                                    ))}
                                </Stack>
                            )}
                        </motion.div>
                    </Container>
                </section>

                {/* Featured Image */}
                {post.featured_image && (
                    <section className="py-8 bg-white">
                        <Container maxWidth="lg">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="max-w-4xl mx-auto"
                            >
                                <img
                                    src={post.featured_image}
                                    alt={post.title}
                                    className="w-full h-96 md:h-[500px] object-cover shadow-xl"
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                    }}
                                />
                            </motion.div>
                        </Container>
                    </section>
                )}

                {/* Post Content */}
                <section className="py-16 bg-white">
                    <Container maxWidth="lg">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="max-w-4xl mx-auto"
                        >
                            <Box
                                className="prose prose-lg prose-gray max-w-none"
                                sx={{
                                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                                        fontFamily: 'inherit',
                                        fontWeight: 500,
                                        color: '#111827',
                                        marginTop: '2rem',
                                        marginBottom: '1rem',
                                    },
                                    '& h1': { fontSize: '2.25rem' },
                                    '& h2': { fontSize: '1.875rem' },
                                    '& h3': { fontSize: '1.5rem' },
                                    '& p': {
                                        marginBottom: '1.5rem',
                                        lineHeight: '1.75',
                                        color: '#374151',
                                    },
                                    '& a': {
                                        color: '#000',
                                        textDecoration: 'underline',
                                        '&:hover': {
                                            color: '#374151',
                                        }
                                    },
                                    '& img': {
                                        borderRadius: '0.5rem',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                        margin: '2rem 0',
                                    },
                                    '& blockquote': {
                                        borderLeft: '4px solid #000',
                                        paddingLeft: '1.5rem',
                                        fontStyle: 'italic',
                                        fontSize: '1.125rem',
                                        color: '#6B7280',
                                        margin: '2rem 0',
                                    },
                                    '& code': {
                                        backgroundColor: '#F3F4F6',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        fontSize: '0.875rem',
                                        fontFamily: 'ui-monospace, SFMono-Regular, "Cascadia Code", Consolas, monospace',
                                    },
                                    '& pre': {
                                        backgroundColor: '#1F2937',
                                        color: '#F9FAFB',
                                        padding: '1.5rem',
                                        borderRadius: '0.5rem',
                                        overflow: 'auto',
                                        margin: '2rem 0',
                                        '& code': {
                                            backgroundColor: 'transparent',
                                            color: 'inherit',
                                            padding: 0,
                                        }
                                    },
                                    '& ul, & ol': {
                                        paddingLeft: '2rem',
                                        marginBottom: '1.5rem',
                                    },
                                    '& li': {
                                        marginBottom: '0.5rem',
                                    }
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: post.content || post.description || '<p>No content available.</p>'
                                }}
                            />
                        </motion.div>
                    </Container>
                </section>

                {/* Back to Blog CTA */}
                <section className="py-16 bg-gray-50">
                    <Container maxWidth="lg">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="max-w-4xl mx-auto text-center"
                        >
                            <Typography variant="h4" className="font-light mb-6">
                                Enjoyed this article?
                            </Typography>
                            <Typography variant="body1" className="text-gray-600 mb-8">
                                Check out more insights and ideas from our team.
                            </Typography>
                            <Link to="/blog" className="no-underline">
                                <Button
                                    variant="contained"
                                    size="large"
                                    className="bg-black hover:bg-gray-900 text-white rounded-none px-8 py-3 font-light tracking-wide normal-case"
                                >
                                    More Articles
                                </Button>
                            </Link>
                        </motion.div>
                    </Container>
                </section>
            </article>
        </>
    )
}

export default BlogPost