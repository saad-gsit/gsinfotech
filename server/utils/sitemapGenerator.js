// server/utils/sitemapGenerator.js
const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream, existsSync, mkdirSync } = require('fs');
const { writeFile } = require('fs').promises;
const path = require('path');
const { logger } = require('./logger');
const { Project, BlogPost, Service, SEOMetadata } = require('../models');
const { Op } = require('sequelize');

class SitemapGenerator {
    constructor() {
        this.siteUrl = process.env.SITE_URL || 'http://localhost:3000';
        this.outputPath = path.join(process.cwd(), 'public');
        this.ensureOutputDirectory();
    }

    /**
     * Ensure output directory exists
     */
    ensureOutputDirectory() {
        if (!existsSync(this.outputPath)) {
            mkdirSync(this.outputPath, { recursive: true });
            logger.info(`Created sitemap output directory: ${this.outputPath}`);
        }
    }

    /**
     * Get static pages configuration
     */
    getStaticPages() {
        return [
            {
                url: '/',
                priority: 1.0,
                changefreq: 'weekly',
                lastmod: new Date()
            },
            {
                url: '/about',
                priority: 0.8,
                changefreq: 'monthly',
                lastmod: new Date()
            },
            {
                url: '/services',
                priority: 0.9,
                changefreq: 'monthly',
                lastmod: new Date()
            },
            {
                url: '/services/custom-software-development',
                priority: 0.8,
                changefreq: 'monthly',
                lastmod: new Date()
            },
            {
                url: '/services/mobile-app-development',
                priority: 0.8,
                changefreq: 'monthly',
                lastmod: new Date()
            },
            {
                url: '/services/web-development',
                priority: 0.8,
                changefreq: 'monthly',
                lastmod: new Date()
            },
            {
                url: '/services/enterprise-solutions',
                priority: 0.8,
                changefreq: 'monthly',
                lastmod: new Date()
            },
            {
                url: '/services/ui-ux-design',
                priority: 0.8,
                changefreq: 'monthly',
                lastmod: new Date()
            },
            {
                url: '/projects',
                priority: 0.9,
                changefreq: 'weekly',
                lastmod: new Date()
            },
            {
                url: '/blog',
                priority: 0.8,
                changefreq: 'daily',
                lastmod: new Date()
            },
            {
                url: '/contact',
                priority: 0.7,
                changefreq: 'monthly',
                lastmod: new Date()
            }
        ];
    }

    /**
     * Get dynamic pages from database
     */
    async getDynamicPages() {
        const pages = [];

        try {
            // Get published projects
            const projects = await Project.findAll({
                where: {
                    status: 'published',
                    slug: { [Op.ne]: null }
                },
                attributes: ['slug', 'updatedAt', 'createdAt'],
                order: [['updatedAt', 'DESC']]
            });

            projects.forEach(project => {
                pages.push({
                    url: `/projects/${project.slug}`,
                    priority: 0.7,
                    changefreq: 'monthly',
                    lastmod: project.updatedAt || project.createdAt
                });
            });

            // Get published blog posts
            const blogPosts = await BlogPost.findAll({
                where: {
                    status: 'published',
                    publishedAt: { [Op.lte]: new Date() },
                    slug: { [Op.ne]: null }
                },
                attributes: ['slug', 'updatedAt', 'publishedAt'],
                order: [['publishedAt', 'DESC']]
            });

            blogPosts.forEach(post => {
                pages.push({
                    url: `/blog/${post.slug}`,
                    priority: 0.6,
                    changefreq: 'monthly',
                    lastmod: post.updatedAt || post.publishedAt
                });
            });

            // Get services if they have individual pages
            const services = await Service.findAll({
                where: {
                    status: 'active',
                    slug: { [Op.ne]: null }
                },
                attributes: ['slug', 'updatedAt', 'createdAt']
            });

            services.forEach(service => {
                pages.push({
                    url: `/services/${service.slug}`,
                    priority: 0.7,
                    changefreq: 'monthly',
                    lastmod: service.updatedAt || service.createdAt
                });
            });

            logger.info('Dynamic pages retrieved for sitemap', {
                projects: projects.length,
                blogPosts: blogPosts.length,
                services: services.length
            });

        } catch (error) {
            logger.error('Error fetching dynamic pages for sitemap:', error);
        }

        return pages;
    }

