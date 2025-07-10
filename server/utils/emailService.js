// server/utils/emailService.js
const nodemailer = require('nodemailer');
const { logger } = require('./logger');
const path = require('path');
const fs = require('fs').promises;

class EmailService {
    constructor() {
        this.transporter = null;
        this.templates = new Map();
        this.isConfigured = false;

        this.initialize();
    }

    /**
     * Initialize email service
     */
    async initialize() {
        try {
            // Create transporter
            this.transporter = nodemailer.createTransporter({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: process.env.SMTP_PORT || 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_EMAIL,
                    pass: process.env.SMTP_PASSWORD
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // Verify connection if credentials are provided
            if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
                await this.verifyConnection();
                this.isConfigured = true;
            } else {
                logger.warn('Email service not configured - missing SMTP credentials');
            }

            // Load email templates
            await this.loadTemplates();

        } catch (error) {
            logger.error('Failed to initialize email service:', error);
        }
    }

    /**
     * Verify SMTP connection
     */
    async verifyConnection() {
        try {
            await this.transporter.verify();
            logger.info('Email service connected successfully');
            return true;
        } catch (error) {
            logger.error('Email service connection failed:', error);
            return false;
        }
    }

    /**
     * Load email templates
     */
    async loadTemplates() {
        try {
            // Define built-in templates
            const templates = {
                contact: this.getContactTemplate(),
                autoReply: this.getAutoReplyTemplate(),
                newsletter: this.getNewsletterTemplate(),
                projectInquiry: this.getProjectInquiryTemplate(),
                welcome: this.getWelcomeTemplate(),
                notification: this.getNotificationTemplate()
            };

            // Store templates
            for (const [name, template] of Object.entries(templates)) {
                this.templates.set(name, template);
            }

            logger.info(`Loaded ${this.templates.size} email templates`);

        } catch (error) {
            logger.error('Failed to load email templates:', error);
        }
    }

    /**
     * Get contact form template
     */
    getContactTemplate() {
        return {
            subject: 'New Contact Form Submission - {{siteName}}',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Contact Form Submission</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { background: #0066cc; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { padding: 30px; }
                    .field { margin-bottom: 20px; }
                    .label { font-weight: bold; color: #333; margin-bottom: 5px; }
                    .value { background: #f9f9f9; padding: 15px; border-radius: 4px; border-left: 4px solid #0066cc; }
                    .footer { background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; color: #666; }
                    .timestamp { color: #888; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>New Contact Form Submission</h1>
                        <p class="timestamp">Received: {{timestamp}}</p>
                    </div>
                    
                    <div class="content">
                        <div class="field">
                            <div class="label">Name:</div>
                            <div class="value">{{name}}</div>
                        </div>
                        
                        <div class="field">
                            <div class="label">Email:</div>
                            <div class="value">{{email}}</div>
                        </div>
                        
                        <div class="field">
                            <div class="label">Phone:</div>
                            <div class="value">{{phone}}</div>
                        </div>
                        
                        <div class="field">
                            <div class="label">Service Interest:</div>
                            <div class="value">{{service}}</div>
                        </div>
                        
                        <div class="field">
                            <div class="label">Budget Range:</div>
                            <div class="value">{{budget}}</div>
                        </div>
                        
                        <div class="field">
                            <div class="label">Timeline:</div>
                            <div class="value">{{timeline}}</div>
                        </div>
                        
                        <div class="field">
                            <div class="label">Message:</div>
                            <div class="value">{{message}}</div>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>This message was sent from the contact form on {{siteName}}</p>
                        <p>Respond to: <a href="mailto:{{email}}">{{email}}</a></p>
                    </div>
                </div>
            </body>
            </html>`,
            text: `
            New Contact Form Submission - {{siteName}}
            
            Name: {{name}}
            Email: {{email}}
            Phone: {{phone}}
            Service Interest: {{service}}
            Budget Range: {{budget}}
            Timeline: {{timeline}}
            
            Message:
            {{message}}
            
            Received: {{timestamp}}
            `
        };
    }

    /**
     * Get auto-reply template
     */
    getAutoReplyTemplate() {
        return {
            subject: 'Thank you for contacting {{siteName}}',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Thank You</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #0066cc, #004499); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
                    .content { padding: 30px; line-height: 1.6; }
                    .highlight { background: #f0f8ff; padding: 15px; border-radius: 4px; border-left: 4px solid #0066cc; margin: 20px 0; }
                    .footer { background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; color: #666; }
                    .button { display: inline-block; background: #0066cc; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Thank You, {{name}}!</h1>
                        <p>We've received your inquiry</p>
                    </div>
                    
                    <div class="content">
                        <p>Dear {{name}},</p>
                        
                        <p>Thank you for reaching out to {{siteName}}! We're excited about the possibility of working with you on your project.</p>
                        
                        <div class="highlight">
                            <strong>What happens next?</strong><br>
                            • Our team will review your requirements<br>
                            • We'll prepare a customized proposal<br>
                            • You'll hear back from us within 24-48 hours
                        </div>
                        
                        <p>In the meantime, feel free to explore our recent projects and case studies:</p>
                        
                        <a href="{{siteUrl}}/projects" class="button">View Our Portfolio</a>
                        
                        <p>If you have any urgent questions, please don't hesitate to call us at {{phone}} or reply to this email.</p>
                        
                        <p>Best regards,<br>
                        The {{siteName}} Team</p>
                    </div>
                    
                    <div class="footer">
                        <p>{{siteName}} | {{email}} | {{phone}}</p>
                        <p>{{address}}</p>
                    </div>
                </div>
            </body>
            </html>`,
            text: `
            Thank You, {{name}}!
            
            Dear {{name}},
            
            Thank you for reaching out to {{siteName}}! We're excited about the possibility of working with you on your project.
            
            What happens next?
            • Our team will review your requirements
            • We'll prepare a customized proposal  
            • You'll hear back from us within 24-48 hours
            
            If you have any urgent questions, please call us at {{phone}} or reply to this email.
            
            Best regards,
            The {{siteName}} Team
            
            {{siteName}} | {{email}} | {{phone}}
            `
        };
    }

    /**
     * Get project inquiry template
     */
    getProjectInquiryTemplate() {
        return {
            subject: 'Project Inquiry: {{projectType}} - {{clientName}}',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; }
                    .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { padding: 30px; }
                    .project-details { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 15px 0; }
                    .field { margin-bottom: 15px; }
                    .label { font-weight: bold; color: #2c3e50; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>New Project Inquiry</h1>
                        <p>{{projectType}} Project</p>
                    </div>
                    
                    <div class="content">
                        <div class="project-details">
                            <div class="field">
                                <span class="label">Client:</span> {{clientName}}
                            </div>
                            <div class="field">
                                <span class="label">Email:</span> {{clientEmail}}
                            </div>
                            <div class="field">
                                <span class="label">Company:</span> {{company}}
                            </div>
                            <div class="field">
                                <span class="label">Project Type:</span> {{projectType}}
                            </div>
                            <div class="field">
                                <span class="label">Budget:</span> {{budget}}
                            </div>
                            <div class="field">
                                <span class="label">Timeline:</span> {{timeline}}
                            </div>
                        </div>
                        
                        <h3>Project Description:</h3>
                        <p>{{description}}</p>
                        
                        <h3>Requirements:</h3>
                        <p>{{requirements}}</p>
                    </div>
                </div>
            </body>
            </html>`
        };
    }

    /**
     * Get notification template
     */
    getNotificationTemplate() {
        return {
            subject: '{{type}} Notification - {{siteName}}',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; }
                    .header { padding: 20px; border-radius: 8px 8px 0 0; color: white; }
                    .header.info { background: #17a2b8; }
                    .header.warning { background: #ffc107; color: #212529; }
                    .header.error { background: #dc3545; }
                    .header.success { background: #28a745; }
                    .content { padding: 30px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header {{priority}}">
                        <h1>{{type}} Notification</h1>
                        <p>{{timestamp}}</p>
                    </div>
                    
                    <div class="content">
                        <h2>{{title}}</h2>
                        <p>{{message}}</p>
                        
                        {{#if details}}
                        <h3>Details:</h3>
                        <pre>{{details}}</pre>
                        {{/if}}
                    </div>
                </div>
            </body>
            </html>`
        };
    }

    /**
     * Get welcome template
     */
    getWelcomeTemplate() {
        return {
            subject: 'Welcome to {{siteName}}!',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
                    .content { padding: 30px; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to {{siteName}}!</h1>
                        <p>Let's build something amazing together</p>
                    </div>
                    
                    <div class="content">
                        <p>Dear {{name}},</p>
                        <p>Welcome to {{siteName}}! We're thrilled to have you join our community of innovators and creators.</p>
                        
                        <a href="{{siteUrl}}" class="button">Explore Our Services</a>
                        
                        <p>Best regards,<br>The {{siteName}} Team</p>
                    </div>
                </div>
            </body>
            </html>`
        };
    }

    /**
     * Get newsletter template
     */
    getNewsletterTemplate() {
        return {
            subject: '{{subject}} - {{siteName}} Newsletter',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; }
                    .header { background: #2c3e50; color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .article { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
                    .article h2 { color: #2c3e50; }
                    .footer { background: #ecf0f1; padding: 20px; text-align: center; color: #7f8c8d; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>{{siteName}} Newsletter</h1>
                        <p>{{subtitle}}</p>
                    </div>
                    
                    <div class="content">
                        {{content}}
                    </div>
                    
                    <div class="footer">
                        <p>You're receiving this because you subscribed to {{siteName}} newsletter.</p>
                        <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="{{siteUrl}}">Visit Website</a></p>
                    </div>
                </div>
            </body>
            </html>`
        };
    }

    /**
     * Replace template variables
     */
    replaceVariables(template, variables) {
        let result = template;

        // Replace {{variable}} patterns
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(regex, variables[key] || '');
        });

        // Add default variables
        const defaults = {
            siteName: process.env.SITE_NAME || 'GS Infotech',
            siteUrl: process.env.SITE_URL || 'http://localhost:3000',
            email: process.env.FROM_EMAIL || process.env.COMPANY_EMAIL || 'info@gsinfotech.com',
            phone: process.env.COMPANY_PHONE || '+1-555-0123',
            timestamp: new Date().toLocaleString()
        };

        Object.keys(defaults).forEach(key => {
            if (!variables[key]) {
                const regex = new RegExp(`{{${key}}}`, 'g');
                result = result.replace(regex, defaults[key]);
            }
        });

        return result;
    }

    /**
     * Send email using template
     */
    async sendEmail(options) {
        if (!this.isConfigured) {
            logger.warn('Email service not configured - email not sent');
            return { success: false, message: 'Email service not configured' };
        }

        try {
            const {
                to,
                templateName,
                variables = {},
                attachments = [],
                from = process.env.FROM_EMAIL,
                fromName = process.env.FROM_NAME
            } = options;

            if (!to) {
                throw new Error('Recipient email is required');
            }

            if (!this.templates.has(templateName)) {
                throw new Error(`Template '${templateName}' not found`);
            }

            const template = this.templates.get(templateName);

            const mailOptions = {
                from: fromName ? `${fromName} <${from}>` : from,
                to: Array.isArray(to) ? to.join(', ') : to,
                subject: this.replaceVariables(template.subject, variables),
                html: this.replaceVariables(template.html, variables),
                text: template.text ? this.replaceVariables(template.text, variables) : undefined,
                attachments
            };

            const result = await this.transporter.sendMail(mailOptions);

            logger.info('Email sent successfully', {
                to: mailOptions.to,
                template: templateName,
                messageId: result.messageId
            });

            return {
                success: true,
                messageId: result.messageId,
                to: mailOptions.to,
                template: templateName
            };

        } catch (error) {
            logger.error('Failed to send email:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Send contact form email
     */
    async sendContactEmail(formData) {
        try {
            // Send notification to admin
            const adminResult = await this.sendEmail({
                to: process.env.COMPANY_EMAIL || 'info@gsinfotech.com',
                templateName: 'contact',
                variables: formData
            });

            // Send auto-reply to user
            const userResult = await this.sendEmail({
                to: formData.email,
                templateName: 'autoReply',
                variables: {
                    name: formData.name,
                    ...formData
                }
            });

            return {
                success: adminResult.success && userResult.success,
                adminEmail: adminResult,
                autoReply: userResult
            };

        } catch (error) {
            logger.error('Failed to send contact emails:', error);
            throw error;
        }
    }

    /**
     * Send project inquiry email
     */
    async sendProjectInquiry(inquiryData) {
        return await this.sendEmail({
            to: process.env.COMPANY_EMAIL || 'info@gsinfotech.com',
            templateName: 'projectInquiry',
            variables: inquiryData
        });
    }

    /**
     * Send notification email
     */
    async sendNotification(notificationData) {
        return await this.sendEmail({
            to: process.env.COMPANY_EMAIL || 'info@gsinfotech.com',
            templateName: 'notification',
            variables: notificationData
        });
    }

    /**
     * Send welcome email
     */
    async sendWelcomeEmail(userData) {
        return await this.sendEmail({
            to: userData.email,
            templateName: 'welcome',
            variables: userData
        });
    }

    /**
     * Test email configuration
     */
    async testConfiguration() {
        try {
            await this.verifyConnection();

            const testResult = await this.sendEmail({
                to: process.env.SMTP_EMAIL,
                templateName: 'notification',
                variables: {
                    type: 'Test',
                    priority: 'info',
                    title: 'Email Service Test',
                    message: 'This is a test email to verify the email service configuration.'
                }
            });

            return testResult;

        } catch (error) {
            logger.error('Email configuration test failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get email service status
     */
    getStatus() {
        return {
            configured: this.isConfigured,
            templatesLoaded: this.templates.size,
            availableTemplates: Array.from(this.templates.keys())
        };
    }

    /**
     * Add custom template
     */
    addTemplate(name, template) {
        if (!template.subject || !template.html) {
            throw new Error('Template must include subject and html properties');
        }

        this.templates.set(name, template);
        logger.info(`Custom email template '${name}' added`);
    }

    /**
     * Send bulk emails (for newsletters, etc.)
     */
    async sendBulkEmails(recipients, templateName, variables = {}, options = {}) {
        if (!this.isConfigured) {
            return { success: false, message: 'Email service not configured' };
        }

        const {
            batchSize = 10,
            delayBetweenBatches = 1000
        } = options;

        const results = {
            total: recipients.length,
            sent: 0,
            failed: 0,
            errors: []
        };

        try {
            // Process in batches to avoid overwhelming the SMTP server
            for (let i = 0; i < recipients.length; i += batchSize) {
                const batch = recipients.slice(i, i + batchSize);

                const batchPromises = batch.map(async (recipient) => {
                    try {
                        const result = await this.sendEmail({
                            to: recipient.email,
                            templateName,
                            variables: { ...variables, ...recipient }
                        });

                        if (result.success) {
                            results.sent++;
                        } else {
                            results.failed++;
                            results.errors.push({
                                email: recipient.email,
                                error: result.error
                            });
                        }

                        return result;

                    } catch (error) {
                        results.failed++;
                        results.errors.push({
                            email: recipient.email,
                            error: error.message
                        });
                    }
                });

                await Promise.all(batchPromises);

                // Delay between batches
                if (i + batchSize < recipients.length) {
                    await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
                }
            }

            logger.info('Bulk email sending completed', results);
            return { success: true, results };

        } catch (error) {
            logger.error('Bulk email sending failed:', error);
            return {
                success: false,
                error: error.message,
                results
            };
        }
    }
}

// Export singleton instance
module.exports = new EmailService();