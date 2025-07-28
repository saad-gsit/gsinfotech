// client/src/utils/connectionTest.js - Test API connection
export const testAPIConnection = async () => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const results = {};

    // Test endpoints
    const endpoints = [
        { name: 'Health Check', url: '/health', method: 'GET' },
        { name: 'Database Test', url: '/db-test', method: 'GET' },
        { name: 'Projects', url: '/projects', method: 'GET' },
        { name: 'Team', url: '/team', method: 'GET' },
        { name: 'Blog', url: '/blog', method: 'GET' },
        { name: 'API Info', url: '', method: 'GET' },
    ];

    console.log('🧪 Starting API Connection Tests...');
    console.log(`📍 Base URL: ${baseURL}`);
    console.log('─'.repeat(50));

    for (const endpoint of endpoints) {
        try {
            const startTime = Date.now();
            const response = await fetch(`${baseURL}${endpoint.url}`, {
                method: endpoint.method,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const endTime = Date.now();
            const duration = endTime - startTime;

            if (response.ok) {
                const data = await response.json();
                results[endpoint.name] = {
                    status: 'success',
                    statusCode: response.status,
                    duration: `${duration}ms`,
                    data: data,
                };
                console.log(`✅ ${endpoint.name}: ${response.status} (${duration}ms)`);
            } else {
                const errorData = await response.text();
                results[endpoint.name] = {
                    status: 'error',
                    statusCode: response.status,
                    duration: `${duration}ms`,
                    error: errorData,
                };
                console.log(`❌ ${endpoint.name}: ${response.status} (${duration}ms)`);
            }
        } catch (error) {
            results[endpoint.name] = {
                status: 'failed',
                error: error.message,
            };
            console.log(`💥 ${endpoint.name}: Connection failed - ${error.message}`);
        }
    }

    console.log('─'.repeat(50));
    console.log('🏁 API Connection Tests Complete');

    return results;
};

// Quick test function you can call from browser console
export const quickTest = async () => {
    console.clear();
    const results = await testAPIConnection();

    // Summary
    const successCount = Object.values(results).filter(r => r.status === 'success').length;
    const totalCount = Object.keys(results).length;

    console.log(`\n📊 Summary: ${successCount}/${totalCount} endpoints working`);

    if (successCount === totalCount) {
        console.log('🎉 All API endpoints are working correctly!');
    } else {
        console.log('⚠️ Some endpoints need attention');
    }

    return results;
};

// Auto-run test when imported (for development)
if (import.meta.env.DEV) {
    console.log('🔧 Development mode: API connection test available');
    console.log('Run quickTest() in console to test API connection');

    // Make it available globally for testing
    window.quickTest = quickTest;
    window.testAPIConnection = testAPIConnection;
}