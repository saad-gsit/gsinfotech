export const animationVariants = {
    fadeIn: {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.6 } }
    },

    fadeInUp: {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    },

    fadeInDown: {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    },

    fadeInLeft: {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
    },

    fadeInRight: {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
    },

    scaleIn: {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
    },

    slideUp: {
        hidden: { y: 50, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
    },

    staggerChildren: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    },

    bounce: {
        hidden: { y: -10, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 400,
                damping: 10
            }
        }
    }
}

export const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
}

export const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
        transition: { duration: 0.2 }
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.2 }
    }
}

export const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
    })
}

// Performance optimized animation settings
export const getOptimizedAnimation = (shouldAnimate) => {
    if (!shouldAnimate) {
        return {
            initial: false,
            animate: false,
            transition: { duration: 0 }
        }
    }

    return {
        initial: 'hidden',
        animate: 'visible',
        transition: { duration: 0.6 }
    }
}