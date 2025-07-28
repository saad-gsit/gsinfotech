export const formatters = {
    // Format phone numbers
    phone: (value) => {
        const phoneNumber = value.replace(/[^\d]/g, '')
        const phoneNumberLength = phoneNumber.length

        if (phoneNumberLength < 4) return phoneNumber
        if (phoneNumberLength < 7) {
            return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`
        }
        return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
    },

    // Format numbers with commas
    number: (value) => {
        return new Intl.NumberFormat().format(value)
    },

    // Format file sizes
    fileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    // Format reading time
    readingTime: (text) => {
        const wordsPerMinute = 200
        const words = text.trim().split(/\s+/).length
        const time = Math.ceil(words / wordsPerMinute)
        return time
    },

    // Format URLs
    url: (url) => {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return `https://${url}`
        }
        return url
    },

    // Format percentage
    percentage: (value, decimals = 1) => {
        return `${(value * 100).toFixed(decimals)}%`
    },

    // Format relative time
    timeAgo: (date) => {
        const now = new Date()
        const diffInSeconds = Math.floor((now - new Date(date)) / 1000)

        const intervals = {
            year: 31536000,
            month: 2592000,
            day: 86400,
            hour: 3600,
            minute: 60
        }

        for (const [unit, seconds] of Object.entries(intervals)) {
            const interval = Math.floor(diffInSeconds / seconds)
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`
            }
        }

        return 'Just now'
    }
}