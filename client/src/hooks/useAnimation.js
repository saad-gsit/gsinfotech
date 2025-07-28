import { useMemo } from 'react'

export const useAnimation = () => {
    const getVariants = (type) => {
        const variants = {
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
            slideInLeft: {
                hidden: { opacity: 0, x: -50 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
            },
            slideInRight: {
                hidden: { opacity: 0, x: 50 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
            },
            scaleIn: {
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
            },
            stagger: {
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.2
                    }
                }
            }
        }
        return variants[type] || variants.fadeIn
    }

    return { getVariants }
}