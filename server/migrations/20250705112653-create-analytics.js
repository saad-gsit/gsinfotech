'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('analytics', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      event_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      page_path: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      user_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      session_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      referrer: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      device_type: {
        type: Sequelize.ENUM('desktop', 'mobile', 'tablet'),
        allowNull: true
      },
      browser: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      os: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      country: {
        type: Sequelize.STRING(2),
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      // Event data
      event_data: {
        type: Sequelize.JSON,
        allowNull: true
      },

      // Performance metrics
      page_load_time: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      // Timestamps
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add analytics-focused indexes for performance
    await queryInterface.addIndex('analytics', ['event_type'], {
      name: 'analytics_event_type_idx'
    });

    await queryInterface.addIndex('analytics', ['page_path'], {
      name: 'analytics_page_path_idx'
    });

    await queryInterface.addIndex('analytics', ['session_id'], {
      name: 'analytics_session_id_idx'
    });

    await queryInterface.addIndex('analytics', ['timestamp'], {
      name: 'analytics_timestamp_idx'
    });

    await queryInterface.addIndex('analytics', ['user_id'], {
      name: 'analytics_user_id_idx'
    });

    await queryInterface.addIndex('analytics', ['device_type'], {
      name: 'analytics_device_type_idx'
    });

    // Composite index for common queries
    await queryInterface.addIndex('analytics', ['event_type', 'timestamp'], {
      name: 'analytics_event_type_timestamp_idx'
    });

    await queryInterface.addIndex('analytics', ['page_path', 'timestamp'], {
      name: 'analytics_page_path_timestamp_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('analytics');
  }
};