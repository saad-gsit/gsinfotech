'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('seo_metadata', [
      {
        page_path: '/',
        title: 'GS Infotech - Leading Software Development Company',
        description: 'Expert software development services including web development, mobile apps, and custom software solutions. Transform your business.',
        keywords: JSON.stringify(['software development', 'web development', 'mobile app development', 'custom software', 'technology solutions']),
        og_title: 'GS Infotech - Leading Software Development Company',
        og_description: 'Expert software development services including web development, mobile apps, and custom software solutions. Transform your business.',
        og_image: '/uploads/seo/homepage-og.jpg',
        og_type: 'website',
        twitter_card: 'summary_large_image',
        canonical_url: 'https://gsinfotech.com/',
        robots: 'index, follow',
        structured_data: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          'name': 'GS Infotech',
          'description': 'Leading software development company specializing in web development, mobile apps, and custom software solutions.',
          'url': 'https://gsinfotech.com',
          'logo': 'https://gsinfotech.com/logo.png',
          'contactPoint': {
            '@type': 'ContactPoint',
            'telephone': '+1-555-123-4567',
            'contactType': 'Customer Service',
            'email': 'info@gsinfotech.com'
          },
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': '123 Tech Street',
            'addressLocality': 'Digital City',
            'addressRegion': 'TC',
            'postalCode': '12345',
            'addressCountry': 'US'
          },
          'sameAs': [
            'https://facebook.com/gsinfotech',
            'https://twitter.com/gsinfotech',
            'https://linkedin.com/company/gsinfotech'
          ]
        }),
        priority: 1.0,
        change_frequency: 'weekly',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        page_path: '/about',
        title: 'About GS Infotech - Our Story & Team | Software Dev',
        description: 'Learn about GS Infotech journey, mission, and expert team. Discover why we are the trusted choice for software development.',
        keywords: JSON.stringify(['about us', 'software development team', 'company story', 'technology experts', 'development experience']),
        og_title: 'About GS Infotech - Our Story & Expert Team',
        og_description: 'Learn about GS Infotech\'s journey, mission, and expert team. Discover why we\'re the trusted choice for software development.',
        og_image: '/uploads/seo/about-og.jpg',
        og_type: 'website',
        twitter_card: 'summary_large_image',
        canonical_url: 'https://gsinfotech.com/about',
        robots: 'index, follow',
        structured_data: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          'mainEntity': {
            '@type': 'Organization',
            'name': 'GS Infotech',
            'foundingDate': '2015',
            'numberOfEmployees': '50+'
          }
        }),
        priority: 0.8,
        change_frequency: 'monthly',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        page_path: '/services',
        title: 'Software Development Services | Web, Mobile & Custom',
        description: 'Comprehensive software development services including web development, mobile apps, custom software, UI/UX design, and enterprise solutions.',
        keywords: JSON.stringify(['software development services', 'web development', 'mobile app development', 'custom software', 'enterprise solutions']),
        og_title: 'Software Development Services | GS Infotech',
        og_description: 'Comprehensive software development services including web development, mobile apps, custom software, and enterprise solutions.',
        og_image: '/uploads/seo/services-og.jpg',
        og_type: 'website',
        twitter_card: 'summary_large_image',
        canonical_url: 'https://gsinfotech.com/services',
        robots: 'index, follow',
        structured_data: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Service',
          'provider': {
            '@type': 'Organization',
            'name': 'GS Infotech'
          },
          'hasOfferCatalog': {
            '@type': 'OfferCatalog',
            'name': 'Software Development Services',
            'itemListElement': [
              {
                '@type': 'Offer',
                'itemOffered': {
                  '@type': 'Service',
                  'name': 'Web Development'
                }
              },
              {
                '@type': 'Offer',
                'itemOffered': {
                  '@type': 'Service',
                  'name': 'Mobile App Development'
                }
              }
            ]
          }
        }),
        priority: 0.9,
        change_frequency: 'monthly',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        page_path: '/services/web-development',
        title: 'Web Development Services | Custom Websites & Apps',
        description: 'Professional web development services using React, Node.js, and modern technologies. Custom websites and web applications built for your business needs.',
        keywords: JSON.stringify(['web development', 'custom websites', 'web applications', 'React development', 'Node.js development']),
        og_title: 'Web Development Services | GS Infotech',
        og_description: 'Professional web development services using React, Node.js, and modern technologies. Custom websites and web applications.',
        og_image: '/uploads/seo/web-development-og.jpg',
        og_type: 'website',
        twitter_card: 'summary_large_image',
        canonical_url: 'https://gsinfotech.com/services/web-development',
        robots: 'index, follow',
        structured_data: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Service',
          'name': 'Web Development Services',
          'description': 'Professional web development services using React, Node.js, and modern technologies.',
          'provider': {
            '@type': 'Organization',
            'name': 'GS Infotech'
          }
        }),
        priority: 0.8,
        change_frequency: 'monthly',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        page_path: '/services/mobile-app-development',
        title: 'Mobile App Development | iOS & Android Apps | React Native',
        description: 'Professional mobile app development services using React Native and Flutter. Cross-platform apps for iOS and Android with native performance.',
        keywords: JSON.stringify(['mobile app development', 'iOS app development', 'Android app development', 'React Native', 'Flutter']),
        og_title: 'Mobile App Development Services | GS Infotech',
        og_description: 'Professional mobile app development using React Native and Flutter. Cross-platform apps with native performance.',
        og_image: '/uploads/seo/mobile-development-og.jpg',
        og_type: 'website',
        twitter_card: 'summary_large_image',
        canonical_url: 'https://gsinfotech.com/services/mobile-app-development',
        robots: 'index, follow',
        structured_data: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Service',
          'name': 'Mobile App Development Services',
          'description': 'Professional mobile app development using React Native and Flutter.',
          'provider': {
            '@type': 'Organization',
            'name': 'GS Infotech'
          }
        }),
        priority: 0.8,
        change_frequency: 'monthly',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        page_path: '/projects',
        title: 'Software Development Portfolio | Projects & Cases',
        description: 'Explore our software development portfolio featuring successful projects in e-commerce, healthcare, real estate, and enterprise solutions.',
        keywords: JSON.stringify(['software development portfolio', 'project showcase', 'case studies', 'development examples']),
        og_title: 'Software Development Portfolio | GS Infotech Projects',
        og_description: 'Explore our software development portfolio featuring successful projects in various industries.',
        og_image: '/uploads/seo/projects-og.jpg',
        og_type: 'website',
        twitter_card: 'summary_large_image',
        canonical_url: 'https://gsinfotech.com/projects',
        robots: 'index, follow',
        structured_data: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          'name': 'Software Development Portfolio',
          'description': 'Explore our software development portfolio featuring successful projects.',
          'provider': {
            '@type': 'Organization',
            'name': 'GS Infotech'
          }
        }),
        priority: 0.7,
        change_frequency: 'weekly',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        page_path: '/team',
        title: 'Our Development Team | Expert Software Engineers',
        description: 'Meet our talented team of software engineers, designers, and technology experts who bring your projects to life with cutting-edge solutions.',
        keywords: JSON.stringify(['development team', 'software engineers', 'technology experts', 'our team']),
        og_title: 'Our Expert Development Team | GS Infotech',
        og_description: 'Meet our talented team of software engineers, designers, and technology experts.',
        og_image: '/uploads/seo/team-og.jpg',
        og_type: 'website',
        twitter_card: 'summary_large_image',
        canonical_url: 'https://gsinfotech.com/team',
        robots: 'index, follow',
        structured_data: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          'name': 'Our Development Team',
          'description': 'Meet our talented team of software engineers, designers, and technology experts.',
          'provider': {
            '@type': 'Organization',
            'name': 'GS Infotech'
          }
        }),
        priority: 0.6,
        change_frequency: 'monthly',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        page_path: '/blog',
        title: 'Technology Blog | Software Development Insights',
        description: 'Stay updated with the latest in software development, web technologies, mobile development, and programming tutorials from our expert team.',
        keywords: JSON.stringify(['technology blog', 'software development blog', 'programming tutorials', 'web development insights']),
        og_title: 'Technology Blog | GS Infotech Insights',
        og_description: 'Stay updated with the latest in software development, web technologies, and programming tutorials.',
        og_image: '/uploads/seo/blog-og.jpg',
        og_type: 'website',
        twitter_card: 'summary_large_image',
        canonical_url: 'https://gsinfotech.com/blog',
        robots: 'index, follow',
        structured_data: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Blog',
          'name': 'GS Infotech Technology Blog',
          'description': 'Stay updated with the latest in software development and web technologies.',
          'publisher': {
            '@type': 'Organization',
            'name': 'GS Infotech'
          }
        }),
        priority: 0.7,
        change_frequency: 'daily',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        page_path: '/contact',
        title: 'Contact GS Infotech | Get Your Software Dev Quote',
        description: 'Ready to start your software development project? Contact GS Infotech for a free consultation and quote. Let\'s bring your ideas to life.',
        keywords: JSON.stringify(['contact us', 'software development quote', 'free consultation', 'project inquiry']),
        og_title: 'Contact GS Infotech | Start Your Project Today',
        og_description: 'Ready to start your software development project? Contact us for a free consultation and quote.',
        og_image: '/uploads/seo/contact-og.jpg',
        og_type: 'website',
        twitter_card: 'summary_large_image',
        canonical_url: 'https://gsinfotech.com/contact',
        robots: 'index, follow',
        structured_data: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          'mainEntity': {
            '@type': 'Organization',
            'name': 'GS Infotech',
            'contactPoint': {
              '@type': 'ContactPoint',
              'telephone': '+1-555-123-4567',
              'contactType': 'Customer Service',
              'email': 'info@gsinfotech.com',
              'hoursAvailable': 'Mo-Fr 09:00-18:00'
            }
          }
        }),
        priority: 0.8,
        change_frequency: 'monthly',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('seo_metadata', null, {});
  }
};