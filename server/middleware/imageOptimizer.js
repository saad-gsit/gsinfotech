// Complete replacement for server/middleware/imageOptimizer.js
// This integrates your existing logic with the new imageProcessor utility

const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { existsSync } = require('fs');
const sizeOf = require('image-size');
const { logger } = require('../utils/logger');
const imageProcessor = require('../utils/imageProcessor'); // Import new utility

// Image optimization configuration (enhanced from your existing)
const OPTIMIZATION_CONFIG = {
    // Supported input formats
    supportedFormats: ['jpeg', 'jpg', 'png', 'webp', 'tiff', 'avif'],

    // Output formats with quality settings
    outputs: {
        webp: { quality: 85, effort: 6 },
        jpeg: { quality: 85, progressive: true, mozjpeg: true },
        png: { compressionLevel: 8, progressive: true },
        avif: { quality: 80, effort: 4 }
    },

    // Size presets for responsive images
    sizePresets: {
        thumbnail: { width: 150, height: 150, fit: 'cover' },
        small: { width: 400, height: 300, fit: 'inside' },
        medium: { width: 800, height: 600, fit: 'inside' },
        large: { width: 1200, height: 900, fit: 'inside' },
        xlarge: { width: 1920, height: 1080, fit: 'inside' },
        original: null // Keep original size
    },

    // Maximum file size (from env or default 5MB)
    maxFileSize: parseInt(process.env.MAX_FILE_UPLOAD) || 5000000,

    // Output directories
    outputDirs: {
        projects: 'uploads/projects',
        team: 'uploads/team',
        blog: 'uploads/blog',
        optimized: 'uploads/optimized',
        temp: 'uploads/temp'
    }
};

class ImageOptimizer {
    constructor() {
        this.config = OPTIMIZATION_CONFIG;
        this.ensureDirectories();
    }

    // Ensure all upload directories exist (your existing logic)
    async ensureDirectories() {
        try {
            for (const [key, dir] of Object.entries(this.config.outputDirs)) {
                const fullPath = path.join(process.cwd(), dir);
                if (!existsSync(fullPath)) {
                    await fs.mkdir(fullPath, { recursive: true });
                    logger.info(`Created upload directory: ${dir}`);
                }
            }
        } catch (error) {
            logger.error('Failed to create upload directories:', error);
        }
    }

    // Validate image file (your existing logic)
    validateImage(file) {
        const errors = [];

        if (!file) {
            errors.push('No file provided');
            return errors;
        }

        // Check file size
        if (file.size > this.config.maxFileSize) {
            errors.push(`File size exceeds ${this.config.maxFileSize / (1024 * 1024)}MB limit`);
        }

        // Check MIME type
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/tiff',
            'image/avif'
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            errors.push(`Unsupported file type: ${file.mimetype}`);
        }

        // Check file extension
        const ext = path.extname(file.originalname).toLowerCase().slice(1);
        if (!this.config.supportedFormats.includes(ext)) {
            errors.push(`Unsupported file format: ${ext}`);
        }

