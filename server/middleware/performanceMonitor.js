// server/middleware/performanceMonitor.js
const { logger } = require('../utils/logger');

// Performance monitoring configuration
const PERFORMANCE_CONFIG = {
    // Response time thresholds (in milliseconds)
    thresholds: {
        fast: 100,
        normal: 500,
        slow: 1000,
        critical: 2000
    },

    // Memory usage thresholds (in MB)
    memoryThresholds: {
        warning: 100,
        critical: 200
    },

    // Performance metrics collection interval
    metricsInterval: 60000, // 1 minute

    // Routes to monitor specifically
    criticalRoutes: [
        '/api/projects',
        '/api/blog',
        '/api/services',
        '/api/contact'
    ],

    // Enable detailed monitoring
    enableDetailedMonitoring: process.env.NODE_ENV === 'development'
};

class PerformanceMonitor {
    constructor() {
        this.config = PERFORMANCE_CONFIG;
        this.metrics = {
            requests: {
                total: 0,
                success: 0,
                errors: 0,
                averageResponseTime: 0,
                slowRequests: 0
            },
            memory: {
                current: 0,
                peak: 0,
                warnings: 0
            },
            routes: new Map(),
            startTime: Date.now()
        };

        this.responseTimes = [];
        this.maxResponseTimes = 1000; // Keep last 1000 response times

        this.startMetricsCollection();
    }

    // Start periodic metrics collection
    startMetricsCollection() {
        setInterval(() => {
            this.collectSystemMetrics();
        }, this.config.metricsInterval);

        logger.info('Performance monitoring started');
    }

    // Collect system-level metrics
    collectSystemMetrics() {
        const memUsage = process.memoryUsage();
        const currentMemoryMB = memUsage.heapUsed / 1024 / 1024;

        // Update memory metrics
        this.metrics.memory.current = currentMemoryMB;
        if (currentMemoryMB > this.metrics.memory.peak) {
            this.metrics.memory.peak = currentMemoryMB;
        }

        // Check memory thresholds
        if (currentMemoryMB > this.config.memoryThresholds.critical) {
            this.metrics.memory.warnings++;
            logger.security('Critical memory usage detected', {
                currentMemory: `${currentMemoryMB.toFixed(2)}MB`,
                threshold: `${this.config.memoryThresholds.critical}MB`,
                heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
                external: `${(memUsage.external / 1024 / 1024).toFixed(2)}MB`
            });
        } else if (currentMemoryMB > this.config.memoryThresholds.warning) {
            logger.performance('High memory usage warning', {
                currentMemory: `${currentMemoryMB.toFixed(2)}MB`,
                threshold: `${this.config.memoryThresholds.warning}MB`
            });
        }

        // Log periodic performance summary
        this.logPerformanceSummary();
    }

    // Record request metrics
    recordRequest(req, res, responseTime) {
        this.metrics.requests.total++;

        // Track response times
        this.responseTimes.push(responseTime);
        if (this.responseTimes.length > this.maxResponseTimes) {
            this.responseTimes.shift();
        }

        // Update average response time
        const sum = this.responseTimes.reduce((a, b) => a + b, 0);
        this.metrics.requests.averageResponseTime = sum / this.responseTimes.length;

        // Categorize response
        if (res.statusCode >= 200 && res.statusCode < 300) {
            this.metrics.requests.success++;
        } else if (res.statusCode >= 400) {
            this.metrics.requests.errors++;
        }

        // Track slow requests
        if (responseTime > this.config.thresholds.slow) {
            this.metrics.requests.slowRequests++;
        }

        // Track route-specific metrics
        const route = this.normalizeRoute(req.route?.path || req.path);
        if (!this.metrics.routes.has(route)) {
            this.metrics.routes.set(route, {
                count: 0,
                totalTime: 0,
                averageTime: 0,
                maxTime: 0,
                minTime: Infinity,
                errors: 0,
                slowRequests: 0
            });
        }

        const routeMetrics = this.metrics.routes.get(route);
        routeMetrics.count++;
        routeMetrics.totalTime += responseTime;
        routeMetrics.averageTime = routeMetrics.totalTime / routeMetrics.count;
        routeMetrics.maxTime = Math.max(routeMetrics.maxTime, responseTime);
        routeMetrics.minTime = Math.min(routeMetrics.minTime, responseTime);

        if (res.statusCode >= 400) {
            routeMetrics.errors++;
        }

        if (responseTime > this.config.thresholds.slow) {
            routeMetrics.slowRequests++;
        }
    }

