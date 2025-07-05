module.exports = (sequelize, DataTypes) => {
    const Service = sequelize.define('Service', {
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
                len: [3, 255]
            }
        },
        slug: {
            type: DataTypes.STRING(300),
            allowNull: false,
            unique: true
        },
        short_description: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        icon: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        featured_image: {
            type: DataTypes.STRING(500),
            allowNull: true
        },

        // Service Details
        category: {
            type: DataTypes.ENUM('web_development', 'mobile_development', 'custom_software', 'ui_ux_design', 'enterprise_solutions'),
            allowNull: false
        },
        features: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: []
        },
        technologies: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: []
        },

        // Pricing (optional)
        pricing_model: {
            type: DataTypes.ENUM('fixed', 'hourly', 'project_based', 'monthly', 'custom'),
            allowNull: true
        },
        starting_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        price_currency: {
            type: DataTypes.STRING(3),
            defaultValue: 'USD'
        },

        // Timeline
        estimated_timeline: {
            type: DataTypes.STRING(100),
            allowNull: true
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
        show_in_homepage: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },

        // Process/Methodology
        process_steps: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: []
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
        seo_keywords: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: []
        },
        og_image: {
            type: DataTypes.STRING(500),
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
        tableName: 'services',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            beforeValidate: (service) => {
                // Auto-generate slug from name if not provided
                if (service.name && !service.slug) {
                    service.slug = service.name
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim('-');
                }
            }
        }
    });

    Service.associate = (models) => {
        // Add associations here if needed
    };

    return Service;
  };