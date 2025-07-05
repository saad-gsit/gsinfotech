module.exports = (sequelize, DataTypes) => {
    const ContactSubmission = sequelize.define('ContactSubmission', {
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
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        company: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        subject: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [10, 5000]
            }
        },
        service_interest: {
            type: DataTypes.ENUM('web_development', 'mobile_development', 'custom_software', 'ui_ux_design', 'enterprise_solutions', 'consultation', 'other'),
            allowNull: true
        },
        budget_range: {
            type: DataTypes.ENUM('under_5k', '5k_10k', '10k_25k', '25k_50k', '50k_plus', 'not_specified'),
            allowNull: true
        },
        timeline: {
            type: DataTypes.ENUM('urgent', '1_month', '3_months', '6_months', 'flexible'),
            allowNull: true
        },

        // Status and Follow-up
        status: {
            type: DataTypes.ENUM('new', 'in_progress', 'responded', 'closed'),
            allowNull: false,
            defaultValue: 'new'
        },
        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high'),
            allowNull: false,
            defaultValue: 'medium'
        },
        assigned_to: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'team_members',
                key: 'id'
            }
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        // Source and metadata
        source: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: 'website'
        },
        ip_address: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        user_agent: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        referrer: {
            type: DataTypes.STRING(500),
            allowNull: true
        },

        // Response tracking
        responded_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        follow_up_date: {
            type: DataTypes.DATE,
            allowNull: true
        },

        // Timestamps
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
        tableName: 'contact_submissions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    ContactSubmission.associate = (models) => {
        ContactSubmission.belongsTo(models.TeamMember, {
            foreignKey: 'assigned_to',
            as: 'assignedTeamMember'
        });
    };

    return ContactSubmission;
  };