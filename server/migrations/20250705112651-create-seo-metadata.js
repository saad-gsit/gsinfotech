'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('seo_metadata', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      page_path: {
        type: Sequelize.STRING(500),
        allowNull: false,
        unique: true
      },
      title: {
        type: Sequelize.STRING(60),
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(160),
        allowNull: false
      },
      keywords: {
        type: Sequelize.JSON,
        allowNull: true
      },
      og_title: {
        type: Sequelize.STRING(60),
        allowNull: true
      },
      og_description: {
        type: Sequelize.STRING(160),
        allowNull: true
      },
      og_image: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      og_type: {
        type: Sequelize.STRING(50),
        defaultValue: 'website'
      },
      twitter_card: {
        type: Sequelize.STRING(50),
        defaultValue: 'summary_large_image'
      },
      canonical_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      robots: {
        type: Sequelize.STRING(100),
        defaultValue: 'index, follow'
      },
      structured_data: {
        type: Sequelize.JSON,
        allowNull: true
      },
      priority: {
        type: Sequelize.DECIMAL(2, 1),
        defaultValue: 0.5
      },
      change_frequency: {
        type: Sequelize.ENUM('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'),
        defaultValue: 'monthly'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

    // Add SEO-focused indexes
    await queryInterface.addIndex('seo_metadata', ['page_path'], {
      unique: true,
      name: 'seo_metadata_page_path_unique'
    });

    await queryInterface.addIndex('seo_metadata', ['is_active'], {
      name: 'seo_metadata_is_active_idx'
    });

    await queryInterface.addIndex('seo_metadata', ['priority'], {
      name: 'seo_metadata_priority_idx'
    });

    await queryInterface.addIndex('seo_metadata', ['change_frequency'], {
      name: 'seo_metadata_change_frequency_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('seo_metadata');
  }
};