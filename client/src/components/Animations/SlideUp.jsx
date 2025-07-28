import { motion } from 'framer-motion'
import { useAnimation } from '@/hooks/useAnimation'

const SlideUp = ({ children, delay = 0, duration = 0.6, distance = 30, ...props }) => {
    const { shouldAnimate } = useAnimation()

    const variants = {
        hidden: { opacity: 0, y: distance },
        visible: {
            opacity: 1,
            y: 0,
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

export default SlideUp