    /**
     * Generate XML sitemap
     */
    async generateXMLSitemap() {
        try {
            const staticPages = this.getStaticPages();
            const dynamicPages = await this.getDynamicPages();
            const allPages = [...staticPages, ...dynamicPages];

            // Create sitemap stream
            const sitemap = new SitemapStream({
                hostname: this.siteUrl,
                cacheTime: 600000, // 10 minutes
                xmlns: {
                    news: false,
                    xhtml: false,
                    image: false,
                    video: false
                }
            });

            // Add pages to sitemap
            allPages.forEach(page => {
                sitemap.write({
                    url: page.url,
                    lastmod: page.lastmod,
                    priority: page.priority,
                    changefreq: page.changefreq
                });
            });

            sitemap.end();

            // Convert stream to string and save
            const sitemapXML = await streamToPromise(sitemap);
            const sitemapPath = path.join(this.outputPath, 'sitemap.xml');

            await writeFile(sitemapPath, sitemapXML.toString());

            logger.info('XML sitemap generated successfully', {
                totalPages: allPages.length,
                staticPages: staticPages.length,
                dynamicPages: dynamicPages.length,
                outputPath: sitemapPath
            });

            return {
                success: true,
                path: sitemapPath,
                url: `${this.siteUrl}/sitemap.xml`,
                totalPages: allPages.length,
                lastGenerated: new Date().toISOString()
            };

        } catch (error) {
            logger.error('Error generating XML sitemap:', error);
            throw new Error(`Sitemap generation failed: ${error.message}`);
        }
    }

