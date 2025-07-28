// server/check-schema.js
const db = require('./models');

async function checkSchema() {
    try {
        console.log('🔍 Checking admin_users table schema...');

        // Raw query to check table structure
        const [results] = await db.sequelize.query('DESCRIBE admin_users');

        console.log('📋 Database columns:');
        results.forEach(column => {
            console.log(`  - ${column.Field} (${column.Type})`);
        });

        console.log('\n🔍 Checking if admin user exists...');

        // Try raw query first
        const [adminUsers] = await db.sequelize.query('SELECT * FROM admin_users LIMIT 1');

        if (adminUsers.length > 0) {
            console.log('✅ Found admin user:', adminUsers[0]);
        } else {
            console.log('❌ No admin users found');
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Error checking schema:', error.message);
        process.exit(1);
    }
}

checkSchema();