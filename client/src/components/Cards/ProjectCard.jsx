import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAnimation } from '@/hooks/useAnimation'
import Card from '@/components/UI/Card'

const ProjectCard = ({ project, index = 0 }) => {
    const { getVariants } = useAnimation()
    const [imageError, setImageError] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    // Enhanced image handling with fallback
    const getProjectImage = () => {
        if (imageError) return null

        const imageOptions = [
            project.featured_image,
            project.images?.[0]?.url || project.images?.[0],
            project.thumbnail
        ]

        return imageOptions.find(img => img && img.trim() !== '')
    }

    const projectImage = getProjectImage()

    // Get category display info
    const getCategoryInfo = (category) => {
        const categoryMap = {
            'web_application': { label: 'Web App', color: 'bg-blue-500', icon: '🌐' },
            'mobile_application': { label: 'Mobile', color: 'bg-purple-500', icon: '📱' },
            'desktop_application': { label: 'Desktop', color: 'bg-gray-600', icon: '💻' },
            'e_commerce': { label: 'E-Commerce', color: 'bg-green-500', icon: '🛒' },
            'cms': { label: 'CMS', color: 'bg-orange-500', icon: '📝' },
            'api': { label: 'API', color: 'bg-indigo-500', icon: '🔗' },
            'ui_ux_design': { label: 'UI/UX', color: 'bg-pink-500', icon: '🎨' }
        }
        return categoryMap[category] || { label: category?.replace('_', ' ') || 'Project', color: 'bg-gray-500', icon: '💼' }
    }

    const categoryInfo = getCategoryInfo(project.category)

    // Status color mapping
    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'text-green-600 bg-green-50'
            case 'draft': return 'text-yellow-600 bg-yellow-50'
            case 'archived': return 'text-red-600 bg-red-50'
            default: return 'text-gray-600 bg-gray-50'
        }
    }

    return (
        <motion.div
            variants={getVariants('fadeInUp')}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group h-full"
        >
            <Card className="relative overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white">
                {/* Project Image Section */}
                <div className="relative overflow-hidden">
                    {projectImage ? (
                        <>
                            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                <img
                                    src={projectImage}
                                    alt={project.title}
                                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                                    onError={() => setImageError(true)}
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Hover Action Buttons */}
                                <motion.div
                                    className="absolute top-3 right-3 flex gap-2"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {project.project_url && (
                                        <motion.a
                                            href={project.project_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200"
                                            title="View Live Demo"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </motion.a>
                                    )}
                                    {project.github_url && (
                                        <motion.a
                                            href={project.github_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200"
                                            title="View Source Code"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                            </svg>
                                        </motion.a>
                                    )}
                                </motion.div>

                                {/* Status & Featured Badges */}
                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                    {project.featured && (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                                            ⭐ Featured
                                        </span>
                                    )}
                                    {project.status && (
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(project.status)}`}>
                                            {project.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        // No Image Fallback
                        <div className="relative h-48 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-4xl mb-2">{categoryInfo.icon}</div>
                                <span className="text-gray-500 text-sm font-medium">{categoryInfo.label}</span>
                            </div>

                            {/* Badges for no-image cards */}
                            <div className="absolute top-3 right-3 flex flex-col gap-2">
                                {project.featured && (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                                        ⭐ Featured
                                    </span>
                                )}
                            </div>

                            {/* Action buttons for no-image cards */}
                            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {project.project_url && (
                                    <a
                                        href={project.project_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200"
                                        title="View Live Demo"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                )}
                                {project.github_url && (
                                    <a
                                        href={project.github_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200"
                                        title="View Source Code"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 flex flex-col">
                    {/* Category & Technologies */}
                    <div className="flex items-center justify-between mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${categoryInfo.color}`}>
                            <span className="mr-1">{categoryInfo.icon}</span>
                            {categoryInfo.label}
                        </span>

                        {project.view_count && (
                            <span className="text-xs text-gray-500 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {project.view_count} views
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[var(--primary)] transition-colors duration-200">
                        {project.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
                        {project.short_description || project.description || 'An innovative digital solution crafted with precision and attention to detail.'}
                    </p>

                    {/* Technologies */}
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-1.5">
                            {project.technologies?.slice(0, 3).map((tech, index) => (
                                <span
                                    key={index}
                                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-md font-medium transition-colors duration-200"
                                >
                                    {tech}
                                </span>
                            ))}
                            {project.technologies?.length > 3 && (
                                <span className="px-2.5 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 text-xs rounded-md font-medium">
                                    +{project.technologies.length - 3} more
                                </span>
                            )}
                            {(!project.technologies || project.technologies.length === 0) && (
                                <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs rounded-md italic">
                                    Technologies not specified
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Client & Date Info */}
                    {(project.client || project.client_name || project.completion_date) && (
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-2 border-t border-gray-100">
                            {(project.client || project.client_name) && (
                                <span className="flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    {project.client || project.client_name}
                                </span>
                            )}
                            {project.completion_date && (
                                <span className="flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {new Date(project.completion_date).getFullYear()}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="mt-auto">
                        <Link
                            to={`/projects/${project.id}`}
                            className="group/btn inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] hover:from-[var(--primary-dark)] hover:to-[var(--primary)] text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <span className="mr-2">View Case Study</span>
                            <motion.svg
                                className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </motion.svg>
                        </Link>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}

export default ProjectCard