    // Normalize route paths for consistent tracking
    normalizeRoute(path) {
        if (!path) return 'unknown';

        // Replace dynamic segments with placeholders
        return path
            .replace(/\/\d+/g, '/:id')
            .replace(/\/[a-f0-9-]{36}/g, '/:uuid')
            .replace(/\/[a-zA-Z0-9-_]+\.(jpg|jpeg|png|gif|webp|pdf|doc|docx)$/i, '/:file');
    }

    // Analyze performance and generate insights
    analyzePerformance(req, res, responseTime) {
        const route = this.normalizeRoute(req.route?.path || req.path);
        const method = req.method;
        const statusCode = res.statusCode;
        const userAgent = req.get('User-Agent');
        const contentLength = res.get('Content-Length') || 0;

        let performanceLevel = 'excellent';
        let shouldLog = false;

        // Determine performance level
        if (responseTime > this.config.thresholds.critical) {
            performanceLevel = 'critical';
            shouldLog = true;
        } else if (responseTime > this.config.thresholds.slow) {
            performanceLevel = 'slow';
            shouldLog = true;
        } else if (responseTime > this.config.thresholds.normal) {
            performanceLevel = 'normal';
            shouldLog = this.config.enableDetailedMonitoring;
        } else if (responseTime > this.config.thresholds.fast) {
            performanceLevel = 'good';
            shouldLog = this.config.enableDetailedMonitoring;
        }

        // Log performance data
        if (shouldLog || this.config.criticalRoutes.includes(route)) {
            const logData = {
                method,
                route,
                statusCode,
                responseTime: `${responseTime}ms`,
                performanceLevel,
                contentLength: `${contentLength} bytes`,
                ip: req.ip,
                userAgent: userAgent?.substring(0, 100)
            };

            if (performanceLevel === 'critical') {
                logger.security('Critical response time detected', logData);
            } else if (performanceLevel === 'slow') {
                logger.performance('Slow response detected', logData);
            } else {
                logger.performance('Request performance', logData);
            }
        }

        return {
            performanceLevel,
            responseTime,
            route,
            statusCode
        };
    }

    // Get current performance metrics
    getMetrics() {
        const uptime = Date.now() - this.metrics.startTime;
        const memUsage = process.memoryUsage();

        return {
            uptime: Math.floor(uptime / 1000), // seconds
            requests: { ...this.metrics.requests },
            memory: {
                ...this.metrics.memory,
                heap: {
                    used: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
                    total: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100
                },
                external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100,
                rss: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100
            },
            routes: Object.fromEntries(
                Array.from(this.metrics.routes.entries()).map(([route, metrics]) => [
                    route,
                    {
                        ...metrics,
                        averageTime: Math.round(metrics.averageTime * 100) / 100,
                        maxTime: Math.round(metrics.maxTime * 100) / 100,
                        minTime: metrics.minTime === Infinity ? 0 : Math.round(metrics.minTime * 100) / 100
                    }
                ])
            ),
            thresholds: this.config.thresholds
        };
    }

    // Log performance summary
    logPerformanceSummary() {
        const metrics = this.getMetrics();
        const requestsPerMinute = (metrics.requests.total / (metrics.uptime / 60)).toFixed(2);
        const errorRate = ((metrics.requests.errors / metrics.requests.total) * 100).toFixed(2);
        const slowRequestRate = ((metrics.requests.slowRequests / metrics.requests.total) * 100).toFixed(2);

        logger.performance('Performance summary', {
            uptime: `${metrics.uptime}s`,
            totalRequests: metrics.requests.total,
            requestsPerMinute,
            averageResponseTime: `${metrics.requests.averageResponseTime.toFixed(2)}ms`,
            errorRate: `${errorRate}%`,
            slowRequestRate: `${slowRequestRate}%`,
            memoryUsage: `${metrics.memory.current.toFixed(2)}MB`,
            peakMemory: `${metrics.memory.peak.toFixed(2)}MB`
        });
    }

    // Reset metrics
    resetMetrics() {
        this.metrics = {
            requests: {
                total: 0,
                success: 0,
                errors: 0,
                averageResponseTime: 0,
                slowRequests: 0
            },
            memory: {
                current: 0,
                peak: 0,
                warnings: 0
            },
            routes: new Map(),
            startTime: Date.now()
        };
        this.responseTimes = [];

        logger.info('Performance metrics reset');
    }
}

// Create performance monitor instance
const performanceMonitor = new PerformanceMonitor();

