// server/seeders/YYYYMMDDHHMMSS-demo-admin-users.js
'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await queryInterface.bulkInsert('admin_users', [
      {
        email: 'admin@gsinfotech.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        isActive: true,
        permissions: JSON.stringify({
          projects: { read: true, write: true, delete: true },
          blog: { read: true, write: true, delete: true },
          team: { read: true, write: true, delete: true },
          analytics: { read: true, write: true, delete: false },
          settings: { read: true, write: true, delete: false },
          users: { read: true, write: true, delete: true }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'editor@gsinfotech.com',
        password: hashedPassword,
        firstName: 'Content',
        lastName: 'Editor',
        role: 'editor',
        isActive: true,
        permissions: JSON.stringify({
          projects: { read: true, write: true, delete: false },
          blog: { read: true, write: true, delete: false },
          team: { read: true, write: false, delete: false },
          analytics: { read: true, write: false, delete: false },
          settings: { read: false, write: false, delete: false }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('admin_users', null, {});
  }
};