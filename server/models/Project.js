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
        content: {
            type: DataTypes.TEXT('long'),
            allowNull: true
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
                isUrl: true
            }
        },
        github_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
            validate: {
                isUrl: true
            }
        },
        completion_date: {
            type: DataTypes.DATE,
            allowNull: true
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
            }
        }
    });

    Project.associate = (models) => {
        // Simple association - we'll handle the path matching in controllers
        Project.hasOne(models.SEOMetadata, {
            foreignKey: 'page_path',
            sourceKey: 'slug',
            as: 'seoData',
            constraints: false
        });
    };

    return Project;
};