// Main performance monitoring middleware - FIXED VERSION
const performanceMiddleware = (req, res, next) => {
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage();

    // Add performance helpers to request
    req.performance = {
        startTime,
        startMemory,
        monitor: performanceMonitor
    };

    // Track if response has been sent
    let responseSent = false;

    // Override res.end to capture metrics
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        // Prevent multiple executions
        if (responseSent) {
            return originalEnd.call(this, chunk, encoding);
        }
        responseSent = true;

        const endTime = process.hrtime.bigint();
        const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds

        // Record metrics
        performanceMonitor.recordRequest(req, res, responseTime);

        // Analyze performance
        const analysis = performanceMonitor.analyzePerformance(req, res, responseTime);

        // Add performance headers ONLY if response hasn't been sent yet
        if (!res.headersSent) {
            try {
                res.setHeader('X-Response-Time', `${responseTime.toFixed(2)}ms`);
                res.setHeader('X-Performance-Level', analysis.performanceLevel);
            } catch (error) {
                // Headers already sent, log but don't fail
                logger.debug('Performance headers could not be set - response already sent', {
                    route: req.path,
                    responseTime: `${responseTime.toFixed(2)}ms`
                });
            }
        }

        // Call original end
        originalEnd.call(this, chunk, encoding);
    };

    // Also override res.json, res.send, etc. to ensure we catch all response methods
    const originalJson = res.json;
    res.json = function (obj) {
        if (!responseSent) {
            responseSent = true;
            const endTime = process.hrtime.bigint();
            const responseTime = Number(endTime - startTime) / 1000000;

            // Record metrics
            performanceMonitor.recordRequest(req, res, responseTime);
            const analysis = performanceMonitor.analyzePerformance(req, res, responseTime);

            // Add performance headers before sending JSON
            if (!res.headersSent) {
                try {
                    res.setHeader('X-Response-Time', `${responseTime.toFixed(2)}ms`);
                    res.setHeader('X-Performance-Level', analysis.performanceLevel);
                } catch (error) {
                    logger.debug('Performance headers could not be set in json method', {
                        route: req.path,
                        responseTime: `${responseTime.toFixed(2)}ms`
                    });
                }
            }
        }
        return originalJson.call(this, obj);
    };

    next();
};

// Health check middleware with performance metrics
const healthCheckMiddleware = (req, res, next) => {
    if (req.path === '/api/health' || req.path === '/api/performance') {
        const metrics = performanceMonitor.getMetrics();
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: metrics.uptime,
            performance: {
                averageResponseTime: `${metrics.requests.averageResponseTime.toFixed(2)}ms`,
                requestsPerSecond: (metrics.requests.total / metrics.uptime).toFixed(2),
                errorRate: `${((metrics.requests.errors / metrics.requests.total) * 100 || 0).toFixed(2)}%`,
                memoryUsage: `${metrics.memory.current.toFixed(2)}MB`
            }
        };

        // Include detailed metrics for performance endpoint
        if (req.path === '/api/performance') {
            healthData.detailedMetrics = metrics;
        }

        return res.json(healthData);
    }

    next();
};

// Performance alert middleware
const performanceAlertMiddleware = (options = {}) => {
    const {
        responseTimeThreshold = PERFORMANCE_CONFIG.thresholds.critical,
        memoryThreshold = PERFORMANCE_CONFIG.memoryThresholds.critical,
        errorRateThreshold = 10 // 10% error rate
    } = options;

    return (req, res, next) => {
        // Check for performance issues after request completes
        res.on('finish', () => {
            const metrics = performanceMonitor.getMetrics();

            // Check error rate
            const errorRate = (metrics.requests.errors / metrics.requests.total) * 100;
            if (errorRate > errorRateThreshold && metrics.requests.total > 10) {
                logger.security('High error rate detected', {
                    errorRate: `${errorRate.toFixed(2)}%`,
                    threshold: `${errorRateThreshold}%`,
                    totalRequests: metrics.requests.total,
                    errors: metrics.requests.errors
                });
            }

            // Check memory usage
            if (metrics.memory.current > memoryThreshold) {
                logger.security('High memory usage alert', {
                    currentMemory: `${metrics.memory.current.toFixed(2)}MB`,
                    threshold: `${memoryThreshold}MB`,
                    peakMemory: `${metrics.memory.peak.toFixed(2)}MB`
                });
            }
        });

        next();
    };
};

// Express middleware to add performance monitoring
const addPerformanceMonitoring = (app) => {
    // Add performance monitoring to all routes
    app.use(performanceMiddleware);

    // Add health check with performance metrics
    app.use(healthCheckMiddleware);

    // Add performance alerts
    app.use(performanceAlertMiddleware());

    logger.info('Performance monitoring middleware initialized');
};

module.exports = {
    PerformanceMonitor,
    performanceMonitor,
    performanceMiddleware,
    healthCheckMiddleware,
    performanceAlertMiddleware,
    addPerformanceMonitoring,
    PERFORMANCE_CONFIG
};