        return errors;
    }

    // Generate unique filename (your existing logic)
    generateFilename(originalName, size = '', format = '', suffix = '') {
        const name = path.parse(originalName).name
            .replace(/[^a-zA-Z0-9-_]/g, '_')
            .toLowerCase();
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const sizeStr = size ? `_${size}` : '';
        const formatStr = format ? `.${format}` : path.extname(originalName);
        const suffixStr = suffix ? `_${suffix}` : '';

        return `${name}${sizeStr}${suffixStr}_${timestamp}_${randomStr}${formatStr}`;
    }

    // Get image metadata (enhanced with utility)
    async getImageMetadata(buffer) {
        try {
            // Use both your existing logic and new utility
            const metadata = await sharp(buffer).metadata();
            const stats = sizeOf(buffer);

            return {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                size: metadata.size,
                hasAlpha: metadata.hasAlpha,
                orientation: metadata.orientation,
                density: metadata.density,
                colorSpace: stats.type
            };
        } catch (error) {
            logger.error('Failed to get image metadata:', error);
            throw new Error('Invalid image file');
        }
    }

    // Enhanced optimize image using new utility
    async optimizeImage(inputBuffer, options = {}) {
        try {
            // Use the new image processor utility for optimization
            const result = await imageProcessor.optimizeToFormat(inputBuffer, options.format || 'webp', options);
            return result;
        } catch (error) {
            logger.error('Image optimization failed:', error);
            throw new Error(`Image optimization failed: ${error.message}`);
        }
    }

    // Enhanced responsive image generation
    async generateResponsiveImages(inputBuffer, originalName, category = 'optimized') {
        try {
            // Use new utility for responsive generation
            const responsiveResult = await imageProcessor.generateResponsiveSet(inputBuffer, originalName, category);

            // Convert to your existing format for compatibility
            const results = [];

            // Process each size
            for (const [sizeName, sizeData] of Object.entries(responsiveResult.sizes)) {
                // WebP version
                if (sizeData.webp) {
                    results.push({
                        size: sizeName,
                        format: 'webp',
                        filename: path.basename(sizeData.webp.path),
                        path: sizeData.webp.path,
                        url: sizeData.webp.url,
                        width: sizeData.webp.width,
                        height: sizeData.webp.height,
                        fileSize: sizeData.webp.size,
                        compressionRatio: sizeData.webp.compressionRatio
                    });
                }

                // JPEG version
                if (sizeData.jpeg) {
                    results.push({
                        size: sizeName,
                        format: 'jpeg',
                        filename: path.basename(sizeData.jpeg.path),
                        path: sizeData.jpeg.path,
                        url: sizeData.jpeg.url,
                        width: sizeData.jpeg.width,
                        height: sizeData.jpeg.height,
                        fileSize: sizeData.jpeg.size,
                        compressionRatio: sizeData.jpeg.compressionRatio
                    });
                }
            }

            // Add original if exists
            if (responsiveResult.original && responsiveResult.original.webp) {
                results.push({
                    size: 'original',
                    format: 'webp',
                    filename: path.basename(responsiveResult.original.webp.path),
                    path: responsiveResult.original.webp.path,
                    url: responsiveResult.original.webp.url,
                    width: responsiveResult.original.webp.width,
                    height: responsiveResult.original.webp.height,
                    fileSize: responsiveResult.original.webp.size,
                    compressionRatio: responsiveResult.original.webp.compressionRatio,
                    isOriginal: true
                });
            }

            logger.info(`Generated ${results.length} responsive images for ${originalName}`);
            return results;

        } catch (error) {
            logger.error(`Failed to generate responsive images for ${originalName}:`, error);
            throw error;
        }
    }

    // Enhanced processing with utility integration
    async processUploadedImage(file, options = {}) {
        try {
            // Use new utility for complete processing
            const result = await imageProcessor.processUploadedImage(file, options);

            // Convert format for compatibility with existing code
            const processedResult = {
                originalFile: {
                    name: file.name,
                    size: file.size,
                    mimetype: file.mimetype
                },
                metadata: result.original.metadata,
                processed: {}
            };

            // Convert responsive images
            if (result.processed.responsive) {
                processedResult.processed.responsiveImages = [];

                for (const [sizeName, sizeData] of Object.entries(result.processed.responsive.sizes)) {
                    if (sizeData.webp) {
                        processedResult.processed.responsiveImages.push({
                            size: sizeName,
                            format: 'webp',
                            filename: path.basename(sizeData.webp.path),
                            url: sizeData.webp.url,
                            width: sizeData.webp.width,
                            height: sizeData.webp.height,
                            fileSize: sizeData.webp.size
                        });
                    }
                    if (sizeData.jpeg) {
                        processedResult.processed.responsiveImages.push({
                            size: sizeName,
                            format: 'jpeg',
                            filename: path.basename(sizeData.jpeg.path),
                            url: sizeData.jpeg.url,
                            width: sizeData.jpeg.width,
                            height: sizeData.jpeg.height,
                            fileSize: sizeData.jpeg.size
                        });
                    }
                }
            }

            // Add thumbnail info
            if (result.processed.thumbnail) {
                processedResult.processed.thumbnail = {
                    filename: result.processed.thumbnail.filename,
                    url: result.processed.thumbnail.url,
                    width: result.processed.thumbnail.metadata.width,
                    height: result.processed.thumbnail.metadata.height,
                    size: result.processed.thumbnail.buffer.length
                };
            }

            return processedResult;

        } catch (error) {
            logger.error('Enhanced image processing failed:', error);
            throw error;
        }
    }
}

