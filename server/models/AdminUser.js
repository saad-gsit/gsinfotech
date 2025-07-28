// server/models/AdminUser.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
    const AdminUser = sequelize.define('AdminUser', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [6, 100]
            }
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [2, 50]
            }
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [2, 50]
            }
        },
        role: {
            type: DataTypes.ENUM('super_admin', 'admin', 'editor'),
            defaultValue: 'admin',
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true
        },
        loginAttempts: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        lockUntil: {
            type: DataTypes.DATE,
            allowNull: true
        },
        profileImage: {
            type: DataTypes.STRING,
            allowNull: true
        },
        permissions: {
            type: DataTypes.JSON,
            defaultValue: {
                projects: { read: true, write: true, delete: false },
                blog: { read: true, write: true, delete: false },
                team: { read: true, write: true, delete: false },
                analytics: { read: true, write: false, delete: false },
                settings: { read: false, write: false, delete: false }
            }
        }
    }, {
        tableName: 'admin_users',
        timestamps: true,
        // Keep field names as-is (camelCase)
        underscored: false,
        freezeTableName: true,
        indexes: [
            {
                unique: true,
                fields: ['email']
            }
        ],
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    const salt = await bcrypt.genSalt(12);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt(12);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            }
        }
    });

    // Instance methods
    AdminUser.prototype.validatePassword = async function (password) {
        return await bcrypt.compare(password, this.password);
    };

    AdminUser.prototype.generateToken = function () {
        return jwt.sign(
            {
                id: this.id,
                email: this.email,
                role: this.role,
                permissions: this.permissions
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
    };

    AdminUser.prototype.isLocked = function () {
        return !!(this.lockUntil && this.lockUntil > Date.now());
    };

    AdminUser.prototype.incrementLoginAttempts = async function () {
        const maxAttempts = 5;
        const lockTime = 30 * 60 * 1000; // 30 minutes

        // If we have previous lock that has expired, restart count at 1
        if (this.lockUntil && this.lockUntil < Date.now()) {
            return this.update({
                loginAttempts: 1,
                lockUntil: null
            });
        }

        // If we've reached max attempts and not locked yet, lock account
        const newAttempts = this.loginAttempts + 1;
        const updates = {
            loginAttempts: newAttempts
        };

        if (newAttempts >= maxAttempts && !this.isLocked()) {
            updates.lockUntil = new Date(Date.now() + lockTime);
        }

        return this.update(updates);
    };

    AdminUser.prototype.resetLoginAttempts = async function () {
        return this.update({
            loginAttempts: 0,
            lockUntil: null,
            lastLogin: new Date()
        });
    };

    AdminUser.prototype.toJSON = function () {
        const values = Object.assign({}, this.get());
        delete values.password;
        return values;
    };

    // Class methods
    AdminUser.findByEmail = function (email) {
        return this.findOne({ where: { email: email.toLowerCase() } });
    };

    AdminUser.getPermissions = function (role) {
        const rolePermissions = {
            super_admin: {
                projects: { read: true, write: true, delete: true },
                blog: { read: true, write: true, delete: true },
                team: { read: true, write: true, delete: true },
                analytics: { read: true, write: true, delete: false },
                settings: { read: true, write: true, delete: false },
                users: { read: true, write: true, delete: true }
            },
            admin: {
                projects: { read: true, write: true, delete: true },
                blog: { read: true, write: true, delete: true },
                team: { read: true, write: true, delete: false },
                analytics: { read: true, write: false, delete: false },
                settings: { read: true, write: false, delete: false }
            },
            editor: {
                projects: { read: true, write: true, delete: false },
                blog: { read: true, write: true, delete: false },
                team: { read: true, write: false, delete: false },
                analytics: { read: true, write: false, delete: false },
                settings: { read: false, write: false, delete: false }
            }
        };

        return rolePermissions[role] || rolePermissions.editor;
    };

    return AdminUser;
};