'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('blog_posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(300),
        allowNull: false,
        unique: true
      },
      excerpt: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      featured_image: {
        type: Sequelize.STRING(500),
        allowNull: true
      },

      // Content Metadata
      reading_time: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      word_count: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      // Categories and Tags
      category: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true
      },

      // Publishing
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        allowNull: false,
        defaultValue: 'draft'
      },
      featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      // Author Information
      author_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      author_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'team_members',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      // Engagement
      view_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      like_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      share_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },

      // SEO Fields
      seo_title: {
        type: Sequelize.STRING(60),
        allowNull: true
      },
      seo_description: {
        type: Sequelize.STRING(160),
        allowNull: true
      },
      seo_keywords: {
        type: Sequelize.JSON,
        allowNull: true
      },
      og_image: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      canonical_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      robots: {
        type: Sequelize.STRING(100),
        defaultValue: 'index, follow'
      },

      // Schema.org structured data
      article_schema: {
        type: Sequelize.JSON,
        allowNull: true
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for SEO and performance
    await queryInterface.addIndex('blog_posts', ['slug'], {
      unique: true,
      name: 'blog_posts_slug_unique'
    });

    await queryInterface.addIndex('blog_posts', ['status'], {
      name: 'blog_posts_status_idx'
    });

    await queryInterface.addIndex('blog_posts', ['featured'], {
      name: 'blog_posts_featured_idx'
    });

    await queryInterface.addIndex('blog_posts', ['published_at'], {
      name: 'blog_posts_published_at_idx'
    });

    await queryInterface.addIndex('blog_posts', ['category'], {
      name: 'blog_posts_category_idx'
    });

    await queryInterface.addIndex('blog_posts', ['author_id'], {
      name: 'blog_posts_author_id_idx'
    });

    await queryInterface.addIndex('blog_posts', ['created_at'], {
      name: 'blog_posts_created_at_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('blog_posts');
  }
};