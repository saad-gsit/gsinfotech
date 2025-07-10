// server/utils/imageProcessor.js
const sharp = require('sharp');
const path = require('path');
const { promises: fs } = require('fs');
const { existsSync } = require('fs');
const { logger } = require('./logger');

class ImageProcessor {
    constructor() {
        this.supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'tiff', 'avif'];
        this.outputFormats = ['webp', 'jpeg', 'png', 'avif'];
        this.qualitySettings = {
            webp: { quality: 85, effort: 6 },
            jpeg: { quality: 85, progressive: true, mozjpeg: true },
            png: { compressionLevel: 8, progressive: true },
            avif: { quality: 80, effort: 4 }
        };

        this.sizePresets = {
            thumbnail: { width: 150, height: 150, fit: 'cover' },
            small: { width: 400, height: 300, fit: 'inside' },
            medium: { width: 800, height: 600, fit: 'inside' },
            large: { width: 1200, height: 900, fit: 'inside' },
            xlarge: { width: 1920, height: 1080, fit: 'inside' }
        };

        this.baseDir = process.cwd();
        this.uploadsDir = path.join(this.baseDir, 'uploads');

        this.ensureDirectories();
    }

    /**
     * Ensure upload directories exist
     */
    async ensureDirectories() {
        const dirs = [
            'uploads/projects',
            'uploads/team',
            'uploads/blog',
            'uploads/optimized',
            'uploads/temp'
        ];

        for (const dir of dirs) {
            const fullPath = path.join(this.baseDir, dir);
            if (!existsSync(fullPath)) {
                await fs.mkdir(fullPath, { recursive: true });
                logger.info(`Created directory: ${dir}`);
            }
        }
    }

    /**
     * Get image metadata
     */
    async getMetadata(inputPath) {
        try {
            const metadata = await sharp(inputPath).metadata();
            return {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                size: metadata.size,
                hasAlpha: metadata.hasAlpha,
                orientation: metadata.orientation,
                density: metadata.density,
                channels: metadata.channels,
                colorSpace: metadata.space
            };
        } catch (error) {
            logger.error('Failed to get image metadata:', error);
            throw new Error(`Invalid image file: ${error.message}`);
        }
    }

    /**
     * Generate optimized image in specific format
     */
    async optimizeToFormat(inputBuffer, format, options = {}) {
        const {
            quality,
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

            // Apply format-specific optimization
            const formatSettings = this.qualitySettings[format];
            const finalQuality = quality || formatSettings.quality;

            switch (format.toLowerCase()) {
                case 'webp':
                    pipeline = pipeline.webp({
                        quality: finalQuality,
                        effort: formatSettings.effort
                    });
                    break;

                case 'jpeg':
                case 'jpg':
                    pipeline = pipeline.jpeg({
                        quality: finalQuality,
                        progressive: formatSettings.progressive,
                        mozjpeg: formatSettings.mozjpeg
                    });
                    break;

                case 'png':
                    pipeline = pipeline.png({
                        compressionLevel: formatSettings.compressionLevel,
                        progressive: formatSettings.progressive
                    });
                    break;

                case 'avif':
                    pipeline = pipeline.avif({
                        quality: finalQuality,
                        effort: formatSettings.effort
                    });
                    break;

                default:
                    throw new Error(`Unsupported format: ${format}`);
            }

            const outputBuffer = await pipeline.toBuffer();
            const outputMetadata = await sharp(outputBuffer).metadata();

            return {
                buffer: outputBuffer,
                metadata: outputMetadata,
                compressionRatio: ((inputBuffer.length - outputBuffer.length) / inputBuffer.length * 100).toFixed(2)
            };

        } catch (error) {
            logger.error(`Image optimization failed for format ${format}:`, error);
            throw new Error(`Optimization failed: ${error.message}`);
        }
    }

    /**
     * Generate responsive image set
     */
    async generateResponsiveSet(inputBuffer, filename, category = 'optimized') {
        const results = {
            original: inputBuffer.length,
            sizes: {},
            formats: ['webp', 'jpeg'],
            totalSaved: 0
        };

        try {
            const outputDir = path.join(this.uploadsDir, category);
            const baseName = path.parse(filename).name;
            const timestamp = Date.now();

            // Generate for each size preset
            for (const [sizeName, sizeConfig] of Object.entries(this.sizePresets)) {
                results.sizes[sizeName] = {};

                // Generate WebP (primary format)
                const webpResult = await this.optimizeToFormat(inputBuffer, 'webp', sizeConfig);
                const webpFilename = `${baseName}_${sizeName}_${timestamp}.webp`;
                const webpPath = path.join(outputDir, webpFilename);

                await fs.writeFile(webpPath, webpResult.buffer);

                results.sizes[sizeName].webp = {
                    filename: webpFilename,
                    path: webpPath,
                    url: `/uploads/${category}/${webpFilename}`,
                    size: webpResult.buffer.length,
                    width: webpResult.metadata.width,
                    height: webpResult.metadata.height,
                    compressionRatio: webpResult.compressionRatio
                };

                // Generate JPEG (fallback format)
                const jpegResult = await this.optimizeToFormat(inputBuffer, 'jpeg', sizeConfig);
                const jpegFilename = `${baseName}_${sizeName}_${timestamp}.jpg`;
                const jpegPath = path.join(outputDir, jpegFilename);

                await fs.writeFile(jpegPath, jpegResult.buffer);

                results.sizes[sizeName].jpeg = {
                    filename: jpegFilename,
                    path: jpegPath,
                    url: `/uploads/${category}/${jpegFilename}`,
                    size: jpegResult.buffer.length,
                    width: jpegResult.metadata.width,
                    height: jpegResult.metadata.height,
                    compressionRatio: jpegResult.compressionRatio
                };

                results.totalSaved += (inputBuffer.length - webpResult.buffer.length);
                results.totalSaved += (inputBuffer.length - jpegResult.buffer.length);
            }

            // Generate original size in WebP
            const originalWebpResult = await this.optimizeToFormat(inputBuffer, 'webp');
            const originalWebpFilename = `${baseName}_original_${timestamp}.webp`;
            const originalWebpPath = path.join(outputDir, originalWebpFilename);

            await fs.writeFile(originalWebpPath, originalWebpResult.buffer);

            results.original = {
                webp: {
                    filename: originalWebpFilename,
                    path: originalWebpPath,
                    url: `/uploads/${category}/${originalWebpFilename}`,
                    size: originalWebpResult.buffer.length,
                    width: originalWebpResult.metadata.width,
                    height: originalWebpResult.metadata.height,
                    compressionRatio: originalWebpResult.compressionRatio
                }
            };

            logger.info(`Generated responsive images for ${filename}`, {
                category,
                sizes: Object.keys(results.sizes).length,
                totalSaved: `${(results.totalSaved / 1024).toFixed(2)}KB`
            });

            return results;

        } catch (error) {
            logger.error(`Failed to generate responsive set for ${filename}:`, error);
            throw error;
        }
    }

    /**
     * Create image thumbnail
     */
    async createThumbnail(inputBuffer, size = 150, format = 'webp') {
        try {
            const result = await this.optimizeToFormat(inputBuffer, format, {
                width: size,
                height: size,
                fit: 'cover'
            });

            return result;

        } catch (error) {
            logger.error('Thumbnail creation failed:', error);
            throw new Error(`Thumbnail creation failed: ${error.message}`);
        }
    }

    /**
     * Compress image while maintaining quality
     */
    async compressImage(inputBuffer, targetSizeKB = 100, format = 'webp') {
        try {
            let quality = 90;
            let result;
            let attempts = 0;
            const maxAttempts = 10;
            const targetSizeBytes = targetSizeKB * 1024;

            do {
                result = await this.optimizeToFormat(inputBuffer, format, { quality });

                if (result.buffer.length <= targetSizeBytes || quality <= 20) {
                    break;
                }

                quality -= 10;
                attempts++;

            } while (attempts < maxAttempts);

            logger.info('Image compression completed', {
                originalSize: `${(inputBuffer.length / 1024).toFixed(2)}KB`,
                finalSize: `${(result.buffer.length / 1024).toFixed(2)}KB`,
                quality,
                attempts
            });

            return result;

        } catch (error) {
            logger.error('Image compression failed:', error);
            throw new Error(`Compression failed: ${error.message}`);
        }
    }

    /**
     * Convert image to multiple formats
     */
    async convertToFormats(inputBuffer, formats = ['webp', 'jpeg']) {
        const results = {};

        try {
            for (const format of formats) {
                if (!this.outputFormats.includes(format)) {
                    logger.warn(`Skipping unsupported format: ${format}`);
                    continue;
                }

                results[format] = await this.optimizeToFormat(inputBuffer, format);
            }

            return results;

        } catch (error) {
            logger.error('Format conversion failed:', error);
            throw error;
        }
    }

    /**
     * Process uploaded image file
     */
    async processUploadedImage(file, options = {}) {
        const {
            category = 'optimized',
            generateResponsive = true,
            generateThumbnail = true,
            compress = false,
            targetSizeKB = 100
        } = options;

        try {
            // Validate file
            if (!file || !file.data) {
                throw new Error('Invalid file provided');
            }

            const inputBuffer = file.data;
            const originalMetadata = await sharp(inputBuffer).metadata();

            const results = {
                original: {
                    name: file.name,
                    size: file.size,
                    mimetype: file.mimetype,
                    metadata: originalMetadata
                },
                processed: {}
            };

            // Generate responsive images if requested
            if (generateResponsive) {
                results.processed.responsive = await this.generateResponsiveSet(
                    inputBuffer,
                    file.name,
                    category
                );
            }

            // Generate thumbnail if requested
            if (generateThumbnail) {
                results.processed.thumbnail = await this.createThumbnail(inputBuffer);

                // Save thumbnail
                const baseName = path.parse(file.name).name;
                const timestamp = Date.now();
                const thumbnailFilename = `${baseName}_thumb_${timestamp}.webp`;
                const thumbnailPath = path.join(this.uploadsDir, category, thumbnailFilename);

                await fs.writeFile(thumbnailPath, results.processed.thumbnail.buffer);

                results.processed.thumbnail.filename = thumbnailFilename;
                results.processed.thumbnail.path = thumbnailPath;
                results.processed.thumbnail.url = `/uploads/${category}/${thumbnailFilename}`;
            }

            // Compress if requested
            if (compress) {
                results.processed.compressed = await this.compressImage(
                    inputBuffer,
                    targetSizeKB
                );
            }

            logger.info(`Image processing completed for ${file.name}`, {
                category,
                originalSize: `${(file.size / 1024).toFixed(2)}KB`,
                generateResponsive,
                generateThumbnail,
                compress
            });

            return results;

        } catch (error) {
            logger.error(`Image processing failed for ${file?.name}:`, error);
            throw error;
        }
    }

    /**
     * Cleanup old temporary files
     */
    async cleanupTempFiles(olderThanHours = 24) {
        try {
            const tempDir = path.join(this.uploadsDir, 'temp');
            if (!existsSync(tempDir)) return;

            const files = await fs.readdir(tempDir);
            const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
            let deletedCount = 0;

            for (const file of files) {
                const filePath = path.join(tempDir, file);
                const stats = await fs.stat(filePath);

                if (stats.mtime.getTime() < cutoffTime) {
                    await fs.unlink(filePath);
                    deletedCount++;
                }
            }

            logger.info(`Cleaned up ${deletedCount} temporary files older than ${olderThanHours} hours`);
            return deletedCount;

        } catch (error) {
            logger.error('Temp file cleanup failed:', error);
            throw error;
        }
    }

    /**
     * Get storage statistics
     */
    async getStorageStats() {
        try {
            const stats = {
                totalSize: 0,
                categories: {}
            };

            const categories = ['projects', 'team', 'blog', 'optimized', 'temp'];

            for (const category of categories) {
                const categoryPath = path.join(this.uploadsDir, category);
                if (!existsSync(categoryPath)) continue;

                const files = await fs.readdir(categoryPath);
                let categorySize = 0;
                let fileCount = 0;

                for (const file of files) {
                    const filePath = path.join(categoryPath, file);
                    const fileStats = await fs.stat(filePath);
                    if (fileStats.isFile()) {
                        categorySize += fileStats.size;
                        fileCount++;
                    }
                }

                stats.categories[category] = {
                    size: categorySize,
                    sizeFormatted: `${(categorySize / 1024 / 1024).toFixed(2)}MB`,
                    fileCount
                };

                stats.totalSize += categorySize;
            }

            stats.totalSizeFormatted = `${(stats.totalSize / 1024 / 1024).toFixed(2)}MB`;

            return stats;

        } catch (error) {
            logger.error('Failed to get storage stats:', error);
            throw error;
        }
    }
}

// Export singleton instance
module.exports = new ImageProcessor();