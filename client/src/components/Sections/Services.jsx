import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAnimation } from '@/hooks/useAnimation'
import { Link } from 'react-router-dom'
import Card from '@/components/UI/Card'
import ServiceCard from '@/components/Cards/ServiceCard'
import { servicesAPI } from '@/services/servicesAPI'

const Services = () => {
    const { getVariants } = useAnimation()
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadFeaturedServices()
    }, [])

    const loadFeaturedServices = async () => {
        try {
            setLoading(true)
            const response = await servicesAPI.getFeaturedServices(4)

            let servicesData = []
            if (Array.isArray(response)) {
                servicesData = response
            } else if (response.data && Array.isArray(response.data)) {
                servicesData = response.data
            } else if (response.services && Array.isArray(response.services)) {
                servicesData = response.services
            }

            setServices(servicesData)
            setError(null)
        } catch (error) {
            console.error('Error loading featured services:', error)
            setError('Failed to load services')
            // Fallback to static data if API fails
            setServices(getFallbackServices())
        } finally {
            setLoading(false)
        }
    }

    // Fallback services data in case API is not available
    const getFallbackServices = () => [
        {
            id: 1,
            slug: 'custom-software-development',
            name: 'Custom Software Development',
            short_description: 'Tailored software solutions designed specifically for your business needs and requirements.',
            category: 'custom_software',
            features: ['Enterprise Applications', 'API Development', 'Database Design', 'Cloud Integration'],
            technologies: ['Node.js', 'React', 'Python', 'AWS'],
            is_featured: true,
            is_active: true
        },
        {
            id: 2,
            slug: 'mobile-app-development',
            name: 'Mobile App Development',
            short_description: 'Native and cross-platform mobile applications for iOS and Android devices.',
            category: 'mobile_development',
            features: ['iOS Development', 'Android Development', 'React Native', 'Flutter'],
            technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
            is_featured: true,
            is_active: true
        },
        {
            id: 3,
            slug: 'web-development',
            name: 'Web Development',
            short_description: 'Modern, responsive websites and web applications built with latest technologies.',
            category: 'web_development',
            features: ['React/Next.js', 'Node.js', 'E-commerce', 'CMS Development'],
            technologies: ['React', 'Next.js', 'Node.js', 'TypeScript'],
            is_featured: true,
            is_active: true
        },
        {
            id: 4,
            slug: 'ui-ux-design',
            name: 'UI/UX Design',
            short_description: 'User-centered design that creates engaging and intuitive digital experiences.',
            category: 'ui_ux_design',
            features: ['User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
            technologies: ['Figma', 'Adobe XD', 'Sketch', 'Principle'],
            is_featured: true,
            is_active: true
        }
    ]

    // Loading skeleton
    if (loading) {
        return (
            <section className="section-padding bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <div className="animate-pulse">
                            <div className="h-12 bg-gray-200 rounded w-96 mx-auto mb-6"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((index) => (
                            <div key={index} className="animate-pulse">
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                                    <div className="space-y-2 mb-6">
                                        <div className="h-3 bg-gray-200 rounded"></div>
                                        <div className="h-3 bg-gray-200 rounded"></div>
                                        <div className="h-3 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="h-10 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    // Error state
    if (error && services.length === 0) {
        return (
            <section className="section-padding bg-gray-50">
                <div className="container-custom">
                    <div className="text-center">
                        <div className="text-red-500 mb-4">{error}</div>
                        <button
                            onClick={loadFeaturedServices}
                            className="bg-[var(--primary)] text-white px-6 py-2 rounded hover:bg-[var(--primary-dark)] transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </section>
        )
    }

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
                            Our <span className="text-gradient">Services</span>
                        </motion.h2>
                        <motion.p
                            variants={getVariants('fadeInUp')}
                            className="text-xl text-gray-600 max-w-3xl mx-auto"
                        >
                            We offer comprehensive software development services to help your business
                            thrive in the digital landscape.
                        </motion.p>
                    </div>

                    {/* Services Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((service, index) => (
                            <motion.div key={service.id || index} variants={getVariants('fadeInUp')}>
                                {/* Use ServiceCard component if available, otherwise fallback to basic card */}
                                {typeof ServiceCard !== 'undefined' ? (
                                    <ServiceCard
                                        service={service}
                                        index={index}
                                        compact={true}
                                        showPricing={false}
                                    />
                                ) : (
                                    <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 group">
                                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                            {service.icon || getCategoryIcon(service.category)}
                                        </div>

                                        <h3 className="text-xl font-bold text-[var(--dark)] mb-3">
                                            {service.name}
                                        </h3>

                                        <p className="text-gray-600 mb-4">
                                            {service.short_description}
                                        </p>

                                        <ul className="space-y-2 mb-6">
                                            {service.features && service.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center text-sm text-gray-600">
                                                    <span className="text-[var(--primary)] mr-2">✓</span>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <Link
                                            to={`/services/${service.slug}`}
                                            className="text-[var(--primary)] hover:text-[var(--primary-dark)] font-medium transition-colors group-hover:underline"
                                        >
                                            Learn More →
                                        </Link>
                                    </Card>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* View All Services Button */}
                    <motion.div
                        variants={getVariants('fadeInUp')}
                        className="text-center mt-12"
                    >
                        <Link
                            to="/services"
                            className="inline-flex items-center bg-[var(--primary)] text-white px-8 py-4 rounded-lg hover:bg-[var(--primary-dark)] transition-all duration-300 font-medium"
                        >
                            View All Services
                            <svg
                                className="ml-2 w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                />
                            </svg>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

// Helper function to get category icons (fallback)
const getCategoryIcon = (category) => {
    const icons = {
        'web_development': '🌐',
        'mobile_development': '📱',
        'custom_software': '💻',
        'ui_ux_design': '🎨',
        'enterprise_solutions': '🏢'
    }
    return icons[category] || '💻'
}

export default Services