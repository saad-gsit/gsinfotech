// server/models/Project.js - Updated with structured content fields
module.exports = (sequelize, DataTypes) => {
    const Project = sequelize.define('Project', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
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
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        short_description: {
            type: DataTypes.STRING(500),
            allowNull: true
        },

        // NEW: Structured content fields
        overview: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Project overview section'
        },
        key_features: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
            comment: 'Array of key project features'
        },
        technical_implementation: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Technical implementation details'
        },

        // Legacy content field (keep for backward compatibility)
        content: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
            comment: 'Legacy rich content field'
        },

        featured_image: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        gallery: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: []
        },
        images: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
            comment: 'Project images array'
        },
        technologies: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: []
        },
        category: {
            type: DataTypes.ENUM('web_application', 'mobile_application', 'desktop_application', 'e_commerce', 'cms', 'api'),
            allowNull: false,
            defaultValue: 'web_application'
        },
        status: {
            type: DataTypes.ENUM('draft', 'published', 'archived'),
            allowNull: false,
            defaultValue: 'draft'
        },
        featured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        client_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        project_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
            validate: {
                isUrl: {
                    msg: 'Project URL must be a valid URL'
                }
            }
        },
        github_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
            validate: {
                isUrl: {
                    msg: 'GitHub URL must be a valid URL'
                }
            }
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Project start date'
        },
        completion_date: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Project completion date'
        },
        view_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
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
        canonical_url: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        robots: {
            type: DataTypes.STRING(100),
            defaultValue: 'index, follow'
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
        tableName: 'projects',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            beforeValidate: (project) => {
                // Auto-generate slug from title if not provided
                if (project.title && !project.slug) {
                    project.slug = project.title
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim('-');
                }

                // Auto-generate SEO title if not provided
                if (project.title && !project.seo_title) {
                    project.seo_title = project.title.length > 60
                        ? project.title.substring(0, 57) + '...'
                        : project.title;
                }

                // Parse JSON strings if they come as strings (from form data)
                const jsonFields = ['technologies', 'key_features', 'seo_keywords', 'images', 'gallery'];
                jsonFields.forEach(field => {
                    if (project[field] && typeof project[field] === 'string') {
                        try {
                            project[field] = JSON.parse(project[field]);
                        } catch (e) {
                            // If parsing fails, keep as is or set default
                            if (field === 'technologies' || field === 'key_features' || field === 'seo_keywords') {
                                project[field] = [];
                            }
                        }
                    }
                });

                // Ensure arrays are actually arrays
                if (project.technologies && !Array.isArray(project.technologies)) {
                    project.technologies = [];
                }
                if (project.key_features && !Array.isArray(project.key_features)) {
                    project.key_features = [];
                }
                if (project.seo_keywords && !Array.isArray(project.seo_keywords)) {
                    project.seo_keywords = [];
                }
            },

            beforeCreate: (project) => {
                // Set default values for new structured content
                if (!project.key_features) {
                    project.key_features = [];
                }
                if (!project.technologies) {
                    project.technologies = [];
                }
                if (!project.seo_keywords) {
                    project.seo_keywords = [];
                }
            },

            beforeUpdate: (project) => {
                // Update slug if title changed
                if (project.changed('title') && project.title) {
                    const newSlug = project.title
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim('-');

                    // Only update slug if it's different
                    if (newSlug !== project.slug) {
                        project.slug = newSlug;
                    }
                }
            }
        }
    });

    Project.associate = (models) => {
        // Association with SEO metadata
        Project.hasOne(models.SEOMetadata, {
            foreignKey: 'page_path',
            sourceKey: 'slug',
            as: 'seoData',
            constraints: false
        });
    };

    return Project;
};