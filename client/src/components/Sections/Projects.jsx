import { motion } from 'framer-motion'
import { useAnimation } from '@/hooks/useAnimation'
import { Link } from 'react-router-dom'
import { useGetProjectsQuery } from '@/store/api/apiSlice'
import ProjectCard from '@/components/Cards/ProjectCard'
import Button from '@/components/UI/Button'

const Projects = () => {
    const { getVariants } = useAnimation()

    // Get featured projects only
    const { data, isLoading } = useGetProjectsQuery({
        featured: true,
        limit: 3,
        status: 'published'
    })

    return (
        <section className="section-padding">
            <div className="container-custom">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={getVariants('staggerChildren')}
                >
                    {/* Header */}
                    <div className="text-center mb-16">
                        <motion.h2
                            variants={getVariants('fadeInUp')}
                            className="text-4xl lg:text-5xl font-bold text-[var(--dark)] mb-6"
                        >
                            Featured <span className="text-gradient">Projects</span>
                        </motion.h2>
                        <motion.p
                            variants={getVariants('fadeInUp')}
                            className="text-xl text-gray-600 max-w-3xl mx-auto"
                        >
                            Explore some of our recent work and see how we've helped businesses
                            achieve their digital transformation goals.
                        </motion.p>
                    </div>

                    {/* Projects Grid */}
                    {isLoading ? (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--primary)]"></div>
                        </div>
                    ) : (
                        <motion.div
                            variants={getVariants('staggerChildren')}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                        >
                            {data?.projects?.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </motion.div>
                    )}

                    {/* View All Projects Button */}
                    <motion.div
                        variants={getVariants('fadeInUp')}
                        className="text-center"
                    >
                        <Link to="/projects">
                            <Button variant="outline" size="lg">
                                View All Projects
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

export default Projects