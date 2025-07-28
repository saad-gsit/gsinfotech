import { motion } from 'framer-motion'
import { useAnimation } from '@/hooks/useAnimation'

const StaggerChildren = ({ children, staggerDelay = 0.1, ...props }) => {
    const { shouldAnimate } = useAnimation()

    const variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
                delayChildren: 0.1
            }
        }
    }

    if (!shouldAnimate) {
        return <div {...props}>{children}</div>
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={variants}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export default StaggerChildren