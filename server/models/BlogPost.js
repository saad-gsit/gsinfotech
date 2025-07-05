module.exports = (sequelize, DataTypes) => {
    const BlogPost = sequelize.define('BlogPost', {
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
                len: [5, 255]
            }
        },
        slug: {
            type: DataTypes.STRING(300),
            allowNull: false,
            unique: true
        },
        excerpt: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        content: {
            type: DataTypes.TEXT('long'),
            allowNull: false
        },
        featured_image: {
            type: DataTypes.STRING(500),
            allowNull: true
        },

        // Content Metadata
        reading_time: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Reading time in minutes'
        },
        word_count: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        // Categories and Tags
        category: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        tags: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: []
        },

        // Publishing
        status: {
            type: DataTypes.ENUM('draft', 'published', 'archived'),
            allowNull: false,
            defaultValue: 'draft'
        },
        featured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        published_at: {
            type: DataTypes.DATE,
            allowNull: true
        },

        // Author Information
        author_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        author_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'team_members',
                key: 'id'
            }
        },

        // Engagement
        view_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        like_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        share_count: {
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

        // Schema.org structured data
        article_schema: {
            type: DataTypes.JSON,
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
        tableName: 'blog_posts',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            beforeValidate: (post) => {
                // Auto-generate slug from title if not provided
                if (post.title && !post.slug) {
                    post.slug = post.title
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim('-');
                }

                // Calculate reading time and word count
                if (post.content) {
                    const words = post.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
                    post.word_count = words;
                    post.reading_time = Math.ceil(words / 200); // 200 words per minute
                }

                // Auto-generate SEO fields if not provided
                if (post.title && !post.seo_title) {
                    post.seo_title = post.title.length > 60
                        ? post.title.substring(0, 57) + '...'
                        : post.title;
                }

                if (post.excerpt && !post.seo_description) {
                    post.seo_description = post.excerpt.length > 160
                        ? post.excerpt.substring(0, 157) + '...'
                        : post.excerpt;
                }

                // Set published_at when status changes to published
                if (post.status === 'published' && !post.published_at) {
                    post.published_at = new Date();
                }
            }
        }
    });

    BlogPost.associate = (models) => {
        BlogPost.belongsTo(models.TeamMember, {
            foreignKey: 'author_id',
            as: 'author'
        });
    };

    return BlogPost;
  };