// Enhanced middleware factory with utility integration
const createImageOptimizerMiddleware = (category = 'optimized', options = {}) => {
    const optimizer = new ImageOptimizer();

    const {
        generateResponsive = true,
        generateThumbnail = true,
        compress = false,
        targetSizeKB = 100,
        requireImages = false,
        maxFiles = 10
    } = options;

    return async (req, res, next) => {
        try {
            // Skip if no files uploaded
            if (!req.files || Object.keys(req.files).length === 0) {
                if (requireImages) {
                    return res.status(400).json({
                        error: 'Images are required',
                        message: 'Please upload at least one image file'
                    });
                }
                return next();
            }

            const processedFiles = {};

            // Process each uploaded file field
            for (const [fieldName, file] of Object.entries(req.files)) {
                const fileArray = Array.isArray(file) ? file : [file];

                // Check file count limit
                if (fileArray.length > maxFiles) {
                    return res.status(400).json({
                        error: 'Too many files',
                        message: `Maximum ${maxFiles} files allowed per field`
                    });
                }

                processedFiles[fieldName] = [];

                for (const singleFile of fileArray) {
                    // Validate image using existing validation
                    const validationErrors = optimizer.validateImage(singleFile);
                    if (validationErrors.length > 0) {
                        return res.status(400).json({
                            error: 'Image validation failed',
                            details: validationErrors,
                            file: singleFile.name
                        });
                    }

                    try {
                        // Enhanced processing using utility
                        const processingOptions = {
                            category,
                            generateResponsive,
                            generateThumbnail,
                            compress,
                            targetSizeKB
                        };

                        const result = await optimizer.processUploadedImage(singleFile, processingOptions);

                        processedFiles[fieldName].push({
                            originalName: singleFile.name,
                            originalSize: singleFile.size,
                            mimetype: singleFile.mimetype,
                            ...result
                        });

                        logger.info(`Successfully processed image: ${singleFile.name}`, {
                            category,
                            responsiveCount: result.processed.responsiveImages?.length || 0,
                            originalSize: singleFile.size,
                            hasThumbnail: !!result.processed.thumbnail
                        });

                    } catch (error) {
                        logger.error(`Failed to process image ${singleFile.name}:`, error);
                        return res.status(500).json({
                            error: 'Image processing failed',
                            message: error.message,
                            file: singleFile.name
                        });
                    }
                }
            }

            // Attach processed files to request
            req.processedImages = processedFiles;

            // Add helper methods to request object
            req.getImageUrl = (fieldName, size = 'medium', format = 'webp') => {
                const processed = processedFiles[fieldName]?.[0]?.processed?.responsiveImages;
                if (!processed) return null;

                const image = processed.find(img => img.size === size && img.format === format);
                return image?.url || null;
            };

            req.getThumbnailUrl = (fieldName) => {
                const processed = processedFiles[fieldName]?.[0]?.processed;
                return processed?.thumbnail?.url || null;
            };

            req.getAllImageSizes = (fieldName, format = 'webp') => {
                const processed = processedFiles[fieldName]?.[0]?.processed?.responsiveImages;
                if (!processed) return [];

                return processed
                    .filter(img => img.format === format)
                    .map(img => ({
                        size: img.size,
                        url: img.url,
                        width: img.width,
                        height: img.height
                    }));
            };

            req.getImageMetadata = (fieldName) => {
                return processedFiles[fieldName]?.[0]?.metadata || null;
            };

            next();

        } catch (error) {
            logger.error('Image optimizer middleware error:', error);
            res.status(500).json({
                error: 'Image processing failed',
                message: error.message
            });
        }
    };
};

// Pre-configured middleware for different use cases (enhanced)
const optimizeProjectImages = createImageOptimizerMiddleware('projects', {
    generateResponsive: true,
    generateThumbnail: true,
    compress: true,
    targetSizeKB: 150,
    maxFiles: 5
});

const optimizeTeamImages = createImageOptimizerMiddleware('team', {
    generateResponsive: true,
    generateThumbnail: true,
    compress: true,
    targetSizeKB: 100,
    maxFiles: 1
});

const optimizeBlogImages = createImageOptimizerMiddleware('blog', {
    generateResponsive: true,
    generateThumbnail: true,
    compress: false, // Keep high quality for blog images
    maxFiles: 10
});

const optimizeGeneralImages = createImageOptimizerMiddleware('optimized', {
    generateResponsive: true,
    generateThumbnail: true,
    compress: true,
    targetSizeKB: 120,
    maxFiles: 5
});

