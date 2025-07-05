'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contact_submissions', {
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
      email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      company: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      service_interest: {
        type: Sequelize.ENUM('web_development', 'mobile_development', 'custom_software', 'ui_ux_design', 'enterprise_solutions', 'consultation', 'other'),
        allowNull: true
      },
      budget_range: {
        type: Sequelize.ENUM('under_5k', '5k_10k', '10k_25k', '25k_50k', '50k_plus', 'not_specified'),
        allowNull: true
      },
      timeline: {
        type: Sequelize.ENUM('urgent', '1_month', '3_months', '6_months', 'flexible'),
        allowNull: true
      },

      // Status and Follow-up
      status: {
        type: Sequelize.ENUM('new', 'in_progress', 'responded', 'closed'),
        allowNull: false,
        defaultValue: 'new'
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium'
      },
      assigned_to: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'team_members',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      // Source and metadata
      source: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: 'website'
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

      // Response tracking
      responded_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      follow_up_date: {
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

    // Add indexes for performance
    await queryInterface.addIndex('contact_submissions', ['email'], {
      name: 'contact_submissions_email_idx'
    });

    await queryInterface.addIndex('contact_submissions', ['status'], {
      name: 'contact_submissions_status_idx'
    });

    await queryInterface.addIndex('contact_submissions', ['priority'], {
      name: 'contact_submissions_priority_idx'
    });

    await queryInterface.addIndex('contact_submissions', ['assigned_to'], {
      name: 'contact_submissions_assigned_to_idx'
    });

    await queryInterface.addIndex('contact_submissions', ['created_at'], {
      name: 'contact_submissions_created_at_idx'
    });

    await queryInterface.addIndex('contact_submissions', ['service_interest'], {
      name: 'contact_submissions_service_interest_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contact_submissions');
  }
};