    /**
     * Generate robots.txt file
     */
    async generateRobotsTxt() {
        try {
            const robotsContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${this.siteUrl}/sitemap.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /uploads/temp/

# Allow important pages
Allow: /projects/
Allow: /blog/
Allow: /services/

# Crawl delay (optional)
Crawl-delay: 1`;

            const robotsPath = path.join(this.outputPath, 'robots.txt');
            await writeFile(robotsPath, robotsContent);

            logger.info('Robots.txt generated successfully', { path: robotsPath });

            return {
                success: true,
                path: robotsPath,
                url: `${this.siteUrl}/robots.txt`,
                lastGenerated: new Date().toISOString()
            };

        } catch (error) {
            logger.error('Error generating robots.txt:', error);
            throw new Error(`Robots.txt generation failed: ${error.message}`);
        }
    }

    /**
     * Generate HTML sitemap for users
     */
    async generateHTMLSitemap() {
        try {
            const staticPages = this.getStaticPages();
            const dynamicPages = await this.getDynamicPages();

            // Group pages by type
            const pageGroups = {
                main: staticPages.filter(page => ['/', '/about', '/services', '/projects', '/blog', '/contact'].includes(page.url)),
                services: [
                    ...staticPages.filter(page => page.url.startsWith('/services/') && page.url !== '/services'),
                    ...dynamicPages.filter(page => page.url.startsWith('/services/'))
                ],
                projects: dynamicPages.filter(page => page.url.startsWith('/projects/')),
                blog: dynamicPages.filter(page => page.url.startsWith('/blog/'))
            };

            // Generate HTML content
            const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sitemap | ${process.env.SITE_NAME || 'GS Infotech'}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1, h2 { color: #333; }
        .section { margin-bottom: 30px; }
        .page-list { list-style: none; padding: 0; }
        .page-list li { margin: 8px 0; }
        .page-list a { text-decoration: none; color: #0066cc; padding: 5px 0; display: block; }
        .page-list a:hover { text-decoration: underline; }
        .page-count { color: #666; font-size: 0.9em; }
        .last-updated { color: #666; font-size: 0.8em; margin-top: 20px; }
    </style>
</head>
<body>
    <h1>Sitemap</h1>
    <p>Find all the pages on our website organized by category.</p>

    <div class="section">
        <h2>Main Pages <span class="page-count">(${pageGroups.main.length})</span></h2>
        <ul class="page-list">
            ${pageGroups.main.map(page => `<li><a href="${page.url}">${this.getPageTitle(page.url)}</a></li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>Services <span class="page-count">(${pageGroups.services.length})</span></h2>
        <ul class="page-list">
            ${pageGroups.services.map(page => `<li><a href="${page.url}">${this.getPageTitle(page.url)}</a></li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>Projects <span class="page-count">(${pageGroups.projects.length})</span></h2>
        <ul class="page-list">
            ${pageGroups.projects.map(page => `<li><a href="${page.url}">${this.getPageTitle(page.url)}</a></li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>Blog Posts <span class="page-count">(${pageGroups.blog.length})</span></h2>
        <ul class="page-list">
            ${pageGroups.blog.map(page => `<li><a href="${page.url}">${this.getPageTitle(page.url)}</a></li>`).join('')}
        </ul>
    </div>

    <div class="last-updated">
        Last updated: ${new Date().toLocaleDateString()}
    </div>
</body>
</html>`;

            const htmlPath = path.join(this.outputPath, 'sitemap.html');
            await writeFile(htmlPath, htmlContent);

            logger.info('HTML sitemap generated successfully', {
                path: htmlPath,
                totalPages: staticPages.length + dynamicPages.length
            });

            return {
                success: true,
                path: htmlPath,
                url: `${this.siteUrl}/sitemap.html`,
                totalPages: staticPages.length + dynamicPages.length,
                lastGenerated: new Date().toISOString()
            };

        } catch (error) {
            logger.error('Error generating HTML sitemap:', error);
            throw new Error(`HTML sitemap generation failed: ${error.message}`);
        }
    }

    /**
     * Get human-readable page title from URL
     */
    getPageTitle(url) {
        const titles = {
            '/': 'Home',
            '/about': 'About Us',
            '/services': 'Services',
            '/services/custom-software-development': 'Custom Software Development',
            '/services/mobile-app-development': 'Mobile App Development',
            '/services/web-development': 'Web Development',
            '/services/enterprise-solutions': 'Enterprise Solutions',
            '/services/ui-ux-design': 'UI/UX Design',
            '/projects': 'Projects',
            '/blog': 'Blog',
            '/contact': 'Contact Us'
        };

        if (titles[url]) {
            return titles[url];
        }

        // Generate title from URL for dynamic pages
        const pathParts = url.split('/').filter(part => part);
        const lastPart = pathParts[pathParts.length - 1];

        return lastPart
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Generate all sitemap files
     */
    async generateAll() {
        try {
            const results = {};

            // Generate XML sitemap
            results.xml = await this.generateXMLSitemap();

            // Generate robots.txt
            results.robots = await this.generateRobotsTxt();

            // Generate HTML sitemap
            results.html = await this.generateHTMLSitemap();

            logger.info('All sitemaps generated successfully', results);

            return {
                success: true,
                results,
                lastGenerated: new Date().toISOString()
            };

        } catch (error) {
            logger.error('Error generating sitemaps:', error);
            throw error;
        }
    }

    /**
     * Get sitemap statistics
     */
    async getSitemapStats() {
        try {
            const staticPages = this.getStaticPages();
            const dynamicPages = await this.getDynamicPages();

            const stats = {
                totalPages: staticPages.length + dynamicPages.length,
                staticPages: staticPages.length,
                dynamicPages: dynamicPages.length,
                breakdown: {
                    projects: dynamicPages.filter(page => page.url.startsWith('/projects/')).length,
                    blog: dynamicPages.filter(page => page.url.startsWith('/blog/')).length,
                    services: dynamicPages.filter(page => page.url.startsWith('/services/')).length
                },
                lastUpdate: new Date().toISOString()
            };

            return stats;

        } catch (error) {
            logger.error('Error getting sitemap stats:', error);
            throw error;
        }
    }
}

// Export singleton instance
module.exports = new SitemapGenerator();