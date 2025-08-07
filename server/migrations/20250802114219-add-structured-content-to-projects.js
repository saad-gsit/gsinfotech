// Migration file: migrations/YYYYMMDDHHMMSS-add-structured-content-to-projects.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add new structured content fields
      await queryInterface.addColumn('projects', 'overview', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Project overview section'
      });

      await queryInterface.addColumn('projects', 'key_features', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of key project features'
      });

      await queryInterface.addColumn('projects', 'technical_implementation', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Technical implementation details'
      });

      // Add start_date field if it doesn't exist
      const tableDescription = await queryInterface.describeTable('projects');

      if (!tableDescription.start_date) {
        await queryInterface.addColumn('projects', 'start_date', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Project start date'
        });
      }

      // Add images field for better image management
      if (!tableDescription.images) {
        await queryInterface.addColumn('projects', 'images', {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: [],
          comment: 'Project images array'
        });
      }

      console.log('✅ Successfully added structured content fields to projects table');

    } catch (error) {
      console.error('❌ Error adding structured content fields:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove the added columns
      await queryInterface.removeColumn('projects', 'overview');
      await queryInterface.removeColumn('projects', 'key_features');
      await queryInterface.removeColumn('projects', 'technical_implementation');

      // Only remove these if they were added by this migration
      const tableDescription = await queryInterface.describeTable('projects');

      if (tableDescription.start_date) {
        await queryInterface.removeColumn('projects', 'start_date');
      }

      if (tableDescription.images) {
        await queryInterface.removeColumn('projects', 'images');
      }

      console.log('✅ Successfully removed structured content fields from projects table');

    } catch (error) {
      console.error('❌ Error removing structured content fields:', error);
      throw error;
    }
  }
};