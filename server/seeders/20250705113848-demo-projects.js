'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('projects', [
      {
        id: 1,
        title: 'E-Commerce Platform for Fashion Retailer',
        slug: 'ecommerce-platform-fashion-retailer',
        description: 'A comprehensive e-commerce solution built for a leading fashion retailer with advanced inventory management, multi-payment gateway integration, and responsive design.',
        short_description: 'Modern e-commerce platform with advanced features for fashion retail business.',
        content: `<h2>Project Overview</h2>
        <p>We developed a cutting-edge e-commerce platform that transformed our client's online presence and significantly boosted their sales. The platform features a modern, responsive design that provides an exceptional shopping experience across all devices.</p>
        
        <h3>Key Features</h3>
        <ul>
          <li>Advanced product catalog with filtering and search</li>
          <li>Multi-payment gateway integration (Stripe, PayPal, Apple Pay)</li>
          <li>Real-time inventory management</li>
          <li>Customer reviews and ratings system</li>
          <li>Wishlist and shopping cart persistence</li>
          <li>Order tracking and management</li>
          <li>Admin dashboard with analytics</li>
        </ul>
        
        <h3>Technical Implementation</h3>
        <p>Built using React.js for the frontend with Node.js and Express.js for the backend. MySQL database ensures reliable data storage, while Redis provides fast caching for improved performance.</p>`,
        featured_image: '/uploads/projects/ecommerce-fashion-main.jpg',
        gallery: JSON.stringify([
          '/uploads/projects/ecommerce-fashion-1.jpg',
          '/uploads/projects/ecommerce-fashion-2.jpg',
          '/uploads/projects/ecommerce-fashion-3.jpg'
        ]),
        technologies: JSON.stringify(['React.js', 'Node.js', 'Express.js', 'MySQL', 'Redis', 'Stripe API', 'AWS S3']),
        category: 'e_commerce',
        status: 'published',
        featured: true,
        client_name: 'StyleHub Fashion',
        project_url: 'https://stylehub-demo.gsinfotech.com',
        github_url: null,
        completion_date: '2024-10-15',
        view_count: 156,
        seo_title: 'E-Commerce Platform Development | Fashion Retailer',
        seo_description: 'Modern e-commerce platform for fashion retailer with advanced features, resulting in 200% increase in online sales.',
        seo_keywords: JSON.stringify(['e-commerce development', 'fashion website', 'online store', 'react development']),
        og_image: '/uploads/projects/ecommerce-fashion-og.jpg',
        canonical_url: 'https://gsinfotech.com/projects/ecommerce-platform-fashion-retailer',
        robots: 'index, follow',
        created_at: new Date('2024-10-20'),
        updated_at: new Date('2024-10-20')
      },
      {
        id: 2,
        title: 'Healthcare Management System',
        slug: 'healthcare-management-system',
        description: 'Comprehensive healthcare management system for clinics and hospitals with patient records, appointment scheduling, and billing integration.',
        short_description: 'Complete healthcare solution for patient management and clinic operations.',
        content: `<h2>Healthcare Innovation</h2>
        <p>A robust healthcare management system designed to streamline clinic operations and improve patient care. The system handles everything from patient registration to billing and reporting.</p>
        
        <h3>Core Features</h3>
        <ul>
          <li>Patient registration and medical history</li>
          <li>Appointment scheduling and calendar management</li>
          <li>Electronic medical records (EMR)</li>
          <li>Prescription management</li>
          <li>Billing and insurance processing</li>
          <li>Laboratory results integration</li>
          <li>Doctor and staff management</li>
          <li>Reporting and analytics dashboard</li>
        </ul>`,
        featured_image: '/uploads/projects/healthcare-system-main.jpg',
        gallery: JSON.stringify([
          '/uploads/projects/healthcare-system-1.jpg',
          '/uploads/projects/healthcare-system-2.jpg'
        ]),
        technologies: JSON.stringify(['Angular', 'Node.js', 'PostgreSQL', 'Socket.io', 'Docker', 'AWS']),
        category: 'web_application',
        status: 'published',
        featured: true,
        client_name: 'MediCare Plus',
        project_url: 'https://medicare-demo.gsinfotech.com',
        github_url: null,
        completion_date: '2024-09-30',
        view_count: 89,
        seo_title: 'Healthcare Management System | Medical Software',
        seo_description: 'Healthcare management system with patient records, scheduling, and billing. Streamline clinic operations with medical software.',
        seo_keywords: JSON.stringify(['healthcare software', 'medical management system', 'clinic software', 'patient records']),
        og_image: '/uploads/projects/healthcare-system-og.jpg',
        canonical_url: 'https://gsinfotech.com/projects/healthcare-management-system',
        robots: 'index, follow',
        created_at: new Date('2024-10-01'),
        updated_at: new Date('2024-10-01')
      },
      {
        id: 3,
        title: 'Real Estate Mobile App',
        slug: 'real-estate-mobile-app',
        description: 'Cross-platform mobile application for real estate listings with advanced search, virtual tours, and agent connectivity.',
        short_description: 'Modern real estate app with virtual tours and advanced property search.',
        content: `<h2>Mobile Real Estate Solution</h2>
        <p>A feature-rich mobile application that revolutionizes property searching and buying experience. Built with React Native for both iOS and Android platforms.</p>
        
        <h3>App Features</h3>
        <ul>
          <li>Advanced property search with filters</li>
          <li>Interactive map integration</li>
          <li>Virtual property tours</li>
          <li>Mortgage calculator</li>
          <li>Agent contact and messaging</li>
          <li>Favorites and property comparison</li>
          <li>Push notifications for new listings</li>
          <li>Offline property viewing</li>
        </ul>`,
        featured_image: '/uploads/projects/realestate-app-main.jpg',
        gallery: JSON.stringify([
          '/uploads/projects/realestate-app-1.jpg',
          '/uploads/projects/realestate-app-2.jpg',
          '/uploads/projects/realestate-app-3.jpg'
        ]),
        technologies: JSON.stringify(['React Native', 'Redux', 'Node.js', 'MongoDB', 'Google Maps API', 'Firebase']),
        category: 'mobile_application',
        status: 'published',
        featured: false,
        client_name: 'PropertyFinder Pro',
        project_url: 'https://apps.apple.com/app/propertyfinder-pro',
        github_url: null,
        completion_date: '2024-08-20',
        view_count: 67,
        seo_title: 'Real Estate Mobile App | Property Search App',
        seo_description: 'Real estate mobile app with virtual tours, map search, and agent connectivity. Available on iOS and Android platforms.',
        seo_keywords: JSON.stringify(['real estate app', 'property search app', 'mobile app development', 'react native']),
        og_image: '/uploads/projects/realestate-app-og.jpg',
        canonical_url: 'https://gsinfotech.com/projects/real-estate-mobile-app',
        robots: 'index, follow',
        created_at: new Date('2024-08-25'),
        updated_at: new Date('2024-08-25')
      },
      {
        id: 4,
        title: 'Enterprise CRM Dashboard',
        slug: 'enterprise-crm-dashboard',
        description: 'Advanced CRM system with analytics dashboard, lead management, and sales pipeline tracking for enterprise clients.',
        short_description: 'Comprehensive CRM solution with advanced analytics and sales pipeline management.',
        content: `<h2>Enterprise CRM Solution</h2>
        <p>A powerful customer relationship management system designed for enterprise-level businesses with complex sales processes and multiple team collaborations.</p>
        
        <h3>CRM Features</h3>
        <ul>
          <li>Lead capture and qualification</li>
          <li>Sales pipeline management</li>
          <li>Customer interaction tracking</li>
          <li>Advanced reporting and analytics</li>
          <li>Team collaboration tools</li>
          <li>Email integration and automation</li>
          <li>Custom field and workflow creation</li>
          <li>API integrations with third-party tools</li>
        </ul>`,
        featured_image: '/uploads/projects/crm-dashboard-main.jpg',
        gallery: JSON.stringify([
          '/uploads/projects/crm-dashboard-1.jpg',
          '/uploads/projects/crm-dashboard-2.jpg'
        ]),
        technologies: JSON.stringify(['Vue.js', 'Laravel', 'MySQL', 'Elasticsearch', 'Redis', 'Docker']),
        category: 'web_application',
        status: 'published',
        featured: false,
        client_name: 'SalesForce Enterprise',
        project_url: 'https://crm-demo.gsinfotech.com',
        github_url: null,
        completion_date: '2024-07-10',
        view_count: 42,
        seo_title: 'Enterprise CRM Development | Customer Management',
        seo_description: 'Enterprise CRM system with advanced analytics, sales pipeline tracking, and team collaboration features.',
        seo_keywords: JSON.stringify(['CRM development', 'enterprise software', 'sales management', 'customer management']),
        og_image: '/uploads/projects/crm-dashboard-og.jpg',
        canonical_url: 'https://gsinfotech.com/projects/enterprise-crm-dashboard',
        robots: 'index, follow',
        created_at: new Date('2024-07-15'),
        updated_at: new Date('2024-07-15')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('projects', null, {});
  }
};