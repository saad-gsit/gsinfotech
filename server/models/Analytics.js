module.exports = (sequelize, DataTypes) => {
    const Analytics = sequelize.define('Analytics', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        event_type: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        page_path: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        user_id: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        session_id: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        ip_address: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        user_agent: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        referrer: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        device_type: {
            type: DataTypes.ENUM('desktop', 'mobile', 'tablet'),
            allowNull: true
        },
        browser: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        os: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        country: {
            type: DataTypes.STRING(2),
            allowNull: true
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: true
        },

        // Event data
        event_data: {
            type: DataTypes.JSON,
            allowNull: true
        },

        // Performance metrics
        page_load_time: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        // Timestamps
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'analytics',
        timestamps: false, // We handle timestamp manually
        indexes: [
            {
                fields: ['event_type']
            },
            {
                fields: ['page_path']
            },
            {
                fields: ['timestamp']
            },
            {
                fields: ['session_id']
            }
        ]
    });

    return Analytics;
  };