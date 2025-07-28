import { motion } from 'framer-motion'
import { useAnimation } from '@/hooks/useAnimation'
import { Link } from 'react-router-dom'
import { useGetTeamQuery } from '@/store/api/apiSlice'
import Card from '@/components/UI/Card'
import Button from '@/components/UI/Button'

const Team = () => {
    const { getVariants } = useAnimation()
    const { data, isLoading } = useGetTeamQuery()

    // Show only first 3 team members on home page
    const featuredTeam = data?.members?.slice(0, 3) || []

    return (
        <section className="section-padding bg-gray-50">
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
                            Meet Our <span className="text-gradient">Team</span>
                        </motion.h2>
                        <motion.p
                            variants={getVariants('fadeInUp')}
                            className="text-xl text-gray-600 max-w-3xl mx-auto"
                        >
                            Our talented team of developers, designers, and strategists are passionate
                            about creating exceptional digital experiences.
                        </motion.p>
                    </div>

                    {/* Team Grid */}
                    {isLoading ? (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--primary)]"></div>
                        </div>
                    ) : (
                        <motion.div
                            variants={getVariants('staggerChildren')}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                        >
                            {featuredTeam.map((member) => (
                                <motion.div key={member.id} variants={getVariants('fadeInUp')}>
                                    <Card className="p-6 text-center group">
                                        <div className="relative mb-6">
                                            <img
                                                src={member.photo || '/placeholder-avatar.jpg'}
                                                alt={member.name}
                                                className="w-24 h-24 rounded-full mx-auto object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-[var(--primary)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </div>

                                        <h3 className="text-xl font-bold text-[var(--dark)] mb-1">
                                            {member.name}
                                        </h3>

                                        <p className="text-[var(--primary)] font-medium mb-3">
                                            {member.position}
                                        </p>

                                        <p className="text-gray-600 text-sm">
                                            {member.bio || 'Passionate about creating amazing digital experiences.'}
                                        </p>

                                        {member.social_links && (
                                            <div className="flex justify-center space-x-3 mt-4">
                                                {Object.entries(member.social_links).map(([platform, url]) => (
                                                    <a
                                                        key={platform}
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-gray-400 hover:text-[var(--primary)] transition-colors"
                                                    >
                                                        {platform}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* View All Team Button */}
                    <motion.div
                        variants={getVariants('fadeInUp')}
                        className="text-center"
                    >
                        <Link to="/team">
                            <Button variant="outline" size="lg">
                                Meet the Full Team
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

export default Team