'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('company_info', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      key: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('text', 'json', 'html', 'number', 'boolean', 'url', 'email'),
        allowNull: false,
        defaultValue: 'text'
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'general'
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      is_public: {
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

    // Add indexes
    await queryInterface.addIndex('company_info', ['key'], {
      unique: true,
      name: 'company_info_key_unique'
    });

    await queryInterface.addIndex('company_info', ['category'], {
      name: 'company_info_category_idx'
    });

    await queryInterface.addIndex('company_info', ['is_public'], {
      name: 'company_info_is_public_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('company_info');
  }
};