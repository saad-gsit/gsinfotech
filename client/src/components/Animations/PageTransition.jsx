import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

const PageTransition = ({ children }) => {
    const location = useLocation()

    const pageVariants = {
        initial: {
            opacity: 0,
            y: 20
        },
        in: {
            opacity: 1,
            y: 0
        },
        out: {
            opacity: 0,
            y: -20
        }
    }

    const pageTransition = {
        type: 'tween',
        ease: 'anticipate',
        duration: 0.4
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}

export default PageTransition