// client/src/components/Cards/BlogCard.jsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAnimation } from '@/hooks/useAnimation'
import Card from '@/components/UI/Card'

const BlogCard = ({ post }) => {
    const { getVariants } = useAnimation()

    return (
        <motion.div variants={getVariants('fadeInUp')}>
            <Card className="h-full flex flex-col overflow-hidden">
                {/* Featured Image */}
                {post.featured_image && (
                    <div className="relative h-48 overflow-hidden">
                        <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        {post.category && (
                            <div className="absolute top-3 left-3 bg-[var(--primary)] text-white px-2 py-1 rounded-full text-xs font-medium">
                                {post.category}
                            </div>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-[var(--dark)] mb-3 line-clamp-2">
                            {post.title}
                        </h3>

                        <p className="text-gray-600 mb-4 line-clamp-3">
                            {post.excerpt || post.description}
                        </p>

                        {post.tags && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {post.tags.slice(0, 3).map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                            {post.reading_time && (
                                <span className="ml-2">• {post.reading_time} min read</span>
                            )}
                        </div>

                        <Link
                            to={`/blog/${post.slug}`}
                            className="text-[var(--primary)] hover:text-[var(--primary-dark)] font-medium transition-colors"
                        >
                            Read More →
                        </Link>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}

export default BlogCard