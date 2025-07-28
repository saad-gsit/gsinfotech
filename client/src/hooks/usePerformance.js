import { useState, useEffect } from 'react'

export const usePerformance = () => {
    const [metrics, setMetrics] = useState({
        loading: true,
        navigation: null,
        paint: null,
        resources: []
    })

    useEffect(() => {
        const getPerformanceMetrics = () => {
            if ('performance' in window) {
                const navigation = performance.getEntriesByType('navigation')[0]
                const paint = performance.getEntriesByType('paint')
                const resources = performance.getEntriesByType('resource')

                setMetrics({
                    loading: false,
                    navigation: {
                        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
                        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
                        firstByte: navigation?.responseStart - navigation?.requestStart,
                        domInteractive: navigation?.domInteractive - navigation?.navigationStart
                    },
                    paint: {
                        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
                        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
                    },
                    resources: resources.map(resource => ({
                        name: resource.name,
                        type: resource.initiatorType,
                        size: resource.transferSize,
                        duration: resource.duration
                    }))
                })
            }
        }

        // Wait for page load
        if (document.readyState === 'complete') {
            getPerformanceMetrics()
        } else {
            window.addEventListener('load', getPerformanceMetrics)
            return () => window.removeEventListener('load', getPerformanceMetrics)
        }
    }, [])

    return metrics
}