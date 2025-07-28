import { motion } from 'framer-motion'
import { useAnimation } from '@/hooks/useAnimation'

const Card = ({
    children,
    className = '',
    hover = true,
    animate = true,
    ...props
}) => {
    const { shouldAnimate } = useAnimation()

    const baseClasses = 'bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300'
    const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1' : ''

    const cardClasses = `${baseClasses} ${hoverClasses} ${className}`

    const CardComponent = (
        <div className={cardClasses} {...props}>
            {children}
        </div>
    )

    if (animate && shouldAnimate) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                whileHover={hover ? { y: -4 } : {}}
            >
                {CardComponent}
            </motion.div>
        )
    }

    return CardComponent
}

export default Card
