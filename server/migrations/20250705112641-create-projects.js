'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('projects', {
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
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      short_description: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      featured_image: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      gallery: {
        type: Sequelize.JSON,
        allowNull: true
      },
      technologies: {
        type: Sequelize.JSON,
        allowNull: true
      },
      category: {
        type: Sequelize.ENUM('web_application', 'mobile_application', 'desktop_application', 'e_commerce', 'cms', 'api'),
        allowNull: false,
        defaultValue: 'web_application'
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        allowNull: false,
        defaultValue: 'draft'
      },
      featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      client_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      project_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      github_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      completion_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      view_count: {
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

    // Add indexes for performance
    await queryInterface.addIndex('projects', ['slug'], {
      unique: true,
      name: 'projects_slug_unique'
    });

    await queryInterface.addIndex('projects', ['status'], {
      name: 'projects_status_idx'
    });

    await queryInterface.addIndex('projects', ['category'], {
      name: 'projects_category_idx'
    });

    await queryInterface.addIndex('projects', ['featured'], {
      name: 'projects_featured_idx'
    });

    await queryInterface.addIndex('projects', ['created_at'], {
      name: 'projects_created_at_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('projects');
  }
};