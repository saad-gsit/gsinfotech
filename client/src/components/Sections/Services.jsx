import { motion } from 'framer-motion'
import { useAnimation } from '@/hooks/useAnimation'
import { Link } from 'react-router-dom'
import Card from '@/components/UI/Card'

const Services = () => {
    const { getVariants } = useAnimation()

    const services = [
        {
            icon: '💻',
            title: 'Custom Software Development',
            description: 'Tailored software solutions designed specifically for your business needs and requirements.',
            features: ['Enterprise Applications', 'API Development', 'Database Design', 'Cloud Integration'],
            href: '/services/custom-software-development'
        },
        {
            icon: '📱',
            title: 'Mobile App Development',
            description: 'Native and cross-platform mobile applications for iOS and Android devices.',
            features: ['iOS Development', 'Android Development', 'React Native', 'Flutter'],
            href: '/services/mobile-app-development'
        },
        {
            icon: '🌐',
            title: 'Web Development',
            description: 'Modern, responsive websites and web applications built with latest technologies.',
            features: ['React/Next.js', 'Node.js', 'E-commerce', 'CMS Development'],
            href: '/services/web-development'
        },
        {
            icon: '🎨',
            title: 'UI/UX Design',
            description: 'User-centered design that creates engaging and intuitive digital experiences.',
            features: ['User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
            href: '/services/ui-ux-design'
        }
    ]

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
                            <motion.div key={index} variants={getVariants('fadeInUp')}>
                                <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 group">
                                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                        {service.icon}
                                    </div>

                                    <h3 className="text-xl font-bold text-[var(--dark)] mb-3">
                                        {service.title}
                                    </h3>

                                    <p className="text-gray-600 mb-4">
                                        {service.description}
                                    </p>

                                    <ul className="space-y-2 mb-6">
                                        {service.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center text-sm text-gray-600">
                                                <span className="text-[var(--primary)] mr-2">✓</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        to={service.href}
                                        className="text-[var(--primary)] hover:text-[var(--primary-dark)] font-medium transition-colors group-hover:underline"
                                    >
                                        Learn More →
                                    </Link>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default Services