'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('team_members', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(300),
        allowNull: false,
        unique: true
      },
      position: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      department: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      short_bio: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      profile_image: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },

      // Skills and Expertise
      skills: {
        type: Sequelize.JSON,
        allowNull: true
      },
      expertise_level: {
        type: Sequelize.ENUM('junior', 'mid', 'senior', 'lead', 'architect'),
        allowNull: false,
        defaultValue: 'mid'
      },
      years_experience: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      // Social Links
      social_links: {
        type: Sequelize.JSON,
        allowNull: true
      },

      // Display Settings
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      show_in_about: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

      hire_date: {
        type: Sequelize.DATE,
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

    // Add indexes
    await queryInterface.addIndex('team_members', ['slug'], {
      unique: true,
      name: 'team_members_slug_unique'
    });

    await queryInterface.addIndex('team_members', ['is_active'], {
      name: 'team_members_is_active_idx'
    });

    await queryInterface.addIndex('team_members', ['is_featured'], {
      name: 'team_members_is_featured_idx'
    });

    await queryInterface.addIndex('team_members', ['display_order'], {
      name: 'team_members_display_order_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('team_members');
  }
};