// server/controllers/analyticsController.js - COMPLETE VERSION
const { Analytics, Project, BlogPost, ContactSubmission } = require('../models');
const { logger } = require('../utils/logger');
const { performanceMonitor } = require('../middleware/performanceMonitor');
const { Op } = require('sequelize');

class AnalyticsController {
    // Get dashboard overview analytics
    static async getDashboardOverview(req, res) {
        try {
            const { period = '30d' } = req.query;

            // Calculate date range
            const dateRange = AnalyticsController.getDateRange(period);

            // Get basic counts
            const [
                totalProjects,
                publishedProjects,
                totalBlogPosts,
                publishedBlogPosts,
                totalContacts,
                recentContacts
            ] = await Promise.all([
                Project.count(),
                Project.count({ where: { status: 'published' } }),
                BlogPost.count(),
                BlogPost.count({ where: { status: 'published' } }),
                ContactSubmission.count(),
                ContactSubmission.count({
                    where: {
                        createdAt: { [Op.gte]: dateRange.startDate }
                    }
                })
            ]);

            // Get content performance
            const [popularProjects, popularBlogPosts] = await Promise.all([
                Project.findAll({
                    where: { status: 'published' },
                    order: [['views', 'DESC']],
                    limit: 5,
                    attributes: ['id', 'title', 'slug', 'views', 'createdAt']
                }),
                BlogPost.findAll({
                    where: { status: 'published' },
                    order: [['views', 'DESC']],
                    limit: 5,
                    attributes: ['id', 'title', 'slug', 'views', 'publishedAt']
                })
            ]);

            // Get recent activity
            const recentActivity = await AnalyticsController.getRecentActivity(dateRange);

            // Get performance metrics from performance monitor
            const performanceMetrics = performanceMonitor.getMetrics();

            // Calculate growth metrics
            const growthMetrics = await AnalyticsController.calculateGrowthMetrics(period);

            const overview = {
                period,
                dateRange: {
                    start: dateRange.startDate.toISOString(),
                    end: dateRange.endDate.toISOString()
                },
                content: {
                    projects: {
                        total: totalProjects,
                        published: publishedProjects,
                        draft: totalProjects - publishedProjects
                    },
                    blogPosts: {
                        total: totalBlogPosts,
                        published: publishedBlogPosts,
                        draft: totalBlogPosts - publishedBlogPosts
                    }
                },
                engagement: {
                    totalContacts,
                    recentContacts,
                    contactGrowth: recentContacts > 0 ? '+' + recentContacts : '0'
                },
                performance: {
                    averageResponseTime: performanceMetrics.requests.averageResponseTime,
                    totalRequests: performanceMetrics.requests.total,
                    errorRate: ((performanceMetrics.requests.errors / performanceMetrics.requests.total) * 100).toFixed(2),
                    uptime: performanceMetrics.uptime
                },
                popular: {
                    projects: popularProjects,
                    blogPosts: popularBlogPosts
                },
                recentActivity,
                growth: growthMetrics
            };

            logger.api('Dashboard overview retrieved', {
                period,
                totalProjects,
                totalBlogPosts,
                recentContacts
            });

            res.json(overview);

        } catch (error) {
            logger.error('Error fetching dashboard overview:', error);
            res.status(500).json({
                error: 'Failed to fetch dashboard overview',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get detailed content analytics
    static async getContentAnalytics(req, res) {
        try {
            const { type = 'all', period = '30d' } = req.query;

            const dateRange = AnalyticsController.getDateRange(period);

            let analytics = {};

            if (type === 'all' || type === 'projects') {
                // Project analytics
                const projectStats = await Project.findAll({
                    attributes: [
                        'status',
                        [Project.sequelize.fn('COUNT', '*'), 'count'],
                        [Project.sequelize.fn('SUM', Project.sequelize.col('views')), 'totalViews']
                    ],
                    group: ['status']
                });

                const projectsByCategory = await Project.findAll({
                    attributes: [
                        'category',
                        [Project.sequelize.fn('COUNT', '*'), 'count']
                    ],
                    where: { status: 'published' },
                    group: ['category']
                });

                analytics.projects = {
                    statusBreakdown: projectStats.reduce((acc, stat) => {
                        acc[stat.status] = {
                            count: parseInt(stat.get('count')),
                            views: parseInt(stat.get('totalViews')) || 0
                        };
                        return acc;
                    }, {}),
                    categoryBreakdown: projectsByCategory.map(cat => ({
                        category: cat.category || 'Uncategorized',
                        count: parseInt(cat.get('count'))
                    }))
                };
            }

            if (type === 'all' || type === 'blog') {
                // Blog analytics
                const blogStats = await BlogPost.findAll({
                    attributes: [
                        'status',
                        [BlogPost.sequelize.fn('COUNT', '*'), 'count'],
                        [BlogPost.sequelize.fn('SUM', BlogPost.sequelize.col('views')), 'totalViews']
                    ],
                    group: ['status']
                });

                const blogByCategory = await BlogPost.findAll({
                    attributes: [
                        'category',
                        [BlogPost.sequelize.fn('COUNT', '*'), 'count']
                    ],
                    where: { status: 'published' },
                    group: ['category']
                });

                // Get monthly blog post creation
                const monthlyPosts = await BlogPost.findAll({
                    attributes: [
                        [BlogPost.sequelize.fn('DATE_FORMAT', BlogPost.sequelize.col('createdAt'), '%Y-%m'), 'month'],
                        [BlogPost.sequelize.fn('COUNT', '*'), 'count']
                    ],
                    where: {
                        createdAt: { [Op.gte]: dateRange.startDate }
                    },
                    group: [BlogPost.sequelize.fn('DATE_FORMAT', BlogPost.sequelize.col('createdAt'), '%Y-%m')],
                    order: [[BlogPost.sequelize.fn('DATE_FORMAT', BlogPost.sequelize.col('createdAt'), '%Y-%m'), 'ASC']]
                });

                analytics.blog = {
                    statusBreakdown: blogStats.reduce((acc, stat) => {
                        acc[stat.status] = {
                            count: parseInt(stat.get('count')),
                            views: parseInt(stat.get('totalViews')) || 0
                        };
                        return acc;
                    }, {}),
                    categoryBreakdown: blogByCategory.map(cat => ({
                        category: cat.category || 'Uncategorized',
                        count: parseInt(cat.get('count'))
                    })),
                    monthlyCreation: monthlyPosts.map(month => ({
                        month: month.get('month'),
                        posts: parseInt(month.get('count'))
                    }))
                };
            }

            logger.api('Content analytics retrieved', { type, period });

            res.json({
                type,
                period,
                dateRange: {
                    start: dateRange.startDate.toISOString(),
                    end: dateRange.endDate.toISOString()
                },
                ...analytics
            });

        } catch (error) {
            logger.error('Error fetching content analytics:', error);
            res.status(500).json({
                error: 'Failed to fetch content analytics',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get performance analytics
    static async getPerformanceAnalytics(req, res) {
        try {
            const { period = '24h' } = req.query;

            // Get current performance metrics
            const currentMetrics = performanceMonitor.getMetrics();

            // Get historical data if analytics table has performance logs
            const dateRange = AnalyticsController.getDateRange(period);

            const performanceData = {
                current: {
                    uptime: currentMetrics.uptime,
                    totalRequests: currentMetrics.requests.total,
                    averageResponseTime: currentMetrics.requests.averageResponseTime,
                    successRate: ((currentMetrics.requests.success / currentMetrics.requests.total) * 100).toFixed(2),
                    errorRate: ((currentMetrics.requests.errors / currentMetrics.requests.total) * 100).toFixed(2),
                    memoryUsage: currentMetrics.memory.current,
                    peakMemory: currentMetrics.memory.peak
                },
                routes: Object.fromEntries(
                    Object.entries(currentMetrics.routes).map(([route, metrics]) => [
                        route,
                        {
                            requests: metrics.count,
                            averageTime: metrics.averageTime,
                            maxTime: metrics.maxTime,
                            errorRate: ((metrics.errors / metrics.count) * 100).toFixed(2)
                        }
                    ])
                ),
                recommendations: []
            };

            // Generate performance recommendations
            if (currentMetrics.requests.averageResponseTime > 1000) {
                performanceData.recommendations.push('Average response time is high (>1s). Consider optimization.');
            }

            if (currentMetrics.memory.current > 100) {
                performanceData.recommendations.push('High memory usage detected. Monitor for memory leaks.');
            }

            const errorRate = (currentMetrics.requests.errors / currentMetrics.requests.total) * 100;
            if (errorRate > 5) {
                performanceData.recommendations.push(`Error rate is ${errorRate.toFixed(1)}%. Investigate error causes.`);
            }

            logger.api('Performance analytics retrieved', {
                period,
                totalRequests: currentMetrics.requests.total,
                averageResponseTime: currentMetrics.requests.averageResponseTime
            });

            res.json({
                period,
                dateRange: {
                    start: dateRange.startDate.toISOString(),
                    end: dateRange.endDate.toISOString()
                },
                performance: performanceData
            });

        } catch (error) {
            logger.error('Error fetching performance analytics:', error);
            res.status(500).json({
                error: 'Failed to fetch performance analytics',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get contact and lead analytics
    static async getContactAnalytics(req, res) {
        try {
            const { period = '30d' } = req.query;

            const dateRange = AnalyticsController.getDateRange(period);

            // Get contact submissions data
            const [
                totalContacts,
                recentContacts,
                contactsByService,
                contactsByMonth
            ] = await Promise.all([
                ContactSubmission.count(),
                ContactSubmission.count({
                    where: {
                        createdAt: { [Op.gte]: dateRange.startDate }
                    }
                }),
                ContactSubmission.findAll({
                    attributes: [
                        'serviceType',
                        [ContactSubmission.sequelize.fn('COUNT', '*'), 'count']
                    ],
                    where: {
                        createdAt: { [Op.gte]: dateRange.startDate }
                    },
                    group: ['serviceType']
                }),
                ContactSubmission.findAll({
                    attributes: [
                        [ContactSubmission.sequelize.fn('DATE_FORMAT', ContactSubmission.sequelize.col('createdAt'), '%Y-%m'), 'month'],
                        [ContactSubmission.sequelize.fn('COUNT', '*'), 'count']
                    ],
                    where: {
                        createdAt: { [Op.gte]: dateRange.startDate }
                    },
                    group: [ContactSubmission.sequelize.fn('DATE_FORMAT', ContactSubmission.sequelize.col('createdAt'), '%Y-%m')],
                    order: [[ContactSubmission.sequelize.fn('DATE_FORMAT', ContactSubmission.sequelize.col('createdAt'), '%Y-%m'), 'ASC']]
                })
            ]);

            // Get recent contact submissions for detailed view
            const recentContactDetails = await ContactSubmission.findAll({
                where: {
                    createdAt: { [Op.gte]: dateRange.startDate }
                },
                order: [['createdAt', 'DESC']],
                limit: 10,
                attributes: ['id', 'name', 'email', 'serviceType', 'subject', 'createdAt']
            });

            const analytics = {
                overview: {
                    totalContacts,
                    recentContacts,
                    conversionRate: '0%', // Would need website visitor data to calculate
                    averageResponseTime: 'N/A' // Would need response tracking
                },
                breakdown: {
                    byService: contactsByService.map(service => ({
                        service: service.serviceType || 'General',
                        count: parseInt(service.get('count'))
                    })),
                    byMonth: contactsByMonth.map(month => ({
                        month: month.get('month'),
                        contacts: parseInt(month.get('count'))
                    }))
                },
                recent: recentContactDetails
            };

            logger.api('Contact analytics retrieved', {
                period,
                totalContacts,
                recentContacts
            });

            res.json({
                period,
                dateRange: {
                    start: dateRange.startDate.toISOString(),
                    end: dateRange.endDate.toISOString()
                },
                contacts: analytics
            });

        } catch (error) {
            logger.error('Error fetching contact analytics:', error);
            res.status(500).json({
                error: 'Failed to fetch contact analytics',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Record custom analytics event
    static async recordEvent(req, res) {
        try {
            const {
                eventType,
                eventName,
                eventData = {},
                userId = null,
                sessionId = null
            } = req.body;

            if (!eventType || !eventName) {
                return res.status(400).json({
                    error: 'Validation failed',
                    message: 'eventType and eventName are required'
                });
            }

            // Create analytics record
            const analyticsRecord = await Analytics.create({
                eventType,
                eventName,
                eventData,
                userId,
                sessionId,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                referrer: req.get('Referrer') || null
            });

            logger.api('Analytics event recorded', {
                eventType,
                eventName,
                userId,
                ip: req.ip
            });

            res.status(201).json({
                message: 'Event recorded successfully',
                eventId: analyticsRecord.id
            });

        } catch (error) {
            logger.error('Error recording analytics event:', error);
            res.status(500).json({
                error: 'Failed to record event',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get custom analytics events
    static async getCustomEvents(req, res) {
        try {
            const {
                eventType,
                eventName,
                period = '7d',
                page = 1,
                limit = 50
            } = req.query;

            const dateRange = AnalyticsController.getDateRange(period);
            const whereClause = {
                createdAt: {
                    [Op.gte]: dateRange.startDate,
                    [Op.lte]: dateRange.endDate
                }
            };

            if (eventType) whereClause.eventType = eventType;
            if (eventName) whereClause.eventName = eventName;

            const offset = (parseInt(page) - 1) * parseInt(limit);

            const { count, rows: events } = await Analytics.findAndCountAll({
                where: whereClause,
                limit: parseInt(limit),
                offset,
                order: [['createdAt', 'DESC']]
            });

            // Get event summary
            const eventSummary = await Analytics.findAll({
                attributes: [
                    'eventType',
                    'eventName',
                    [Analytics.sequelize.fn('COUNT', '*'), 'count']
                ],
                where: whereClause,
                group: ['eventType', 'eventName'],
                order: [[Analytics.sequelize.literal('count'), 'DESC']]
            });

            const totalPages = Math.ceil(count / parseInt(limit));

            res.json({
                events,
                summary: eventSummary.map(event => ({
                    eventType: event.eventType,
                    eventName: event.eventName,
                    count: parseInt(event.get('count'))
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalEvents: count,
                    eventsPerPage: parseInt(limit),
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1
                },
                filters: { eventType, eventName, period }
            });

        } catch (error) {
            logger.error('Error fetching custom events:', error);
            res.status(500).json({
                error: 'Failed to fetch custom events',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Export analytics data
    static async exportAnalyticsData(req, res) {
        try {
            const { type = 'all', format = 'json', period = '30d' } = req.query;
            const dateRange = AnalyticsController.getDateRange(period);

            let exportData = {
                generatedAt: new Date().toISOString(),
                period,
                dateRange: {
                    start: dateRange.startDate.toISOString(),
                    end: dateRange.endDate.toISOString()
                }
            };

            if (type === 'all' || type === 'dashboard') {
                // Get dashboard data
                const dashboardData = await AnalyticsController.getDashboardData(dateRange);
                exportData.dashboard = dashboardData;
            }

            if (type === 'all' || type === 'performance') {
                // Get performance data
                const performanceMetrics = performanceMonitor.getMetrics();
                exportData.performance = performanceMetrics;
            }

            if (type === 'all' || type === 'contacts') {
                // Get contact data
                const contacts = await ContactSubmission.findAll({
                    where: {
                        createdAt: {
                            [Op.gte]: dateRange.startDate,
                            [Op.lte]: dateRange.endDate
                        }
                    },
                    attributes: ['id', 'name', 'email', 'serviceType', 'status', 'createdAt'],
                    order: [['createdAt', 'DESC']]
                });
                exportData.contacts = contacts;
            }

            if (format === 'csv') {
                // Convert to CSV format
                const csvData = AnalyticsController.convertToCSV(exportData, type);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="analytics-${type}-${period}.csv"`);
                return res.send(csvData);
            }

            // Return JSON by default
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="analytics-${type}-${period}.json"`);

            logger.api('Analytics data exported', { type, format, period });

            res.json(exportData);

        } catch (error) {
            logger.error('Error exporting analytics data:', error);
            res.status(500).json({
                error: 'Failed to export analytics data',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Helper method to get date range based on period
    static getDateRange(period) {
        const endDate = new Date();
        let startDate;

        switch (period) {
            case '24h':
                startDate = new Date(endDate - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                startDate = new Date(endDate - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(endDate - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(endDate - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(endDate - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(endDate - 30 * 24 * 60 * 60 * 1000);
        }

        return { startDate, endDate };
    }

    // Helper method to get recent activity
    static async getRecentActivity(dateRange) {
        try {
            const [recentProjects, recentBlogPosts, recentContacts] = await Promise.all([
                Project.findAll({
                    where: {
                        createdAt: { [Op.gte]: dateRange.startDate }
                    },
                    order: [['createdAt', 'DESC']],
                    limit: 5,
                    attributes: ['id', 'title', 'status', 'createdAt']
                }),
                BlogPost.findAll({
                    where: {
                        createdAt: { [Op.gte]: dateRange.startDate }
                    },
                    order: [['createdAt', 'DESC']],
                    limit: 5,
                    attributes: ['id', 'title', 'status', 'createdAt']
                }),
                ContactSubmission.findAll({
                    where: {
                        createdAt: { [Op.gte]: dateRange.startDate }
                    },
                    order: [['createdAt', 'DESC']],
                    limit: 5,
                    attributes: ['id', 'name', 'serviceType', 'createdAt']
                })
            ]);

            const activity = [];

            recentProjects.forEach(project => {
                activity.push({
                    type: 'project',
                    action: 'created',
                    title: project.title,
                    status: project.status,
                    date: project.createdAt
                });
            });

            recentBlogPosts.forEach(post => {
                activity.push({
                    type: 'blog_post',
                    action: 'created',
                    title: post.title,
                    status: post.status,
                    date: post.createdAt
                });
            });

            recentContacts.forEach(contact => {
                activity.push({
                    type: 'contact',
                    action: 'submitted',
                    title: `Contact from ${contact.name}`,
                    status: contact.serviceType,
                    date: contact.createdAt
                });
            });

            return activity
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10);

        } catch (error) {
            logger.error('Error fetching recent activity:', error);
            return [];
        }
    }

    // Helper method to calculate growth metrics
    static async calculateGrowthMetrics(period) {
        try {
            const currentRange = AnalyticsController.getDateRange(period);
            const previousRange = {
                startDate: new Date(currentRange.startDate - (currentRange.endDate - currentRange.startDate)),
                endDate: currentRange.startDate
            };

            const [
                currentProjects,
                previousProjects,
                currentBlogPosts,
                previousBlogPosts,
                currentContacts,
                previousContacts
            ] = await Promise.all([
                Project.count({
                    where: {
                        createdAt: {
                            [Op.gte]: currentRange.startDate,
                            [Op.lte]: currentRange.endDate
                        }
                    }
                }),
                Project.count({
                    where: {
                        createdAt: {
                            [Op.gte]: previousRange.startDate,
                            [Op.lte]: previousRange.endDate
                        }
                    }
                }),
                BlogPost.count({
                    where: {
                        createdAt: {
                            [Op.gte]: currentRange.startDate,
                            [Op.lte]: currentRange.endDate
                        }
                    }
                }),
                BlogPost.count({
                    where: {
                        createdAt: {
                            [Op.gte]: previousRange.startDate,
                            [Op.lte]: previousRange.endDate
                        }
                    }
                }),
                ContactSubmission.count({
                    where: {
                        createdAt: {
                            [Op.gte]: currentRange.startDate,
                            [Op.lte]: currentRange.endDate
                        }
                    }
                }),
                ContactSubmission.count({
                    where: {
                        createdAt: {
                            [Op.gte]: previousRange.startDate,
                            [Op.lte]: previousRange.endDate
                        }
                    }
                })
            ]);

            const calculateGrowth = (current, previous) => {
                if (previous === 0) return current > 0 ? 100 : 0;
                return Math.round(((current - previous) / previous) * 100);
            };

            return {
                projects: {
                    current: currentProjects,
                    previous: previousProjects,
                    growth: calculateGrowth(currentProjects, previousProjects)
                },
                blogPosts: {
                    current: currentBlogPosts,
                    previous: previousBlogPosts,
                    growth: calculateGrowth(currentBlogPosts, previousBlogPosts)
                },
                contacts: {
                    current: currentContacts,
                    previous: previousContacts,
                    growth: calculateGrowth(currentContacts, previousContacts)
                }
            };

        } catch (error) {
            logger.error('Error calculating growth metrics:', error);
            return {};
        }
    }

    // Helper method to convert data to CSV
    static convertToCSV(data, type) {
        let csvContent = '';

        if (type === 'contacts' && data.contacts) {
            csvContent = 'ID,Name,Email,Service Type,Status,Created At\n';
            data.contacts.forEach(contact => {
                csvContent += `${contact.id},"${contact.name}","${contact.email}","${contact.serviceType || ''}","${contact.status}","${contact.createdAt}"\n`;
            });
        } else {
            // Default CSV format for mixed data
            csvContent = 'Type,Key,Value,Date\n';
            csvContent += `Export,Generated At,"${data.generatedAt}","${data.generatedAt}"\n`;
            csvContent += `Export,Period,"${data.period}","${data.generatedAt}"\n`;
        }

        return csvContent;
    }
}

module.exports = AnalyticsController;