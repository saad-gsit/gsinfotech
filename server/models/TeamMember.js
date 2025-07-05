module.exports = (sequelize, DataTypes) => {
    const TeamMember = sequelize.define('TeamMember', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 255]
            }
        },
        slug: {
            type: DataTypes.STRING(300),
            allowNull: false,
            unique: true
        },
        position: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        department: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        short_bio: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        profile_image: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true
        },

        // Skills and Expertise
        skills: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: []
        },
        expertise_level: {
            type: DataTypes.ENUM('junior', 'mid', 'senior', 'lead', 'architect'),
            allowNull: false,
            defaultValue: 'mid'
        },
        years_experience: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 0,
                max: 50
            }
        },

        // Social Links
        social_links: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {
                linkedin: '',
                github: '',
                twitter: '',
                portfolio: '',
                behance: '',
                dribbble: ''
            }
        },

        // Display Settings
        display_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        is_featured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        show_in_about: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },

        // SEO Fields
        seo_title: {
            type: DataTypes.STRING(60),
            allowNull: true
        },
        seo_description: {
            type: DataTypes.STRING(160),
            allowNull: true
        },

        // Timestamps
        hire_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'team_members',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            beforeValidate: (member) => {
                // Auto-generate slug from name if not provided
                if (member.name && !member.slug) {
                    member.slug = member.name
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim('-');
                }
            }
        }
    });

    TeamMember.associate = (models) => {
        // Add associations here
        // TeamMember.belongsToMany(models.Project, { through: 'ProjectTeamMembers' });
    };

    return TeamMember;
  };