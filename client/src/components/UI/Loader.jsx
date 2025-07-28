import { motion } from 'framer-motion'

const Loader = ({ size = 'md', color = 'primary', className = '' }) => {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
    }

    const colors = {
        primary: 'border-[var(--primary)]',
        secondary: 'border-[var(--secondary)]',
        white: 'border-white',
        gray: 'border-gray-400',
    }

    return (
        <motion.div
            className={`${sizes[size]} ${className}`}
            animate={{ rotate: 360 }}
            transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
            }}
        >
            <div className={`h-full w-full rounded-full border-2 border-t-transparent ${colors[color]}`} />
        </motion.div>
    )
}

export default Loader