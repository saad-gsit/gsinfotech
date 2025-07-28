import { useState, useEffect, useRef } from 'react'

export const useLazyLoad = (options = {}) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isInView, setIsInView] = useState(false)
    const imgRef = useRef()

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true)
                    observer.disconnect()
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px',
                ...options
            }
        )

        if (imgRef.current) {
            observer.observe(imgRef.current)
        }

        return () => observer.disconnect()
    }, [options])

    const handleLoad = () => {
        setIsLoaded(true)
    }

    return { imgRef, isLoaded, isInView, handleLoad }
}