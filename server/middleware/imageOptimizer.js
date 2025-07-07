// server/middleware/imageOptimizer.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { existsSync } = require('fs');
const sizeOf = require('image-size');
const { logger } = require('../utils/logger');

// Image optimization configuration
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

    // Ensure all upload directories exist
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

    // Validate image file
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

    // Generate unique filename
    generateFilename(originalName, size = '', format = '', suffix = '') {
        const name = path.parse(originalName).name
            .replace(/[^a-zA-Z0-9-_]/g, '_') // Replace special chars
            .toLowerCase();
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const sizeStr = size ? `_${size}` : '';
        const formatStr = format ? `.${format}` : path.extname(originalName);
        const suffixStr = suffix ? `_${suffix}` : '';

        return `${name}${sizeStr}${suffixStr}_${timestamp}_${randomStr}${formatStr}`;
    }

    // Get image metadata
    async getImageMetadata(buffer) {
        try {
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

    // Optimize single image
    async optimizeImage(inputBuffer, options = {}) {
        const {
            format = 'webp',
            quality = 85,
            width,
            height,
            fit = 'inside',
            background = { r: 255, g: 255, b: 255, alpha: 1 }
        } = options;

        try {
            let pipeline = sharp(inputBuffer);

            // Resize if dimensions provided
            if (width || height) {
                pipeline = pipeline.resize({
                    width,
                    height,
                    fit,
                    background,
                    withoutEnlargement: true
                });
            }

            // Apply format-specific optimizations
            switch (format.toLowerCase()) {
                case 'webp':
                    pipeline = pipeline.webp({
                        quality: this.config.outputs.webp.quality,
                        effort: this.config.outputs.webp.effort
                    });
                    break;

                case 'jpeg':
                case 'jpg':
                    pipeline = pipeline.jpeg({
                        quality: this.config.outputs.jpeg.quality,
                        progressive: this.config.outputs.jpeg.progressive,
                        mozjpeg: this.config.outputs.jpeg.mozjpeg
                    });
                    break;

                case 'png':
                    pipeline = pipeline.png({
                        compressionLevel: this.config.outputs.png.compressionLevel,
                        progressive: this.config.outputs.png.progressive
                    });
                    break;

                case 'avif':
                    pipeline = pipeline.avif({
                        quality: this.config.outputs.avif.quality,
                        effort: this.config.outputs.avif.effort
                    });
                    break;

                default:
                    throw new Error(`Unsupported output format: ${format}`);
            }

            const optimizedBuffer = await pipeline.toBuffer();
            const metadata = await this.getImageMetadata(optimizedBuffer);

            return {
                buffer: optimizedBuffer,
                metadata,
                originalSize: inputBuffer.length,
                optimizedSize: optimizedBuffer.length,
                compressionRatio: ((inputBuffer.length - optimizedBuffer.length) / inputBuffer.length * 100).toFixed(2)
            };
        } catch (error) {
            logger.error('Image optimization failed:', error);
            throw new Error(`Image optimization failed: ${error.message}`);
        }
    }

    // Generate multiple responsive versions
    async generateResponsiveImages(inputBuffer, originalName, category = 'optimized') {
        const results = [];
        const outputDir = this.config.outputDirs[category] || this.config.outputDirs.optimized;

        try {
            // Generate different sizes and formats
            for (const [sizeName, sizeConfig] of Object.entries(this.config.sizePresets)) {
                if (sizeName === 'original') continue;

                // Generate WebP version
                const webpResult = await this.optimizeImage(inputBuffer, {
                    format: 'webp',
                    ...sizeConfig
                });

                const webpFilename = this.generateFilename(originalName, sizeName, 'webp');
                const webpPath = path.join(outputDir, webpFilename);
                await fs.writeFile(webpPath, webpResult.buffer);

                results.push({
                    size: sizeName,
                    format: 'webp',
                    filename: webpFilename,
                    path: webpPath,
                    url: `/${outputDir}/${webpFilename}`,
                    width: webpResult.metadata.width,
                    height: webpResult.metadata.height,
                    fileSize: webpResult.optimizedSize,
                    compressionRatio: webpResult.compressionRatio
                });

                // Generate JPEG fallback for compatibility
                const jpegResult = await this.optimizeImage(inputBuffer, {
                    format: 'jpeg',
                    ...sizeConfig
                });

                const jpegFilename = this.generateFilename(originalName, sizeName, 'jpg');
                const jpegPath = path.join(outputDir, jpegFilename);
                await fs.writeFile(jpegPath, jpegResult.buffer);

                results.push({
                    size: sizeName,
                    format: 'jpeg',
                    filename: jpegFilename,
                    path: jpegPath,
                    url: `/${outputDir}/${jpegFilename}`,
                    width: jpegResult.metadata.width,
                    height: jpegResult.metadata.height,
                    fileSize: jpegResult.optimizedSize,
                    compressionRatio: jpegResult.compressionRatio
                });
            }

            // Save original in WebP format
            const originalResult = await this.optimizeImage(inputBuffer, { format: 'webp' });
            const originalFilename = this.generateFilename(originalName, 'original', 'webp');
            const originalPath = path.join(outputDir, originalFilename);
            await fs.writeFile(originalPath, originalResult.buffer);

            results.push({
                size: 'original',
                format: 'webp',
                filename: originalFilename,
                path: originalPath,
                url: `/${outputDir}/${originalFilename}`,
                width: originalResult.metadata.width,
                height: originalResult.metadata.height,
                fileSize: originalResult.optimizedSize,
                compressionRatio: originalResult.compressionRatio,
                isOriginal: true
            });

            logger.info(`Generated ${results.length} responsive images for ${originalName}`);
            return results;

        } catch (error) {
            logger.error(`Failed to generate responsive images for ${originalName}:`, error);
            throw error;
        }
    }
}

// Middleware factory for different use cases
const createImageOptimizerMiddleware = (category = 'optimized', options = {}) => {
    const optimizer = new ImageOptimizer();

    return async (req, res, next) => {
        try {
            // Skip if no files uploaded
            if (!req.files || Object.keys(req.files).length === 0) {
                return next();
            }

            const processedFiles = {};

            // Process each uploaded file
            for (const [fieldName, file] of Object.entries(req.files)) {
                const fileArray = Array.isArray(file) ? file : [file];

                processedFiles[fieldName] = [];

                for (const singleFile of fileArray) {
                    // Validate image
                    const validationErrors = optimizer.validateImage(singleFile);
                    if (validationErrors.length > 0) {
                        return res.status(400).json({
                            error: 'Image validation failed',
                            details: validationErrors
                        });
                    }

                    try {
                        // Generate responsive images
                        const responsiveImages = await optimizer.generateResponsiveImages(
                            singleFile.data,
                            singleFile.name,
                            category
                        );

                        processedFiles[fieldName].push({
                            originalName: singleFile.name,
                            originalSize: singleFile.size,
                            mimetype: singleFile.mimetype,
                            responsiveImages,
                            metadata: await optimizer.getImageMetadata(singleFile.data)
                        });

                        logger.info(`Successfully processed image: ${singleFile.name}`, {
                            category,
                            responsiveCount: responsiveImages.length,
                            originalSize: singleFile.size
                        });

                    } catch (error) {
                        logger.error(`Failed to process image ${singleFile.name}:`, error);
                        return res.status(500).json({
                            error: 'Image processing failed',
                            message: error.message
                        });
                    }
                }
            }

            // Attach processed files to request
            req.processedImages = processedFiles;
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

// Export middleware factory and optimizer class
module.exports = {
    ImageOptimizer,
    createImageOptimizerMiddleware,

    // Pre-configured middleware for common use cases
    optimizeProjectImages: createImageOptimizerMiddleware('projects'),
    optimizeTeamImages: createImageOptimizerMiddleware('team'),
    optimizeBlogImages: createImageOptimizerMiddleware('blog'),
    optimizeGeneralImages: createImageOptimizerMiddleware('optimized')
};