// Storage statistics middleware
const getStorageStats = async (req, res, next) => {
    if (req.path === '/api/storage/stats' || req.path === '/api/images/stats') {
        try {
            const stats = await imageProcessor.getStorageStats();
            return res.json({
                success: true,
                stats,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Failed to get storage stats:', error);
            return res.status(500).json({
                error: 'Failed to get storage statistics',
                message: error.message
            });
        }
    }
    next();
};

// Image cleanup middleware
const cleanupTempImages = async (req, res, next) => {
    if (req.path === '/api/images/cleanup') {
        try {
            const { hours = 24 } = req.query;
            const deletedCount = await imageProcessor.cleanupTempFiles(parseInt(hours));

            return res.json({
                success: true,
                message: `Cleaned up ${deletedCount} temporary files`,
                deletedCount,
                olderThanHours: parseInt(hours)
            });
        } catch (error) {
            logger.error('Failed to cleanup temp images:', error);
            return res.status(500).json({
                error: 'Cleanup failed',
                message: error.message
            });
        }
    }
    next();
};

// Image compression endpoint
const compressImages = async (req, res, next) => {
    if (req.path === '/api/images/compress' && req.method === 'POST') {
        try {
            if (!req.files || !req.files.image) {
                return res.status(400).json({
                    error: 'No image file provided',
                    message: 'Please upload an image file'
                });
            }

            const { targetSizeKB = 100, format = 'webp' } = req.body;
            const file = req.files.image;

            const result = await imageProcessor.compressImage(
                file.data,
                parseInt(targetSizeKB),
                format
            );

            // Save compressed image
            const filename = `compressed_${Date.now()}.${format}`;
            const outputPath = path.join(process.cwd(), 'uploads', 'temp', filename);
            await fs.writeFile(outputPath, result.buffer);

            return res.json({
                success: true,
                originalSize: `${(file.size / 1024).toFixed(2)}KB`,
                compressedSize: `${(result.buffer.length / 1024).toFixed(2)}KB`,
                compressionRatio: result.compressionRatio,
                downloadUrl: `/uploads/temp/${filename}`,
                metadata: result.metadata
            });

        } catch (error) {
            logger.error('Image compression failed:', error);
            return res.status(500).json({
                error: 'Compression failed',
                message: error.message
            });
        }
    }
    next();
};

// Image format conversion endpoint
const convertImageFormat = async (req, res, next) => {
    if (req.path === '/api/images/convert' && req.method === 'POST') {
        try {
            if (!req.files || !req.files.image) {
                return res.status(400).json({
                    error: 'No image file provided'
                });
            }

            const { formats = ['webp', 'jpeg'] } = req.body;
            const file = req.files.image;

            const results = await imageProcessor.convertToFormats(file.data, formats);
            const convertedImages = [];

            // Save each converted format
            for (const [format, result] of Object.entries(results)) {
                const filename = `converted_${Date.now()}.${format}`;
                const outputPath = path.join(process.cwd(), 'uploads', 'temp', filename);
                await fs.writeFile(outputPath, result.buffer);

                convertedImages.push({
                    format,
                    filename,
                    downloadUrl: `/uploads/temp/${filename}`,
                    size: `${(result.buffer.length / 1024).toFixed(2)}KB`,
                    compressionRatio: result.compressionRatio,
                    metadata: result.metadata
                });
            }

            return res.json({
                success: true,
                originalFile: {
                    name: file.name,
                    size: `${(file.size / 1024).toFixed(2)}KB`,
                    format: file.mimetype
                },
                convertedImages
            });

        } catch (error) {
            logger.error('Image format conversion failed:', error);
            return res.status(500).json({
                error: 'Format conversion failed',
                message: error.message
            });
        }
    }
    next();
};

// Auto cleanup middleware (runs periodically)
const autoCleanup = () => {
    // Clean temp files every 6 hours
    setInterval(async () => {
        try {
            const deletedCount = await imageProcessor.cleanupTempFiles(6);
            if (deletedCount > 0) {
                logger.info(`Auto cleanup: removed ${deletedCount} temporary files`);
            }
        } catch (error) {
            logger.error('Auto cleanup failed:', error);
        }
    }, 6 * 60 * 60 * 1000); // 6 hours

    logger.info('Auto cleanup scheduler started');
};

// Start auto cleanup when module loads
autoCleanup();

// Export everything for backward compatibility and new features
module.exports = {
    // Legacy exports (maintain compatibility)
    ImageOptimizer,
    createImageOptimizerMiddleware,
    optimizeProjectImages,
    optimizeTeamImages,
    optimizeBlogImages,
    optimizeGeneralImages,

    // New enhanced middleware
    getStorageStats,
    cleanupTempImages,
    compressImages,
    convertImageFormat,

    // Direct access to utilities
    imageProcessor,

    // Configuration
    OPTIMIZATION_CONFIG
};