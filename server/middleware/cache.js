// server/middleware/cache.js
const Redis = require('ioredis');
const { logger } = require('../utils/logger');

// Cache configuration
const CACHE_CONFIG = {
    // Default TTL values (in seconds)
    defaultTTL: parseInt(process.env.CACHE_TTL) || 3600, // 1 hour
    shortTTL: 300,    // 5 minutes
    mediumTTL: 1800,  // 30 minutes
    longTTL: 86400,   // 24 hours

    // Cache key prefixes
    keyPrefixes: {
        api: 'api:',
        page: 'page:',
        query: 'query:',
        user: 'user:',
        session: 'session:'
    },

    // Routes that should not be cached
    excludeRoutes: [
        '/api/health',
        '/api/admin',
        '/api/auth',
        '/api/contact'
    ],

    // Cache strategies
    strategies: {
        'api:projects': { ttl: 1800, tags: ['projects'] },
        'api:team': { ttl: 3600, tags: ['team'] },
        'api:blog': { ttl: 900, tags: ['blog'] },
        'api:services': { ttl: 3600, tags: ['services'] },
        'api:company': { ttl: 7200, tags: ['company'] }
    }
};

class CacheManager {
    constructor() {
        this.redis = null;
        this.isConnected = false;
        this.config = CACHE_CONFIG;
        this.init();
    }

    // Initialize Redis connection
    async init() {
        try {
            // Skip cache if disabled
            if (process.env.ENABLE_CACHE === 'false') {
                logger.info('Cache is disabled via environment variable');
                return;
            }

            const redisConfig = {
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD || undefined,
                db: process.env.REDIS_DB || 0,
                retryDelayOnFailover: 100,
                maxRetriesPerRequest: 3,
                lazyConnect: true,
                keepAlive: 30000,
                connectTimeout: 10000,
                commandTimeout: 5000
            };

            this.redis = new Redis(redisConfig);

            // Connection event handlers
            this.redis.on('connect', () => {
                this.isConnected = true;
                logger.info('Cache: Connected to Redis server');
            });

            this.redis.on('error', (error) => {
                this.isConnected = false;
                logger.error('Cache: Redis connection error:', error.message);
            });

            this.redis.on('close', () => {
                this.isConnected = false;
                logger.warn('Cache: Redis connection closed');
            });

            this.redis.on('reconnecting', () => {
                logger.info('Cache: Attempting to reconnect to Redis...');
            });

            // Test connection
            await this.redis.connect();
            await this.redis.ping();

            logger.info('Cache: Redis cache manager initialized successfully');

        } catch (error) {
            logger.error('Cache: Failed to initialize Redis:', error.message);
            this.isConnected = false;
        }
    }

