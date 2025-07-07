// server/controllers/contactController.js - COMPLETE VERSION
const { ContactSubmission } = require('../models');
const { logger } = require('../utils/logger');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

class ContactController {
    // Initialize email transporter
    static getEmailTransporter() {
        if (!process.env.SMTP_HOST) {
            return null; // Return null if email not configured
        }

        return nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    // Submit contact form
    static async submitContactForm(req, res) {
        try {
            const {
                name,
                email,
                phone,
                company,
                subject,
                message,
                service_interest,
                budget_range,
                timeline
            } = req.body;

            // Create contact submission record
            const contactSubmission = await ContactSubmission.create({
                name,
                email,
                phone,
                company,
                subject,
                message,
                service_interest,
                budget_range,
                timeline,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                referrer: req.get('Referrer') || null,
                status: 'new'
            });

            // Send emails asynchronously (don't wait for completion)
            ContactController.sendEmailNotifications({
                contactSubmission,
                clientEmail: email,
                clientName: name
            }).catch(error => {
                logger.error('Email sending failed:', error);
            });

            logger.api('Contact form submitted successfully', {
                submissionId: contactSubmission.id,
                name,
                email,
                service_interest,
                ip: req.ip
            });

            res.status(201).json({
                message: 'Thank you for your message! We will get back to you soon.',
                submissionId: contactSubmission.id,
                estimatedResponse: '24 hours'
            });

        } catch (error) {
            logger.error('Error submitting contact form:', error);
            res.status(500).json({
                error: 'Failed to submit contact form',
                message: 'Please try again later or contact us directly via email.'
            });
        }
    }

    // Subscribe to newsletter
    static async subscribeNewsletter(req, res) {
        try {
            const { email, name } = req.body;

            if (!email) {
                return res.status(400).json({
                    error: 'Email is required for newsletter subscription'
                });
            }

            // Check if already subscribed
            const existingSubscription = await ContactSubmission.findOne({
                where: {
                    email,
                    subject: 'Newsletter Subscription'
                }
            });

            if (existingSubscription) {
                return res.json({
                    message: 'You are already subscribed to our newsletter!',
                    alreadySubscribed: true
                });
            }

            // Create newsletter subscription record
            await ContactSubmission.create({
                email,
                name: name || 'Newsletter Subscriber',
                subject: 'Newsletter Subscription',
                message: 'Newsletter subscription request',
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                status: 'new'
            });

            logger.api('Newsletter subscription', { email, name });

            res.json({
                message: 'Successfully subscribed to our newsletter!',
                subscribed: true
            });

        } catch (error) {
            logger.error('Error subscribing to newsletter:', error);
            res.status(500).json({
                error: 'Failed to subscribe to newsletter',
                message: 'Please try again later.'
            });
        }
    }

    // Get all contact submissions (admin)
    static async getAllSubmissions(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                status,
                service_interest,
                search,
                sort = 'created_at',
                order = 'DESC',
                startDate,
                endDate
            } = req.query;

            // Build where clause
            const whereClause = {};

            if (status) {
                whereClause.status = status;
            }

            if (service_interest) {
                whereClause.service_interest = service_interest;
            }

            if (search) {
                whereClause[Op.or] = [
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { company: { [Op.like]: `%${search}%` } },
                    { subject: { [Op.like]: `%${search}%` } },
                    { message: { [Op.like]: `%${search}%` } }
                ];
            }

            if (startDate || endDate) {
                whereClause.created_at = {};
                if (startDate) {
                    whereClause.created_at[Op.gte] = new Date(startDate);
                }
                if (endDate) {
                    whereClause.created_at[Op.lte] = new Date(endDate);
                }
            }

            const offset = (parseInt(page) - 1) * parseInt(limit);

            const { count, rows: submissions } = await ContactSubmission.findAndCountAll({
                where: whereClause,
                limit: parseInt(limit),
                offset,
                order: [[sort, order.toUpperCase()]]
            });

            const totalPages = Math.ceil(count / parseInt(limit));

            res.json({
                submissions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalSubmissions: count,
                    submissionsPerPage: parseInt(limit),
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1
                },
                filters: { status, service_interest, search, startDate, endDate }
            });

        } catch (error) {
            logger.error('Error fetching contact submissions:', error);
            res.status(500).json({
                error: 'Failed to fetch contact submissions',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get single contact submission
    static async getSubmissionById(req, res) {
        try {
            const { id } = req.params;

            const submission = await ContactSubmission.findByPk(id);

            if (!submission) {
                return res.status(404).json({
                    error: 'Contact submission not found',
                    message: `No submission found with ID: ${id}`
                });
            }

            logger.api('Contact submission retrieved', {
                submissionId: id,
                name: submission.name,
                status: submission.status
            });

            res.json({ submission });

        } catch (error) {
            logger.error('Error fetching contact submission:', error);
            res.status(500).json({
                error: 'Failed to fetch contact submission',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Update contact submission status
    static async updateSubmissionStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, notes, assigned_to } = req.body;

            const submission = await ContactSubmission.findByPk(id);

            if (!submission) {
                return res.status(404).json({
                    error: 'Contact submission not found',
                    message: `No submission found with ID: ${id}`
                });
            }

            const updates = {};
            if (status) updates.status = status;
            if (notes) updates.notes = notes;
            if (assigned_to) updates.assigned_to = assigned_to;

            await submission.update(updates);

            logger.api('Contact submission updated', {
                submissionId: id,
                oldStatus: submission.status,
                newStatus: status
            });

            res.json({
                message: 'Submission updated successfully',
                submission
            });

        } catch (error) {
            logger.error('Error updating contact submission:', error);
            res.status(500).json({
                error: 'Failed to update contact submission',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Delete contact submission
    static async deleteSubmission(req, res) {
        try {
            const { id } = req.params;

            const submission = await ContactSubmission.findByPk(id);

            if (!submission) {
                return res.status(404).json({
                    error: 'Contact submission not found',
                    message: `No submission found with ID: ${id}`
                });
            }

            await submission.destroy();

            logger.api('Contact submission deleted', {
                submissionId: id,
                name: submission.name,
                email: submission.email
            });

            res.json({
                message: 'Contact submission deleted successfully',
                deletedSubmission: {
                    id: submission.id,
                    name: submission.name,
                    email: submission.email
                }
            });

        } catch (error) {
            logger.error('Error deleting contact submission:', error);
            res.status(500).json({
                error: 'Failed to delete contact submission',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get contact statistics
    static async getContactStats(req, res) {
        try {
            const { period = '30d' } = req.query;

            // Calculate date range
            const endDate = new Date();
            let startDate;

            switch (period) {
                case '7d':
                    startDate = new Date(endDate - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    startDate = new Date(endDate - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '90d':
                    startDate = new Date(endDate - 90 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(endDate - 30 * 24 * 60 * 60 * 1000);
            }

            const [
                totalSubmissions,
                recentSubmissions,
                statusBreakdown,
                serviceBreakdown
            ] = await Promise.all([
                ContactSubmission.count(),
                ContactSubmission.count({
                    where: {
                        created_at: { [Op.gte]: startDate }
                    }
                }),
                ContactSubmission.findAll({
                    attributes: [
                        'status',
                        [ContactSubmission.sequelize.fn('COUNT', '*'), 'count']
                    ],
                    group: ['status']
                }),
                ContactSubmission.findAll({
                    attributes: [
                        'service_interest',
                        [ContactSubmission.sequelize.fn('COUNT', '*'), 'count']
                    ],
                    where: {
                        created_at: { [Op.gte]: startDate }
                    },
                    group: ['service_interest']
                })
            ]);

            const stats = {
                overview: {
                    totalSubmissions,
                    recentSubmissions,
                    averagePerDay: (recentSubmissions / Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000))).toFixed(1)
                },
                breakdown: {
                    byStatus: statusBreakdown.reduce((acc, stat) => {
                        acc[stat.status] = parseInt(stat.get('count'));
                        return acc;
                    }, {}),
                    byService: serviceBreakdown.map(service => ({
                        service: service.service_interest || 'General',
                        count: parseInt(service.get('count'))
                    }))
                }
            };

            logger.api('Contact statistics retrieved', {
                period,
                totalSubmissions,
                recentSubmissions
            });

            res.json({
                period,
                dateRange: {
                    start: startDate.toISOString(),
                    end: endDate.toISOString()
                },
                stats
            });

        } catch (error) {
            logger.error('Error fetching contact statistics:', error);
            res.status(500).json({
                error: 'Failed to fetch contact statistics',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get newsletter subscribers
    static async getNewsletterSubscribers(req, res) {
        try {
            const { page = 1, limit = 50 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            const { count, rows: subscribers } = await ContactSubmission.findAndCountAll({
                where: { subject: 'Newsletter Subscription' },
                attributes: ['id', 'name', 'email', 'created_at'],
                limit: parseInt(limit),
                offset,
                order: [['created_at', 'DESC']]
            });

            const totalPages = Math.ceil(count / parseInt(limit));

            res.json({
                subscribers,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalSubscribers: count,
                    subscribersPerPage: parseInt(limit),
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1
                }
            });

        } catch (error) {
            logger.error('Error fetching newsletter subscribers:', error);
            res.status(500).json({
                error: 'Failed to fetch newsletter subscribers',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Send email notifications
    static async sendEmailNotifications({ contactSubmission, clientEmail, clientName }) {
        const transporter = ContactController.getEmailTransporter();

        if (!transporter) {
            logger.warn('Email transporter not configured, skipping email notifications');
            return;
        }

        try {
            // Admin notification email
            const adminEmailHtml = ContactController.generateAdminEmailTemplate(contactSubmission);

            if (process.env.COMPANY_EMAIL) {
                await transporter.sendMail({
                    from: `"${process.env.FROM_NAME || 'GS Infotech'}" <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
                    to: process.env.COMPANY_EMAIL,
                    subject: `New Contact Form Submission - ${contactSubmission.subject}`,
                    html: adminEmailHtml
                });
            }

            // Client confirmation email
            const clientEmailHtml = ContactController.generateClientEmailTemplate(contactSubmission);

            await transporter.sendMail({
                from: `"${process.env.FROM_NAME || 'GS Infotech'}" <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
                to: clientEmail,
                subject: `Thank you for contacting ${process.env.SITE_NAME || 'GS Infotech'}`,
                html: clientEmailHtml
            });

            logger.api('Contact form emails sent successfully', {
                submissionId: contactSubmission.id,
                clientEmail
            });

        } catch (error) {
            logger.error('Error sending contact emails:', error);
            throw error;
        }
    }

    // Generate admin email template
    static generateAdminEmailTemplate(submission) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; }
                    .field { margin-bottom: 15px; }
                    .label { font-weight: bold; color: #555; }
                    .value { margin-top: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>New Contact Form Submission</h1>
                        <p>ID: ${submission.id}</p>
                    </div>
                    <div class="content">
                        <div class="field">
                            <div class="label">Name:</div>
                            <div class="value">${submission.name}</div>
                        </div>
                        <div class="field">
                            <div class="label">Email:</div>
                            <div class="value">${submission.email}</div>
                        </div>
                        ${submission.phone ? `
                        <div class="field">
                            <div class="label">Phone:</div>
                            <div class="value">${submission.phone}</div>
                        </div>
                        ` : ''}
                        ${submission.company ? `
                        <div class="field">
                            <div class="label">Company:</div>
                            <div class="value">${submission.company}</div>
                        </div>
                        ` : ''}
                        <div class="field">
                            <div class="label">Subject:</div>
                            <div class="value">${submission.subject}</div>
                        </div>
                        <div class="field">
                            <div class="label">Message:</div>
                            <div class="value">${submission.message}</div>
                        </div>
                        <div class="field">
                            <div class="label">Submitted:</div>
                            <div class="value">${submission.created_at}</div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    // Generate client confirmation email template
    static generateClientEmailTemplate(submission) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Thank You!</h1>
                        <p>${process.env.SITE_NAME || 'GS Infotech'}</p>
                    </div>
                    <div class="content">
                        <h2>Hello ${submission.name},</h2>
                        <p>Thank you for contacting us! We have received your message and will get back to you within 24 hours.</p>
                        <p><strong>Your submission ID:</strong> ${submission.id}</p>
                        <p><strong>Subject:</strong> ${submission.subject}</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}

module.exports = ContactController;