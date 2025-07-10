// server/utils/performanceMonitor.js
const { logger } = require('./logger');
const { Analytics } = require('../models');
const os = require('os');
const process = require('process');

class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.intervals = new Map();
        this.isMonitoring = false;
        this.startTime = Date.now();

        // Initialize metrics storage
        this.initializeMetrics();
    }

    /**
     * Initialize metrics storage
     */
    initializeMetrics() {
        this.metrics.set('requests', []);
        this.metrics.set('responses', []);
        this.metrics.set('errors', []);
        this.metrics.set('database', []);
        this.metrics.set('memory', []);
        this.metrics.set('cpu', []);
        this.metrics.set('system', []);
    }

    /**
     * Start performance monitoring
     */
    startMonitoring() {
        if (this.isMonitoring) {
            logger.warn('Performance monitoring is already running');
            return;
        }

        this.isMonitoring = true;

        // Monitor system metrics every 30 seconds
        this.intervals.set('system', setInterval(() => {
            this.recordSystemMetrics();
        }, 30000));

        // Monitor memory every 10 seconds
        this.intervals.set('memory', setInterval(() => {
            this.recordMemoryMetrics();
        }, 10000));

        // Save metrics to database every 5 minutes
        this.intervals.set('database', setInterval(() => {
            this.saveMetricsToDatabase();
        }, 300000));

        logger.info('Performance monitoring started');
    }

    /**
     * Stop performance monitoring
     */
    stopMonitoring() {
        if (!this.isMonitoring) return;

        this.isMonitoring = false;

        // Clear all intervals
        for (const [name, interval] of this.intervals) {
            clearInterval(interval);
        }
        this.intervals.clear();

        logger.info('Performance monitoring stopped');
    }

    /**
     * Record HTTP request metrics
     */
    recordRequest(req, startTime) {
        const duration = Date.now() - startTime;

        const requestMetric = {
            timestamp: Date.now(),
            method: req.method,
            url: req.originalUrl,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            duration,
            headers: {
                contentLength: req.get('Content-Length') || 0,
                acceptEncoding: req.get('Accept-Encoding')
            }
        };

        this.addMetric('requests', requestMetric);

        // Log slow requests
        if (duration > 1000) {
            logger.performance('Slow request detected', requestMetric);
        }
    }

    /**
     * Record HTTP response metrics
     */
    recordResponse(req, res, startTime) {
        const duration = Date.now() - startTime;

        const responseMetric = {
            timestamp: Date.now(),
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration,
            contentLength: res.get('Content-Length') || 0,
            ip: req.ip
        };

        this.addMetric('responses', responseMetric);

        // Track response time percentiles
        this.updateResponseTimePercentiles(duration);

        // Log request completion
        logger.request(req, res, duration);
    }

    /**
     * Record error metrics
     */
    recordError(error, req = null, context = {}) {
        const errorMetric = {
            timestamp: Date.now(),
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code,
            statusCode: error.statusCode || 500,
            url: req?.originalUrl,
            method: req?.method,
            ip: req?.ip,
            context
        };

        this.addMetric('errors', errorMetric);

        logger.error('Error recorded in performance monitoring', errorMetric);
    }

    /**
     * Record database operation metrics
     */
    recordDatabaseOperation(operation, duration, query = null) {
        const dbMetric = {
            timestamp: Date.now(),
            operation,
            duration,
            query: query?.length > 100 ? query.substring(0, 100) + '...' : query
        };

        this.addMetric('database', dbMetric);

        // Log slow database queries
        if (duration > 500) {
            logger.performance('Slow database query detected', dbMetric);
        }
    }

    /**
     * Record memory metrics
     */
    recordMemoryMetrics() {
        const memoryUsage = process.memoryUsage();
        const systemMemory = {
            total: os.totalmem(),
            free: os.freemem(),
            used: os.totalmem() - os.freemem()
        };

        const memoryMetric = {
            timestamp: Date.now(),
            process: {
                rss: memoryUsage.rss,
                heapTotal: memoryUsage.heapTotal,
                heapUsed: memoryUsage.heapUsed,
                external: memoryUsage.external,
                arrayBuffers: memoryUsage.arrayBuffers
            },
            system: {
                total: systemMemory.total,
                free: systemMemory.free,
                used: systemMemory.used,
                percentage: ((systemMemory.used / systemMemory.total) * 100).toFixed(2)
            }
        };

        this.addMetric('memory', memoryMetric);

        // Alert on high memory usage
        if (memoryMetric.system.percentage > 90) {
            logger.warn('High system memory usage detected', {
                percentage: memoryMetric.system.percentage
            });
        }

        if (memoryMetric.process.heapUsed > memoryMetric.process.heapTotal * 0.9) {
            logger.warn('High process heap usage detected', {
                heapUsed: memoryMetric.process.heapUsed,
                heapTotal: memoryMetric.process.heapTotal
            });
        }
    }

    /**
     * Record system metrics
     */
    recordSystemMetrics() {
        const cpuUsage = process.cpuUsage();
        const uptime = process.uptime();

        const systemMetric = {
            timestamp: Date.now(),
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system,
                cores: os.cpus().length,
                loadAverage: os.loadavg()
            },
            uptime: {
                process: uptime,
                system: os.uptime()
            },
            platform: {
                type: os.type(),
                platform: os.platform(),
                arch: os.arch(),
                release: os.release()
            }
        };

        this.addMetric('system', systemMetric);
    }

    /**
     * Add metric to storage with size limit
     */
    addMetric(type, metric) {
        const metrics = this.metrics.get(type) || [];
        metrics.push(metric);

        // Keep only last 1000 entries to prevent memory issues
        if (metrics.length > 1000) {
            metrics.splice(0, metrics.length - 1000);
        }

        this.metrics.set(type, metrics);
    }

    /**
     * Update response time percentiles
     */
    updateResponseTimePercentiles(duration) {
        const responses = this.metrics.get('responses') || [];
        const recentResponses = responses
            .filter(r => Date.now() - r.timestamp < 300000) // Last 5 minutes
            .map(r => r.duration)
            .sort((a, b) => a - b);

        if (recentResponses.length === 0) return;

        const percentiles = {
            p50: this.calculatePercentile(recentResponses, 50),
            p90: this.calculatePercentile(recentResponses, 90),
            p95: this.calculatePercentile(recentResponses, 95),
            p99: this.calculatePercentile(recentResponses, 99)
        };

        this.metrics.set('responseTimePercentiles', percentiles);
    }

    /**
     * Calculate percentile from sorted array
     */
    calculatePercentile(sortedArray, percentile) {
        const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
        return sortedArray[Math.max(0, index)];
    }

    /**
     * Get current performance summary
     */
    getPerformanceSummary() {
        const now = Date.now();
        const last5Min = now - 300000;
        const last1Hour = now - 3600000;

        // Recent requests
        const recentRequests = this.metrics.get('requests')
            .filter(r => r.timestamp > last5Min);

        // Recent responses
        const recentResponses = this.metrics.get('responses')
            .filter(r => r.timestamp > last5Min);

        // Recent errors
        const recentErrors = this.metrics.get('errors')
            .filter(e => e.timestamp > last1Hour);

        // Calculate metrics
        const avgResponseTime = recentResponses.length > 0
            ? recentResponses.reduce((sum, r) => sum + r.duration, 0) / recentResponses.length
            : 0;

        const errorRate = recentRequests.length > 0
            ? (recentErrors.length / recentRequests.length) * 100
            : 0;

        const requestsPerMinute = recentRequests.length / 5;

        // Get latest system metrics
        const latestMemory = this.metrics.get('memory').slice(-1)[0];
        const latestSystem = this.metrics.get('system').slice(-1)[0];

        return {
            timestamp: now,
            requests: {
                total: recentRequests.length,
                perMinute: requestsPerMinute.toFixed(2),
                avgResponseTime: avgResponseTime.toFixed(2)
            },
            errors: {
                total: recentErrors.length,
                rate: errorRate.toFixed(2)
            },
            responseTime: this.metrics.get('responseTimePercentiles') || {},
            memory: latestMemory ? {
                processHeapUsed: `${(latestMemory.process.heapUsed / 1024 / 1024).toFixed(2)}MB`,
                systemUsedPercentage: latestMemory.system.percentage
            } : {},
            system: latestSystem ? {
                uptime: `${(latestSystem.uptime.process / 3600).toFixed(2)} hours`,
                cpuCores: latestSystem.cpu.cores,
                loadAverage: latestSystem.cpu.loadAverage
            } : {}
        };
    }

    /**
     * Get detailed metrics for a specific type
     */
    getMetrics(type, limit = 100) {
        const metrics = this.metrics.get(type) || [];
        return metrics.slice(-limit);
    }

    /**
     * Get error analysis
     */
    getErrorAnalysis() {
        const errors = this.metrics.get('errors') || [];
        const last24Hours = Date.now() - 86400000;
        const recentErrors = errors.filter(e => e.timestamp > last24Hours);

        // Group by error type
        const errorsByType = {};
        const errorsByUrl = {};
        const errorsByStatusCode = {};

        recentErrors.forEach(error => {
            // By error name
            errorsByType[error.name] = (errorsByType[error.name] || 0) + 1;

            // By URL
            if (error.url) {
                errorsByUrl[error.url] = (errorsByUrl[error.url] || 0) + 1;
            }

            // By status code
            errorsByStatusCode[error.statusCode] = (errorsByStatusCode[error.statusCode] || 0) + 1;
        });

        return {
            total: recentErrors.length,
            byType: Object.entries(errorsByType)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10),
            byUrl: Object.entries(errorsByUrl)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10),
            byStatusCode: Object.entries(errorsByStatusCode)
                .sort(([, a], [, b]) => b - a)
        };
    }

    /**
     * Save metrics to database
     */
    async saveMetricsToDatabase() {
        try {
            const summary = this.getPerformanceSummary();
            const errorAnalysis = this.getErrorAnalysis();

            await Analytics.create({
                type: 'performance',
                data: {
                    summary,
                    errorAnalysis,
                    timestamp: Date.now()
                },
                metadata: {
                    source: 'performance_monitor',
                    version: '1.0'
                }
            });

            logger.info('Performance metrics saved to database');

        } catch (error) {
            logger.error('Failed to save performance metrics to database:', error);
        }
    }

    /**
     * Generate performance report
     */
    async generateReport(hours = 24) {
        try {
            const endTime = Date.now();
            const startTime = endTime - (hours * 3600000);

            // Get analytics data from database
            const analyticsData = await Analytics.findAll({
                where: {
                    type: 'performance',
                    createdAt: {
                        [require('sequelize').Op.gte]: new Date(startTime)
                    }
                },
                order: [['createdAt', 'ASC']]
            });

            const report = {
                period: {
                    start: new Date(startTime).toISOString(),
                    end: new Date(endTime).toISOString(),
                    hours
                },
                summary: this.getPerformanceSummary(),
                trends: this.analyzeTrends(analyticsData),
                recommendations: this.generateRecommendations()
            };

            return report;

        } catch (error) {
            logger.error('Failed to generate performance report:', error);
            throw error;
        }
    }

    /**
     * Analyze performance trends
     */
    analyzeTrends(analyticsData) {
        if (analyticsData.length < 2) {
            return { message: 'Insufficient data for trend analysis' };
        }

        const dataPoints = analyticsData.map(d => d.data.summary);

        return {
            responseTime: {
                trend: this.calculateTrend(dataPoints.map(d => parseFloat(d.requests.avgResponseTime))),
                current: dataPoints[dataPoints.length - 1].requests.avgResponseTime,
                previous: dataPoints[0].requests.avgResponseTime
            },
            requestVolume: {
                trend: this.calculateTrend(dataPoints.map(d => parseFloat(d.requests.perMinute))),
                current: dataPoints[dataPoints.length - 1].requests.perMinute,
                previous: dataPoints[0].requests.perMinute
            },
            errorRate: {
                trend: this.calculateTrend(dataPoints.map(d => parseFloat(d.errors.rate))),
                current: dataPoints[dataPoints.length - 1].errors.rate,
                previous: dataPoints[0].errors.rate
            },
            memoryUsage: {
                trend: this.calculateTrend(dataPoints.map(d => parseFloat(d.memory.systemUsedPercentage || 0))),
                current: dataPoints[dataPoints.length - 1].memory.systemUsedPercentage,
                previous: dataPoints[0].memory.systemUsedPercentage
            }
        };
    }

    /**
     * Calculate trend direction (improving, stable, degrading)
     */
    calculateTrend(values) {
        if (values.length < 2) return 'stable';

        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));

        const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

        const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

        if (changePercent > 5) return 'increasing';
        if (changePercent < -5) return 'decreasing';
        return 'stable';
    }

    /**
     * Generate performance recommendations
     */
    generateRecommendations() {
        const summary = this.getPerformanceSummary();
        const recommendations = [];

        // Response time recommendations
        const avgResponseTime = parseFloat(summary.requests.avgResponseTime);
        if (avgResponseTime > 1000) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                message: 'Average response time is above 1 second. Consider optimizing database queries and implementing caching.'
            });
        } else if (avgResponseTime > 500) {
            recommendations.push({
                type: 'performance',
                priority: 'medium',
                message: 'Response time could be improved. Review slow endpoints and optimize where possible.'
            });
        }

        // Error rate recommendations
        const errorRate = parseFloat(summary.errors.rate);
        if (errorRate > 5) {
            recommendations.push({
                type: 'reliability',
                priority: 'high',
                message: 'Error rate is above 5%. Investigate recent errors and implement proper error handling.'
            });
        } else if (errorRate > 1) {
            recommendations.push({
                type: 'reliability',
                priority: 'medium',
                message: 'Error rate could be improved. Monitor error patterns and address common issues.'
            });
        }

        // Memory recommendations
        const memoryUsage = parseFloat(summary.memory.systemUsedPercentage || 0);
        if (memoryUsage > 85) {
            recommendations.push({
                type: 'resources',
                priority: 'high',
                message: 'System memory usage is high. Consider scaling up or optimizing memory usage.'
            });
        }

        // Request volume recommendations
        const requestsPerMinute = parseFloat(summary.requests.perMinute);
        if (requestsPerMinute > 1000) {
            recommendations.push({
                type: 'scaling',
                priority: 'medium',
                message: 'High request volume detected. Consider implementing load balancing and caching strategies.'
            });
        }

        return recommendations;
    }

    /**
     * Create middleware for automatic request/response tracking
     */
    createMiddleware() {
        return (req, res, next) => {
            const startTime = Date.now();

            // Record request
            this.recordRequest(req, startTime);

            // Override res.end to capture response
            const originalEnd = res.end;
            res.end = (...args) => {
                // Record response
                this.recordResponse(req, res, startTime);

                // Call original end method
                originalEnd.apply(res, args);
            };

            next();
        };
    }

    /**
     * Create error handling middleware
     */
    createErrorMiddleware() {
        return (error, req, res, next) => {
            // Record error
            this.recordError(error, req);
            next(error);
        };
    }

    /**
     * Get health status
     */
    getHealthStatus() {
        const summary = this.getPerformanceSummary();
        const recommendations = this.generateRecommendations();

        let status = 'healthy';
        let score = 100;

        // Calculate health score based on metrics
        const avgResponseTime = parseFloat(summary.requests.avgResponseTime || 0);
        const errorRate = parseFloat(summary.errors.rate || 0);
        const memoryUsage = parseFloat(summary.memory.systemUsedPercentage || 0);

        // Response time impact (max -30 points)
        if (avgResponseTime > 2000) score -= 30;
        else if (avgResponseTime > 1000) score -= 20;
        else if (avgResponseTime > 500) score -= 10;

        // Error rate impact (max -40 points)
        if (errorRate > 10) score -= 40;
        else if (errorRate > 5) score -= 25;
        else if (errorRate > 1) score -= 10;

        // Memory usage impact (max -20 points)
        if (memoryUsage > 90) score -= 20;
        else if (memoryUsage > 80) score -= 10;

        // Determine status
        if (score < 60) status = 'critical';
        else if (score < 80) status = 'warning';
        else if (score < 95) status = 'degraded';

        return {
            status,
            score,
            summary,
            recommendations: recommendations.filter(r => r.priority === 'high'),
            uptime: process.uptime(),
            timestamp: Date.now()
        };
    }

    /**
     * Reset metrics (useful for testing)
     */
    resetMetrics() {
        this.initializeMetrics();
        logger.info('Performance metrics reset');
    }
}

// Export singleton instance
module.exports = new PerformanceMonitor();