    // Generate cache key
    generateKey(prefix, identifier, params = {}) {
        const baseKey = `${prefix}${identifier}`;

        if (Object.keys(params).length === 0) {
            return baseKey;
        }

        // Sort parameters for consistent key generation
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}:${params[key]}`)
            .join('|');

        return `${baseKey}:${Buffer.from(sortedParams).toString('base64')}`;
    }

    // Get value from cache
    async get(key) {
        if (!this.isConnected || !this.redis) {
            return null;
        }

        try {
            const value = await this.redis.get(key);
            if (value) {
                const parsed = JSON.parse(value);
                logger.performance('Cache hit', { key, size: value.length });
                return parsed;
            }
            return null;
        } catch (error) {
            logger.error('Cache: Get operation failed:', { key, error: error.message });
            return null;
        }
    }

    // Set value in cache
    async set(key, value, ttl = this.config.defaultTTL, tags = []) {
        if (!this.isConnected || !this.redis) {
            return false;
        }

        try {
            const serialized = JSON.stringify(value);

            // Set main cache entry
            await this.redis.setex(key, ttl, serialized);

            // Add to tag sets for cache invalidation
            if (tags.length > 0) {
                const pipeline = this.redis.pipeline();
                tags.forEach(tag => {
                    pipeline.sadd(`tag:${tag}`, key);
                    pipeline.expire(`tag:${tag}`, ttl + 300); // Tags expire slightly later
                });
                await pipeline.exec();
            }

            logger.performance('Cache set', {
                key,
                size: serialized.length,
                ttl,
                tags
            });

            return true;
        } catch (error) {
            logger.error('Cache: Set operation failed:', { key, error: error.message });
            return false;
        }
    }

    // Delete specific key
    async del(key) {
        if (!this.isConnected || !this.redis) {
            return false;
        }

        try {
            const result = await this.redis.del(key);
            logger.performance('Cache delete', { key, deleted: result > 0 });
            return result > 0;
        } catch (error) {
            logger.error('Cache: Delete operation failed:', { key, error: error.message });
            return false;
        }
    }

    // Invalidate cache by tags
    async invalidateByTags(tags) {
        if (!this.isConnected || !this.redis || !Array.isArray(tags)) {
            return false;
        }

        try {
            const pipeline = this.redis.pipeline();

            for (const tag of tags) {
                const keys = await this.redis.smembers(`tag:${tag}`);
                if (keys.length > 0) {
                    pipeline.del(...keys);
                    pipeline.del(`tag:${tag}`);
                }
            }

            const results = await pipeline.exec();
            const deletedCount = results.reduce((count, [err, result]) => count + (result || 0), 0);

            logger.performance('Cache invalidated by tags', { tags, deletedCount });
            return true;
        } catch (error) {
            logger.error('Cache: Tag invalidation failed:', { tags, error: error.message });
            return false;
        }
    }

    // Clear all cache
    async clear() {
        if (!this.isConnected || !this.redis) {
            return false;
        }

        try {
            await this.redis.flushdb();
            logger.performance('Cache cleared completely');
            return true;
        } catch (error) {
            logger.error('Cache: Clear operation failed:', error.message);
            return false;
        }
    }

    // Get cache statistics
    async getStats() {
        if (!this.isConnected || !this.redis) {
            return { connected: false };
        }

        try {
            const info = await this.redis.info('memory');
            const keyCount = await this.redis.dbsize();

            return {
                connected: true,
                keyCount,
                memoryUsage: this.parseRedisInfo(info, 'used_memory_human'),
                memoryPeak: this.parseRedisInfo(info, 'used_memory_peak_human')
            };
        } catch (error) {
            logger.error('Cache: Failed to get stats:', error.message);
            return { connected: false, error: error.message };
        }
    }

    // Parse Redis info string
    parseRedisInfo(info, key) {
        const match = info.match(new RegExp(`${key}:(.+)`));
        return match ? match[1].trim() : 'Unknown';
    }
}

// Create cache manager instance
const cacheManager = new CacheManager();

// Middleware factory for API response caching
const createCacheMiddleware = (options = {}) => {
    const {
        ttl = CACHE_CONFIG.defaultTTL,
        keyPrefix = CACHE_CONFIG.keyPrefixes.api,
        tags = [],
        condition = () => true,
        exclude = []
    } = options;

    return async (req, res, next) => {
        // Skip caching for excluded routes or methods
        if (req.method !== 'GET' ||
            exclude.some(pattern => req.path.includes(pattern)) ||
            CACHE_CONFIG.excludeRoutes.some(route => req.path.startsWith(route))) {
            return next();
        }

        // Check condition
        if (!condition(req)) {
            return next();
        }

        try {
            // Generate cache key
            const cacheKey = cacheManager.generateKey(
                keyPrefix,
                req.path,
                req.query
            );

            // Try to get from cache
            const cachedData = await cacheManager.get(cacheKey);
            if (cachedData) {
                res.setHeader('X-Cache', 'HIT');
                res.setHeader('X-Cache-Key', cacheKey);
                return res.json(cachedData);
            }

            // Cache miss - continue to handler
            res.setHeader('X-Cache', 'MISS');
            res.setHeader('X-Cache-Key', cacheKey);

            // Override res.json to cache the response
            const originalJson = res.json;
            res.json = function (data) {
                // Only cache successful responses
                if (res.statusCode === 200 && data) {
                    cacheManager.set(cacheKey, data, ttl, tags).catch(error => {
                        logger.error('Failed to cache response:', { cacheKey, error: error.message });
                    });
                }
                return originalJson.call(this, data);
            };

            next();

        } catch (error) {
            logger.error('Cache middleware error:', error);
            next();
        }
    };
};

// Pre-configured middleware for common use cases
const cacheMiddleware = {
    // API endpoint caching
    api: createCacheMiddleware({
        ttl: CACHE_CONFIG.defaultTTL,
        keyPrefix: CACHE_CONFIG.keyPrefixes.api
    }),

    // Short-term caching for frequently changing data
    short: createCacheMiddleware({
        ttl: CACHE_CONFIG.shortTTL,
        keyPrefix: CACHE_CONFIG.keyPrefixes.api
    }),

    // Long-term caching for static data
    long: createCacheMiddleware({
        ttl: CACHE_CONFIG.longTTL,
        keyPrefix: CACHE_CONFIG.keyPrefixes.api
    }),

    // Projects caching
    projects: createCacheMiddleware({
        ttl: CACHE_CONFIG.strategies['api:projects'].ttl,
        tags: CACHE_CONFIG.strategies['api:projects'].tags,
        keyPrefix: CACHE_CONFIG.keyPrefixes.api
    }),

    // Blog caching
    blog: createCacheMiddleware({
        ttl: CACHE_CONFIG.strategies['api:blog'].ttl,
        tags: CACHE_CONFIG.strategies['api:blog'].tags,
        keyPrefix: CACHE_CONFIG.keyPrefixes.api
    }),

    // Team caching
    team: createCacheMiddleware({
        ttl: CACHE_CONFIG.strategies['api:team'].ttl,
        tags: CACHE_CONFIG.strategies['api:team'].tags,
        keyPrefix: CACHE_CONFIG.keyPrefixes.api
    })
};

// Cache invalidation middleware for POST/PUT/DELETE requests
const cacheInvalidationMiddleware = (tags = []) => {
    return async (req, res, next) => {
        // Only invalidate for modifying operations
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            const originalSend = res.send;

            res.send = function (data) {
                // Invalidate cache after successful operations
                if (res.statusCode >= 200 && res.statusCode < 300 && tags.length > 0) {
                    cacheManager.invalidateByTags(tags).catch(error => {
                        logger.error('Cache invalidation failed:', { tags, error: error.message });
                    });
                }
                return originalSend.call(this, data);
            };
        }

        next();
    };
};

module.exports = {
    cacheManager,
    createCacheMiddleware,
    cacheMiddleware,
    cacheInvalidationMiddleware,
    CACHE_CONFIG
};