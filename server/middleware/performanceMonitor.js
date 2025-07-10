
const { logger } = require('../utils/logger');
const performanceMonitorUtility = require('../utils/performanceMonitor'); // Import the new utility

// Performance monitoring configuration (keep your existing config)
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

        // Start the new utility monitoring as well
        this.startUtilityMonitoring();
    }

    // NEW: Start the enhanced utility monitoring
    startUtilityMonitoring() {
        try {
            performanceMonitorUtility.startMonitoring();
            logger.info('Enhanced performance monitoring utility started');
        } catch (error) {
            logger.error('Failed to start enhanced performance monitoring:', error);
        }
    }

    // Start periodic metrics collection (your existing method)
    startMetricsCollection() {
        setInterval(() => {
            this.collectSystemMetrics();
        }, this.config.metricsInterval);

        logger.info('Performance monitoring started');
    }

    // Enhanced system metrics collection
    collectSystemMetrics() {
        const memUsage = process.memoryUsage();
        const currentMemoryMB = memUsage.heapUsed / 1024 / 1024;

        // Update memory metrics
        this.metrics.memory.current = currentMemoryMB;
        if (currentMemoryMB > this.metrics.memory.peak) {
            this.metrics.memory.peak = currentMemoryMB;
        }

        // Record memory metrics in the new utility too
        performanceMonitorUtility.recordMemoryMetrics();

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

    // Enhanced record request with utility integration
    recordRequest(req, res, responseTime) {
        // Your existing logic
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

        // NEW: Also record in the enhanced utility
        try {
            const startTime = Date.now() - responseTime;
            performanceMonitorUtility.recordRequest(req, startTime);
            performanceMonitorUtility.recordResponse(req, res, startTime);
        } catch (error) {
            logger.debug('Failed to record in utility monitor:', error);
        }
    }

    // Enhanced error recording
    recordError(error, req, context = {}) {
        try {
            performanceMonitorUtility.recordError(error, req, context);
        } catch (utilityError) {
            logger.debug('Failed to record error in utility monitor:', utilityError);
        }
    }

    // NEW: Record database operations
    recordDatabaseOperation(operation, duration, query = null) {
        try {
            performanceMonitorUtility.recordDatabaseOperation(operation, duration, query);
        } catch (error) {
            logger.debug('Failed to record database operation:', error);
        }
    }

    // Normalize route paths for consistent tracking (your existing method)
    normalizeRoute(path) {
        if (!path) return 'unknown';

        // Replace dynamic segments with placeholders
        return path
            .replace(/\/\d+/g, '/:id')
            .replace(/\/[a-f0-9-]{36}/g, '/:uuid')
            .replace(/\/[a-zA-Z0-9-_]+\.(jpg|jpeg|png|gif|webp|pdf|doc|docx)$/i, '/:file');
    }

    // Enhanced performance analysis
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

    // Enhanced metrics with utility data
    getMetrics() {
        const uptime = Date.now() - this.metrics.startTime;
        const memUsage = process.memoryUsage();

        // Get enhanced metrics from utility
        let enhancedMetrics = {};
        try {
            enhancedMetrics = performanceMonitorUtility.getPerformanceSummary();
        } catch (error) {
            logger.debug('Failed to get enhanced metrics:', error);
        }

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
            thresholds: this.config.thresholds,
            // NEW: Include enhanced metrics from utility
            enhanced: enhancedMetrics
        };
    }

    // NEW: Get health status from utility
    getHealthStatus() {
        try {
            return performanceMonitorUtility.getHealthStatus();
        } catch (error) {
            logger.debug('Failed to get health status from utility:', error);
            // Fallback to basic health check
            const metrics = this.getMetrics();
            return {
                status: 'healthy',
                score: 85,
                summary: metrics,
                uptime: metrics.uptime,
                timestamp: Date.now()
            };
        }
    }

    // NEW: Generate performance report
    async generateReport(hours = 24) {
        try {
            return await performanceMonitorUtility.generateReport(hours);
        } catch (error) {
            logger.error('Failed to generate performance report:', error);
            throw error;
        }
    }

    // Log performance summary (your existing method with enhancements)
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

    // Reset metrics (your existing method)
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

        // Also reset utility metrics
        try {
            performanceMonitorUtility.resetMetrics();
        } catch (error) {
            logger.debug('Failed to reset utility metrics:', error);
        }

        logger.info('Performance metrics reset');
    }
}

