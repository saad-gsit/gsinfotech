// server/controllers/teamController.js - Matches your exact schema
const db = require('../models');

const TeamController = {
    // Get all team members
    getAllTeamMembers: async (req, res) => {
        try {
            const {
                department,
                is_featured,
                is_active = 'true',
                expertise_level,
                limit,
                offset,
                search
            } = req.query;

            const whereClause = {};

            // Add filters based on your actual schema
            if (department) whereClause.department = department;
            if (is_featured !== undefined) whereClause.is_featured = is_featured === 'true';
            if (is_active !== undefined) whereClause.is_active = is_active === 'true';
            if (expertise_level) whereClause.expertise_level = expertise_level;

            // Add search functionality
            if (search) {
                whereClause[db.Sequelize.Op.or] = [
                    { name: { [db.Sequelize.Op.like]: `%${search}%` } },
                    { position: { [db.Sequelize.Op.like]: `%${search}%` } },
                    { department: { [db.Sequelize.Op.like]: `%${search}%` } }
                ];
            }

            const queryOptions = {
                where: whereClause,
                order: [
                    ['is_featured', 'DESC'],
                    ['display_order', 'ASC'],
                    ['created_at', 'ASC']
                ]
            };

            // Add pagination if specified
            if (limit) {
                queryOptions.limit = parseInt(limit);
                if (offset) queryOptions.offset = parseInt(offset);
            }

            const teamMembers = await db.TeamMember.findAll(queryOptions);
            const total = await db.TeamMember.count({ where: whereClause });

            // Process the data to match frontend expectations
            const processedMembers = teamMembers.map(member => {
                const memberData = member.toJSON();

                // Map your schema fields to frontend expectations
                return {
                    ...memberData,
                    photo: memberData.profile_image, // Map profile_image to photo
                    bio: memberData.bio || memberData.short_bio,
                    is_leadership: memberData.is_featured, // Use is_featured as leadership indicator
                    available: memberData.is_active,
                    role: memberData.position // Alias for position
                };
            });

            console.log(`Retrieved ${teamMembers.length} team members`);

            res.json({
                success: true,
                members: processedMembers,
                total,
                pagination: limit ? {
                    limit: parseInt(limit),
                    offset: parseInt(offset) || 0,
                    total
                } : null
            });

        } catch (error) {
            console.error('Error fetching team members:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch team members',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    },

    // Get single team member
    getTeamMemberById: async (req, res) => {
        try {
            const { id } = req.params;

            const teamMember = await db.TeamMember.findOne({
                where: {
                    [db.Sequelize.Op.or]: [
                        { id: isNaN(id) ? 0 : parseInt(id) },
                        { slug: id }
                    ]
                }
            });

            if (!teamMember) {
                return res.status(404).json({
                    success: false,
                    error: 'Team member not found'
                });
            }

            // Process the data to match frontend expectations
            const memberData = teamMember.toJSON();
            const processedMember = {
                ...memberData,
                photo: memberData.profile_image,
                bio: memberData.bio || memberData.short_bio,
                is_leadership: memberData.is_featured,
                available: memberData.is_active,
                role: memberData.position
            };

            console.log(`Retrieved team member: ${teamMember.name}`);

            res.json({
                success: true,
                member: processedMember
            });

        } catch (error) {
            console.error('Error fetching team member:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch team member',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    },

    // Create team member
    createTeamMember: async (req, res) => {
        try {
            const teamMemberData = req.body;

            // Handle processed images if available
            if (req.processedImages && req.processedImages.photo) {
                teamMemberData.profile_image = req.processedImages.photo.url;
            }

            // Map frontend fields to your schema
            if (teamMemberData.photo && !teamMemberData.profile_image) {
                teamMemberData.profile_image = teamMemberData.photo;
            }

            const newTeamMember = await db.TeamMember.create(teamMemberData);

            console.log(`Created new team member: ${newTeamMember.name}`);

            res.status(201).json({
                success: true,
                message: 'Team member created successfully',
                member: newTeamMember
            });

        } catch (error) {
            console.error('Error creating team member:', error);

            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.errors.map(err => ({
                        field: err.path,
                        message: err.message
                    }))
                });
            }

            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({
                    success: false,
                    error: 'Slug must be unique',
                    message: 'A team member with this slug already exists'
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to create team member',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    },

    // Update team member
    updateTeamMember: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Handle processed images if available
            if (req.processedImages && req.processedImages.photo) {
                updateData.profile_image = req.processedImages.photo.url;
            }

            // Map frontend fields to your schema
            if (updateData.photo && !updateData.profile_image) {
                updateData.profile_image = updateData.photo;
            }

            const [updatedRows] = await db.TeamMember.update(updateData, {
                where: { id }
            });

            if (updatedRows === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Team member not found'
                });
            }

            const updatedTeamMember = await db.TeamMember.findByPk(id);

            console.log(`Updated team member: ${updatedTeamMember.name}`);

            res.json({
                success: true,
                message: 'Team member updated successfully',
                member: updatedTeamMember
            });

        } catch (error) {
            console.error('Error updating team member:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update team member',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    },

    // Delete team member
    deleteTeamMember: async (req, res) => {
        try {
            const { id } = req.params;

            const teamMember = await db.TeamMember.findByPk(id);

            if (!teamMember) {
                return res.status(404).json({
                    success: false,
                    error: 'Team member not found'
                });
            }

            await teamMember.destroy();

            console.log(`Deleted team member: ${teamMember.name}`);

            res.json({
                success: true,
                message: 'Team member deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting team member:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete team member',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    },

    // Get team stats
    getTeamStats: async (req, res) => {
        try {
            const totalMembers = await db.TeamMember.count();
            const activeMembers = await db.TeamMember.count({
                where: { is_active: true }
            });
            const featuredMembers = await db.TeamMember.count({
                where: { is_featured: true }
            });

            // Get department stats
            const departmentStats = await db.TeamMember.findAll({
                attributes: [
                    'department',
                    [db.Sequelize.fn('COUNT', db.Sequelize.col('department')), 'count']
                ],
                where: {
                    is_active: true,
                    department: { [db.Sequelize.Op.not]: null }
                },
                group: ['department'],
                raw: true
            });

            // Get expertise level stats
            const expertiseStats = await db.TeamMember.findAll({
                attributes: [
                    'expertise_level',
                    [db.Sequelize.fn('COUNT', db.Sequelize.col('expertise_level')), 'count']
                ],
                where: { is_active: true },
                group: ['expertise_level'],
                raw: true
            });

            console.log('Retrieved team statistics');

            res.json({
                success: true,
                stats: {
                    total: totalMembers,
                    active: activeMembers,
                    leadership: featuredMembers, // Using featured as leadership
                    departments: departmentStats || [],
                    expertise: expertiseStats || []
                }
            });

        } catch (error) {
            console.error('Error fetching team stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch team stats',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
};

module.exports = TeamController;