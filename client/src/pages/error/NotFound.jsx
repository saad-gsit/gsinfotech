import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAnimation } from '@/hooks/useAnimation'

const NotFound = () => {
    const { getVariants } = useAnimation()

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={getVariants('fadeIn')}
            className="section-padding min-h-screen flex items-center"
        >
            <div className="container-custom text-center">
                <motion.div variants={getVariants('fadeInUp')}>
                    <h1 className="text-9xl font-bold text-gradient mb-4">404</h1>
                    <h2 className="text-4xl font-bold text-[var(--dark)] mb-6">
                        Page Not Found
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Sorry, we couldn't find the page you're looking for.
                        Perhaps you've mistyped the URL? Be sure to check your spelling.
                    </p>
                    <div className="space-x-4">
                        <Link to="/" className="btn-primary">
                            Go Home
                        </Link>
                        <Link to="/contact" className="btn-secondary">
                            Contact Support
                        </Link>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}

export default NotFound