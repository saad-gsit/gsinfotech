module.exports = (sequelize, DataTypes) => {
    const CompanyInfo = sequelize.define('CompanyInfo', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        key: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        type: {
            type: DataTypes.ENUM('text', 'json', 'html', 'number', 'boolean', 'url', 'email'),
            allowNull: false,
            defaultValue: 'text'
        },
        category: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: 'general'
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        is_public: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'company_info',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return CompanyInfo;
  };