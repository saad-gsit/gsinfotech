const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./models');

require('dotenv').config();

const app = express();

// Trust proxy (for production)
app.set('trust proxy', 1);

// Enhanced Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// CORS Configuration
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            process.env.CORS_ORIGIN
        ].filter(Boolean);

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 900
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'GS Infotech API Server Running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
            host: process.env.DB_HOST,
            name: process.env.DB_NAME,
            port: process.env.DB_PORT
        }
    });
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'GS Infotech Enhanced API',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: {
            health: '/api/health',
            projects: '/api/projects',
            team: '/api/team',
            blog: '/api/blog',
            services: '/api/services',
            contact: '/api/contact'
        }
    });
});

// Test database connection endpoint

app.get('/api/db-test', async (req, res) => {
    try {
        const isConnected = await db.testConnection();

        if (isConnected) {
            // Use simpler queries that work with all MySQL versions
            const [dbResult] = await db.sequelize.query('SELECT DATABASE() as current_db');
            const [versionResult] = await db.sequelize.query('SELECT VERSION() as mysql_version');
            const [timeResult] = await db.sequelize.query('SELECT NOW() as server_time');

            res.json({
                status: 'success',
                message: 'Database connection successful! ✅',
                database: {
                    name: dbResult[0].current_db,
                    mysql_version: versionResult[0].mysql_version,
                    server_time: timeResult[0].server_time
                },
                sequelize: {
                    dialect: db.sequelize.getDialect(),
                    version: db.Sequelize.version
                },
                environment: process.env.NODE_ENV,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Database connection failed ❌'
            });
        }
    } catch (error) {
        console.error('Database test error:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed ❌',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Database error',
            timestamp: new Date().toISOString()
        });
    }
});
  

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'API endpoint not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';


const startServer = async () => {
    try {
        // Test database connection on startup
        console.log('🔌 Testing database connection...');
        const isConnected = await db.testConnection();

        if (!isConnected) {
            console.error('❌ Database connection failed. Please check your MySQL server and credentials.');
            console.log('💡 Make sure:');
            console.log('   - MySQL server is running');
            console.log('   - Database "gsinfotech_db" exists');
            console.log('   - Credentials in .env are correct');
            process.exit(1);
        }

        // Start the server
        app.listen(PORT, HOST, () => {
            console.log(`
  🚀 GS Infotech Enhanced Server Started!
  📍 Environment: ${process.env.NODE_ENV}
  🌐 Server: http://${HOST}:${PORT}
  📊 Health Check: http://${HOST}:${PORT}/api/health
  📖 API Info: http://${HOST}:${PORT}/api
  🔧 DB Test: http://${HOST}:${PORT}/api/db-test
  💾 Database: Connected to ${process.env.DB_NAME}
  ⏰ Started at: ${new Date().toISOString()}
        `);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};
startServer();  

module.exports = app;