'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('services', {
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
      short_description: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      icon: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      featured_image: {
        type: Sequelize.STRING(500),
        allowNull: true
      },

      // Service Details
      category: {
        type: Sequelize.ENUM('web_development', 'mobile_development', 'custom_software', 'ui_ux_design', 'enterprise_solutions'),
        allowNull: false
      },
      features: {
        type: Sequelize.JSON,
        allowNull: true
      },
      technologies: {
        type: Sequelize.JSON,
        allowNull: true
      },

      // Pricing
      pricing_model: {
        type: Sequelize.ENUM('fixed', 'hourly', 'project_based', 'monthly', 'custom'),
        allowNull: true
      },
      starting_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      price_currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'USD'
      },

      // Timeline
      estimated_timeline: {
        type: Sequelize.STRING(100),
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
      show_in_homepage: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },

      // Process/Methodology
      process_steps: {
        type: Sequelize.JSON,
        allowNull: true
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
    await queryInterface.addIndex('services', ['slug'], {
      unique: true,
      name: 'services_slug_unique'
    });

    await queryInterface.addIndex('services', ['category'], {
      name: 'services_category_idx'
    });

    await queryInterface.addIndex('services', ['is_active'], {
      name: 'services_is_active_idx'
    });

    await queryInterface.addIndex('services', ['is_featured'], {
      name: 'services_is_featured_idx'
    });

    await queryInterface.addIndex('services', ['display_order'], {
      name: 'services_display_order_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('services');
  }
};