// server/utils/seoGenerator.js
const slugify = require('slugify');
const { logger } = require('./logger');

class SEOGenerator {
    constructor() {
        this.siteUrl = process.env.SITE_URL || 'http://localhost:3000';
        this.siteName = process.env.SITE_NAME || 'GS Infotech';
        this.companyEmail = process.env.COMPANY_EMAIL || 'info@gsinfotech.com';
    }

    /**
     * Generate slug from title
     */
    generateSlug(title) {
        return slugify(title, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g
        });
    }

    /**
     * Generate meta description from content
     */
    generateMetaDescription(content, maxLength = 155) {
        if (!content) return '';

        // Remove HTML tags and clean text
        const cleanText = content
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        if (cleanText.length <= maxLength) {
            return cleanText;
        }

        // Find the last complete sentence within the limit
        const truncated = cleanText.substring(0, maxLength);
        const lastSentence = truncated.lastIndexOf('.');

        if (lastSentence > maxLength * 0.7) {
            return truncated.substring(0, lastSentence + 1);
        }

        // If no good sentence break, find last space
        const lastSpace = truncated.lastIndexOf(' ');
        return truncated.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...';
    }

    /**
     * Extract keywords from content
     */
    extractKeywords(content, maxKeywords = 10) {
        if (!content) return [];

        // Remove HTML and get clean text
        const cleanText = content
            .replace(/<[^>]*>/g, ' ')
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // Common stop words to filter out
        const stopWords = new Set([
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
            'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
            'to', 'was', 'were', 'will', 'with', 'we', 'you', 'your', 'this',
            'that', 'they', 'them', 'their', 'have', 'had', 'but', 'not',
            'or', 'can', 'could', 'should', 'would', 'our', 'us', 'all',
            'any', 'been', 'being', 'do', 'does', 'did', 'doing', 'get',
            'got', 'how', 'what', 'when', 'where', 'who', 'why', 'which'
        ]);

        // Extract words and count frequency
        const words = cleanText.split(' ').filter(word =>
            word.length >= 3 &&
            !stopWords.has(word) &&
            isNaN(word)
        );

        const wordCount = {};
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });

        // Sort by frequency and return top keywords
        return Object.entries(wordCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, maxKeywords)
            .map(([word]) => word);
    }

    /**
     * Calculate reading time
     */
    calculateReadingTime(content, wordsPerMinute = 200) {
        if (!content) return 0;

        const cleanText = content.replace(/<[^>]*>/g, ' ');
        const wordCount = cleanText.split(/\s+/).filter(word => word.length > 0).length;

        return Math.ceil(wordCount / wordsPerMinute);
    }

    /**
     * Generate Open Graph metadata
     */
    generateOpenGraph(data = {}) {
        const {
            title,
            description,
            image,
            url,
            type = 'website',
            siteName = this.siteName
        } = data;

        return {
            'og:title': title,
            'og:description': description,
            'og:image': image ? `${this.siteUrl}${image}` : null,
            'og:url': url ? `${this.siteUrl}${url}` : this.siteUrl,
            'og:type': type,
            'og:site_name': siteName,
            'og:locale': 'en_US'
        };
    }

    /**
     * Generate Twitter Card metadata
     */
    generateTwitterCard(data = {}) {
        const {
            title,
            description,
            image,
            cardType = 'summary_large_image'
        } = data;

        return {
            'twitter:card': cardType,
            'twitter:title': title,
            'twitter:description': description,
            'twitter:image': image ? `${this.siteUrl}${image}` : null
        };
    }

    /**
     * Generate structured data (JSON-LD)
     */
    generateStructuredData(type, data = {}) {
        const baseStructure = {
            '@context': 'https://schema.org'
        };

        switch (type) {
            case 'Organization':
                return {
                    ...baseStructure,
                    '@type': 'Organization',
                    name: this.siteName,
                    url: this.siteUrl,
                    email: this.companyEmail,
                    logo: `${this.siteUrl}/logo.png`,
                    ...data
                };

            case 'Article':
                return {
                    ...baseStructure,
                    '@type': 'Article',
                    headline: data.title,
                    description: data.description,
                    author: {
                        '@type': 'Organization',
                        name: this.siteName
                    },
                    publisher: {
                        '@type': 'Organization',
                        name: this.siteName,
                        logo: {
                            '@type': 'ImageObject',
                            url: `${this.siteUrl}/logo.png`
                        }
                    },
                    datePublished: data.publishedAt,
                    dateModified: data.updatedAt,
                    image: data.image ? `${this.siteUrl}${data.image}` : null,
                    url: `${this.siteUrl}${data.url}`,
                    ...data.additionalData
                };

            case 'Service':
                return {
                    ...baseStructure,
                    '@type': 'Service',
                    name: data.title,
                    description: data.description,
                    provider: {
                        '@type': 'Organization',
                        name: this.siteName
                    },
                    ...data.additionalData
                };

            case 'WebSite':
                return {
                    ...baseStructure,
                    '@type': 'WebSite',
                    name: this.siteName,
                    url: this.siteUrl,
                    potentialAction: {
                        '@type': 'SearchAction',
                        target: `${this.siteUrl}/search?q={search_term_string}`,
                        'query-input': 'required name=search_term_string'
                    },
                    ...data
                };

            case 'BreadcrumbList':
                return {
                    ...baseStructure,
                    '@type': 'BreadcrumbList',
                    itemListElement: data.breadcrumbs?.map((crumb, index) => ({
                        '@type': 'ListItem',
                        position: index + 1,
                        name: crumb.name,
                        item: `${this.siteUrl}${crumb.url}`
                    })) || []
                };

            default:
                logger.warn(`Unknown structured data type: ${type}`);
                return baseStructure;
        }
    }

    /**
     * Generate complete SEO package for a page
     */
    generateCompleteSEO(pageData = {}) {
        const {
            title,
            description,
            content,
            image,
            url,
            type = 'website',
            keywords = [],
            publishedAt,
            updatedAt,
            breadcrumbs = []
        } = pageData;

        // Generate meta description if not provided
        const metaDescription = description || this.generateMetaDescription(content);

        // Extract keywords if not provided
        const metaKeywords = keywords.length > 0 ? keywords : this.extractKeywords(content);

        // Generate canonical URL
        const canonicalUrl = url ? `${this.siteUrl}${url}` : this.siteUrl;

        return {
            // Basic meta tags
            title: title ? `${title} | ${this.siteName}` : this.siteName,
            description: metaDescription,
            keywords: metaKeywords.join(', '),
            canonical: canonicalUrl,
            robots: 'index, follow',

            // Open Graph
            openGraph: this.generateOpenGraph({
                title,
                description: metaDescription,
                image,
                url,
                type
            }),

            // Twitter Card
            twitterCard: this.generateTwitterCard({
                title,
                description: metaDescription,
                image
            }),

            // Structured Data
            structuredData: {
                website: this.generateStructuredData('WebSite'),
                organization: this.generateStructuredData('Organization'),
                ...(type === 'article' && {
                    article: this.generateStructuredData('Article', {
                        title,
                        description: metaDescription,
                        image,
                        url,
                        publishedAt,
                        updatedAt
                    })
                }),
                ...(breadcrumbs.length > 0 && {
                    breadcrumbs: this.generateStructuredData('BreadcrumbList', { breadcrumbs })
                })
            },

            // Additional meta
            readingTime: content ? this.calculateReadingTime(content) : null,
            wordCount: content ? content.replace(/<[^>]*>/g, ' ').split(/\s+/).length : null
        };
    }

    /**
     * Validate SEO data
     */
    validateSEO(seoData) {
        const issues = [];
        const recommendations = [];

        // Title validation
        if (!seoData.title) {
            issues.push('Title is missing');
        } else if (seoData.title.length < 30) {
            recommendations.push('Title is too short (aim for 30-60 characters)');
        } else if (seoData.title.length > 60) {
            recommendations.push('Title is too long (aim for 30-60 characters)');
        }

        // Description validation
        if (!seoData.description) {
            issues.push('Meta description is missing');
        } else if (seoData.description.length < 120) {
            recommendations.push('Meta description is too short (aim for 120-160 characters)');
        } else if (seoData.description.length > 160) {
            recommendations.push('Meta description is too long (aim for 120-160 characters)');
        }

        // Keywords validation
        if (!seoData.keywords || seoData.keywords.length === 0) {
            recommendations.push('Consider adding relevant keywords');
        }

        // Image validation
        if (!seoData.openGraph?.['og:image']) {
            recommendations.push('Consider adding an Open Graph image');
        }

        return {
            isValid: issues.length === 0,
            issues,
            recommendations,
            score: this.calculateSEOScore(seoData)
        };
    }

    /**
     * Calculate SEO score (0-100)
     */
    calculateSEOScore(seoData) {
        let score = 0;

        // Title (25 points)
        if (seoData.title) {
            if (seoData.title.length >= 30 && seoData.title.length <= 60) {
                score += 25;
            } else if (seoData.title.length > 0) {
                score += 15;
            }
        }

        // Description (25 points)
        if (seoData.description) {
            if (seoData.description.length >= 120 && seoData.description.length <= 160) {
                score += 25;
            } else if (seoData.description.length > 0) {
                score += 15;
            }
        }

        // Keywords (15 points)
        if (seoData.keywords && seoData.keywords.length > 0) {
            score += 15;
        }

        // Open Graph (15 points)
        if (seoData.openGraph?.['og:title'] && seoData.openGraph?.['og:description']) {
            score += 15;
        }

        // Structured Data (10 points)
        if (seoData.structuredData && Object.keys(seoData.structuredData).length > 0) {
            score += 10;
        }

        // Canonical URL (5 points)
        if (seoData.canonical) {
            score += 5;
        }

        // Image (5 points)
        if (seoData.openGraph?.['og:image']) {
            score += 5;
        }

        return Math.min(score, 100);
    }
}

// Export singleton instance
module.exports = new SEOGenerator();