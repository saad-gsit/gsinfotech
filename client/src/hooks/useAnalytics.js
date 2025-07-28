import { useState, useEffect } from 'react'
import { analyticsAPI } from '@/services/analyticsAPI'

export const useAnalytics = (timeRange = '7d') => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true)
                const analytics = await analyticsAPI.getDashboard(timeRange)
                setData(analytics)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchAnalytics()
    }, [timeRange])

    const trackEvent = async (eventName, properties = {}) => {
        try {
            await analyticsAPI.trackEvent(eventName, properties)
        } catch (err) {
            console.error('Analytics tracking error:', err)
        }
    }

    return { data, loading, error, trackEvent }
}