// Create performance monitor instance
const performanceMonitor = new PerformanceMonitor();

// Enhanced middleware with error recording
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
        if (responseSent) {
            return originalEnd.call(this, chunk, encoding);
        }
        responseSent = true;

        const endTime = process.hrtime.bigint();
        const responseTime = Number(endTime - startTime) / 1000000;

        // Record metrics
        performanceMonitor.recordRequest(req, res, responseTime);

        // Analyze performance
        const analysis = performanceMonitor.analyzePerformance(req, res, responseTime);

        // Add performance headers
        if (!res.headersSent) {
            try {
                res.setHeader('X-Response-Time', `${responseTime.toFixed(2)}ms`);
                res.setHeader('X-Performance-Level', analysis.performanceLevel);
            } catch (error) {
                logger.debug('Performance headers could not be set', {
                    route: req.path,
                    responseTime: `${responseTime.toFixed(2)}ms`
                });
            }
        }

        originalEnd.call(this, chunk, encoding);
    };

    // Override res.json
    const originalJson = res.json;
    res.json = function (obj) {
        if (!responseSent) {
            responseSent = true;
            const endTime = process.hrtime.bigint();
            const responseTime = Number(endTime - startTime) / 1000000;

            performanceMonitor.recordRequest(req, res, responseTime);
            const analysis = performanceMonitor.analyzePerformance(req, res, responseTime);

            if (!res.headersSent) {
                try {
                    res.setHeader('X-Response-Time', `${responseTime.toFixed(2)}ms`);
                    res.setHeader('X-Performance-Level', analysis.performanceLevel);
                } catch (error) {
                    logger.debug('Performance headers could not be set in json method');
                }
            }
        }
        return originalJson.call(this, obj);
    };

    next();
};

// Enhanced health check with utility integration
const healthCheckMiddleware = (req, res, next) => {
    if (req.path === '/api/health') {
        const healthStatus = performanceMonitor.getHealthStatus();
        return res.json(healthStatus);
    }

    if (req.path === '/api/performance' || req.path === '/api/metrics') {
        const metrics = performanceMonitor.getMetrics();
        return res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            detailedMetrics: metrics
        });
    }

    next();
};

// Enhanced error middleware
const errorTrackingMiddleware = (error, req, res, next) => {
    // Record error in performance monitor
    performanceMonitor.recordError(error, req, {
        timestamp: Date.now(),
        userAgent: req.get('User-Agent'),
        referer: req.get('Referer')
    });

    next(error);
};

// Database operation tracker (NEW)
const trackDatabaseOperation = (operation, startTime, query = null) => {
    const duration = Date.now() - startTime;
    performanceMonitor.recordDatabaseOperation(operation, duration, query);
};

// Performance alert middleware (your existing with enhancements)
const performanceAlertMiddleware = (options = {}) => {
    const {
        responseTimeThreshold = PERFORMANCE_CONFIG.thresholds.critical,
        memoryThreshold = PERFORMANCE_CONFIG.memoryThresholds.critical,
        errorRateThreshold = 10
    } = options;

    return (req, res, next) => {
        res.on('finish', () => {
            const metrics = performanceMonitor.getMetrics();

            const errorRate = (metrics.requests.errors / metrics.requests.total) * 100;
            if (errorRate > errorRateThreshold && metrics.requests.total > 10) {
                logger.security('High error rate detected', {
                    errorRate: `${errorRate.toFixed(2)}%`,
                    threshold: `${errorRateThreshold}%`,
                    totalRequests: metrics.requests.total,
                    errors: metrics.requests.errors
                });
            }

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

// Express middleware setup (your existing with enhancements)
const addPerformanceMonitoring = (app) => {
    app.use(performanceMiddleware);
    app.use(healthCheckMiddleware);
    app.use(performanceAlertMiddleware());

    // Add error tracking middleware
    app.use(errorTrackingMiddleware);

    logger.info('Enhanced performance monitoring middleware initialized');
};

module.exports = {
    PerformanceMonitor,
    performanceMonitor,
    performanceMiddleware,
    healthCheckMiddleware,
    performanceAlertMiddleware,
    errorTrackingMiddleware,
    trackDatabaseOperation,
    addPerformanceMonitoring,
    PERFORMANCE_CONFIG
};