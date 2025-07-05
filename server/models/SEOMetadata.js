module.exports = (sequelize, DataTypes) => {
    const SEOMetadata = sequelize.define('SEOMetadata', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        page_path: {
            type: DataTypes.STRING(500),
            allowNull: false,
            unique: true
        },
        title: {
            type: DataTypes.STRING(60),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(160),
            allowNull: false
        },
        keywords: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: []
        },
        og_title: {
            type: DataTypes.STRING(60),
            allowNull: true
        },
        og_description: {
            type: DataTypes.STRING(160),
            allowNull: true
        },
        og_image: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        og_type: {
            type: DataTypes.STRING(50),
            defaultValue: 'website'
        },
        twitter_card: {
            type: DataTypes.STRING(50),
            defaultValue: 'summary_large_image'
        },
        canonical_url: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        robots: {
            type: DataTypes.STRING(100),
            defaultValue: 'index, follow'
        },
        structured_data: {
            type: DataTypes.JSON,
            allowNull: true
        },
        priority: {
            type: DataTypes.DECIMAL(2, 1),
            defaultValue: 0.5,
            validate: {
                min: 0.0,
                max: 1.0
            }
        },
        change_frequency: {
            type: DataTypes.ENUM('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'),
            defaultValue: 'monthly'
        },
        is_active: {
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
        tableName: 'seo_metadata',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return SEOMetadata;
  };