import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'

export const useSEO = ({
    title,
    description,
    keywords = [],
    image,
    url,
    type = 'website',
    twitterCard = 'summary_large_image'
}) => {
    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://gsinfotech.com'
    const siteName = import.meta.env.VITE_SITE_NAME || 'GS Infotech'

    const fullTitle = title ? `${title} - ${siteName}` : siteName
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl
    const fullImage = image ? `${siteUrl}${image}` : `${siteUrl}/og-image.jpg`

    return {
        title: fullTitle,
        description,
        keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords,
        url: fullUrl,
        image: fullImage,
        type,
        twitterCard
    }
}