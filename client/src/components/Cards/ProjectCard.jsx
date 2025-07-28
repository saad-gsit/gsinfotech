import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAnimation } from '@/hooks/useAnimation'
import Card from '@/components/UI/Card'

const ProjectCard = ({ project }) => {
    const { getVariants } = useAnimation()

    return (
        <motion.div variants={getVariants('fadeInUp')}>
            <Card className="p-6 h-full flex flex-col">
                {/* Project Image */}
                {project.featured_image && (
                    <div className="relative mb-4 rounded-lg overflow-hidden">
                        <img
                            src={project.featured_image}
                            alt={project.title}
                            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                        />
                        {project.featured && (
                            <div className="absolute top-2 right-2 bg-[var(--primary)] text-white px-2 py-1 rounded-full text-xs font-medium">
                                Featured
                            </div>
                        )}
                    </div>
                )}

                {/* Project Content */}
                <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                        {project.technologies?.slice(0, 3).map((tech, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                                {tech}
                            </span>
                        ))}
                        {project.technologies?.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                +{project.technologies.length - 3} more
                            </span>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-[var(--dark)] mb-2">
                        {project.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                        {project.description}
                    </p>

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                        <span className="capitalize">{project.category?.replace('_', ' ')}</span>
                        {project.view_count && (
                            <>
                                <span className="mx-2">•</span>
                                <span>{project.view_count} views</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Project Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Link
                        to={`/projects/${project.id}`}
                        className="text-[var(--primary)] hover:text-[var(--primary-dark)] font-medium transition-colors"
                    >
                        View Details →
                    </Link>

                    <div className="flex space-x-3">
                        {project.project_url && (
                            <a
                                href={project.project_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-[var(--primary)] transition-colors"
                                title="Live Demo"
                            >
                                🔗
                            </a>
                        )}
                        {project.github_url && (
                            <a
                                href={project.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-[var(--primary)] transition-colors"
                                title="Source Code"
                            >
                                📁
                            </a>
                        )}
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}

export default ProjectCard