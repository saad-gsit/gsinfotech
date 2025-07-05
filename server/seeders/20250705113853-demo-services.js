'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('services', [
      {
        id: 1,
        name: 'Web Development',
        slug: 'web-development',
        short_description: 'Custom web applications built with modern technologies for optimal performance and user experience.',
        description: 'Our web development services cover everything from simple websites to complex web applications. We use cutting-edge technologies like React, Vue.js, and Node.js to build scalable, maintainable, and high-performance web solutions.',
        icon: 'Globe',
        featured_image: '/uploads/services/web-development.jpg',
        category: 'web_development',
        features: JSON.stringify([
          'Responsive Design',
          'Progressive Web Apps',
          'E-commerce Solutions',
          'Content Management Systems',
          'API Development',
          'Database Design',
          'Performance Optimization',
          'SEO Implementation'
        ]),
        technologies: JSON.stringify(['React.js', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Next.js', 'TypeScript', 'MySQL', 'MongoDB']),
        pricing_model: 'project_based',
        starting_price: 5000.00,
        price_currency: 'USD',
        estimated_timeline: '4-12 weeks',
        display_order: 1,
        is_featured: true,
        is_active: true,
        show_in_homepage: true,
        process_steps: JSON.stringify([
          {
            step: 1,
            title: 'Discovery & Planning',
            description: 'We analyze your requirements and create a detailed project plan.'
          },
          {
            step: 2,
            title: 'Design & Prototyping',
            description: 'Our designers create wireframes and prototypes for your approval.'
          },
          {
            step: 3,
            title: 'Development',
            description: 'Our developers build your application using best practices.'
          },
          {
            step: 4,
            title: 'Testing & Deployment',
            description: 'We thoroughly test and deploy your application to production.'
          }
        ]),
        seo_title: 'Web Development Services | Custom Website Development',
        seo_description: 'Professional web development services using React, Node.js, and modern technologies. Custom websites and web applications for business.',
        seo_keywords: JSON.stringify(['web development', 'custom websites', 'React development', 'Node.js development']),
        og_image: '/uploads/services/web-development-og.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Mobile App Development',
        slug: 'mobile-app-development',
        short_description: 'Cross-platform mobile applications for iOS and Android using React Native and Flutter.',
        description: 'We develop high-quality mobile applications that work seamlessly across iOS and Android platforms. Our team specializes in React Native and Flutter to deliver native-like performance with faster development cycles.',
        icon: 'Smartphone',
        featured_image: '/uploads/services/mobile-app-development.jpg',
        category: 'mobile_development',
        features: JSON.stringify([
          'Cross-platform Development',
          'Native iOS & Android Apps',
          'App Store Optimization',
          'Push Notifications',
          'Offline Functionality',
          'Real-time Synchronization',
          'In-app Purchases',
          'Social Media Integration'
        ]),
        technologies: JSON.stringify(['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'Redux', 'TypeScript']),
        pricing_model: 'project_based',
        starting_price: 8000.00,
        price_currency: 'USD',
        estimated_timeline: '8-16 weeks',
        display_order: 2,
        is_featured: true,
        is_active: true,
        show_in_homepage: true,
        process_steps: JSON.stringify([
          {
            step: 1,
            title: 'Concept & Strategy',
            description: 'We define your app concept and development strategy.'
          },
          {
            step: 2,
            title: 'UI/UX Design',
            description: 'Creating intuitive and engaging mobile app designs.'
          },
          {
            step: 3,
            title: 'Development & Testing',
            description: 'Building and testing your app across multiple devices.'
          },
          {
            step: 4,
            title: 'App Store Launch',
            description: 'Deploying your app to App Store and Google Play.'
          }
        ]),
        seo_title: 'Mobile App Development Services | iOS & Android Apps',
        seo_description: 'Professional mobile app development using React Native and Flutter. Cross-platform apps for iOS and Android with native performance.',
        seo_keywords: JSON.stringify(['mobile app development', 'React Native', 'Flutter', 'iOS app development', 'Android app development']),
        og_image: '/uploads/services/mobile-app-development-og.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Custom Software Development',
        slug: 'custom-software-development',
        short_description: 'Tailored software solutions designed specifically for your business needs and processes.',
        description: 'Our custom software development services help businesses automate processes, improve efficiency, and gain competitive advantages through bespoke software solutions built from the ground up.',
        icon: 'Code',
        featured_image: '/uploads/services/custom-software-development.jpg',
        category: 'custom_software',
        features: JSON.stringify([
          'Business Process Automation',
          'Legacy System Modernization',
          'Third-party Integrations',
          'Scalable Architecture',
          'Cloud-native Solutions',
          'Data Analytics & Reporting',
          'Security Implementation',
          'Maintenance & Support'
        ]),
        technologies: JSON.stringify(['Python', 'Java', '.NET', 'Node.js', 'React', 'Angular', 'PostgreSQL', 'MongoDB', 'AWS', 'Azure']),
        pricing_model: 'custom',
        starting_price: 15000.00,
        price_currency: 'USD',
        estimated_timeline: '12-24 weeks',
        display_order: 3,
        is_featured: true,
        is_active: true,
        show_in_homepage: true,
        process_steps: JSON.stringify([
          {
            step: 1,
            title: 'Requirements Analysis',
            description: 'Deep dive into your business processes and requirements.'
          },
          {
            step: 2,
            title: 'Architecture Design',
            description: 'Designing scalable and maintainable software architecture.'
          },
          {
            step: 3,
            title: 'Agile Development',
            description: 'Iterative development with regular feedback and updates.'
          },
          {
            step: 4,
            title: 'Deployment & Training',
            description: 'Deploying the solution and training your team.'
          }
        ]),
        seo_title: 'Custom Software Development | Bespoke Solutions',
        seo_description: 'Custom software development services tailored to your business needs. Enterprise solutions, automation, and digital transformation.',
        seo_keywords: JSON.stringify(['custom software development', 'enterprise software', 'business automation', 'bespoke software']),
        og_image: '/uploads/services/custom-software-development-og.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'UI/UX Design',
        slug: 'ui-ux-design',
        short_description: 'User-centered design services that create intuitive and engaging digital experiences.',
        description: 'Our UI/UX design team creates beautiful, functional, and user-friendly interfaces that enhance user satisfaction and drive business results through thoughtful design and user research.',
        icon: 'Palette',
        featured_image: '/uploads/services/ui-ux-design.jpg',
        category: 'ui_ux_design',
        features: JSON.stringify([
          'User Research & Analysis',
          'Wireframing & Prototyping',
          'Visual Design',
          'Usability Testing',
          'Design Systems',
          'Responsive Design',
          'Accessibility Compliance',
          'Brand Integration'
        ]),
        technologies: JSON.stringify(['Figma', 'Adobe XD', 'Sketch', 'InVision', 'Principle', 'Framer', 'Adobe Creative Suite']),
        pricing_model: 'project_based',
        starting_price: 3000.00,
        price_currency: 'USD',
        estimated_timeline: '4-8 weeks',
        display_order: 4,
        is_featured: false,
        is_active: true,
        show_in_homepage: true,
        process_steps: JSON.stringify([
          {
            step: 1,
            title: 'Research & Discovery',
            description: 'Understanding your users and business objectives.'
          },
          {
            step: 2,
            title: 'Wireframing',
            description: 'Creating low-fidelity wireframes and user flows.'
          },
          {
            step: 3,
            title: 'Visual Design',
            description: 'Developing high-fidelity designs and prototypes.'
          },
          {
            step: 4,
            title: 'Testing & Iteration',
            description: 'User testing and design refinement.'
          }
        ]),
        seo_title: 'UI/UX Design Services | User Experience Design',
        seo_description: 'Professional UI/UX design services focused on user-centered design, usability, and creating engaging digital experiences.',
        seo_keywords: JSON.stringify(['UI/UX design', 'user experience design', 'user interface design', 'UX research']),
        og_image: '/uploads/services/ui-ux-design-og.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        name: 'Enterprise Solutions',
        slug: 'enterprise-solutions',
        short_description: 'Scalable enterprise-grade solutions for large organizations and complex business requirements.',
        description: 'We provide comprehensive enterprise solutions including ERP systems, CRM platforms, and business intelligence tools designed to handle complex workflows and large-scale operations.',
        icon: 'Building',
        featured_image: '/uploads/services/enterprise-solutions.jpg',
        category: 'enterprise_solutions',
        features: JSON.stringify([
          'ERP Systems',
          'CRM Platforms',
          'Business Intelligence',
          'Data Warehousing',
          'System Integration',
          'Workflow Automation',
          'Compliance Management',
          '24/7 Support'
        ]),
        technologies: JSON.stringify(['Java', '.NET', 'Python', 'Oracle', 'SQL Server', 'SAP', 'Salesforce', 'Power BI']),
        pricing_model: 'custom',
        starting_price: 25000.00,
        price_currency: 'USD',
        estimated_timeline: '16-32 weeks',
        display_order: 5,
        is_featured: false,
        is_active: true,
        show_in_homepage: false,
        process_steps: JSON.stringify([
          {
            step: 1,
            title: 'Enterprise Assessment',
            description: 'Comprehensive analysis of your enterprise needs.'
          },
          {
            step: 2,
            title: 'Solution Architecture',
            description: 'Designing enterprise-grade system architecture.'
          },
          {
            step: 3,
            title: 'Implementation',
            description: 'Phased implementation with minimal disruption.'
          },
          {
            step: 4,
            title: 'Integration & Support',
            description: 'System integration and ongoing enterprise support.'
          }
        ]),
        seo_title: 'Enterprise Software Solutions | Business Systems',
        seo_description: 'Enterprise software solutions including ERP, CRM, and business intelligence systems for large organizations.',
        seo_keywords: JSON.stringify(['enterprise solutions', 'ERP systems', 'CRM development', 'business intelligence']),
        og_image: '/uploads/services/enterprise-solutions-og.jpg',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('services', null, {});
  }
};