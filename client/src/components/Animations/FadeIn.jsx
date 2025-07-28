import { motion } from 'framer-motion'
import { useAnimation } from '@/hooks/useAnimation'

const FadeIn = ({ children, delay = 0, duration = 0.6, ...props }) => {
    const { shouldAnimate } = useAnimation()

    const variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration, delay }
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

export default FadeIn