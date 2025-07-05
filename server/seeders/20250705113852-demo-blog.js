'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('blog_posts', [
      {
        id: 1,
        title: 'The Future of Web Development: Trends to Watch in 2025',
        slug: 'future-web-development-trends-2025',
        excerpt: 'Explore the cutting-edge trends shaping web development in 2025, from AI integration to progressive web apps and serverless architecture.',
        content: `<h2>Introduction</h2>
        <p>As we move deeper into 2025, web development continues to evolve at a rapid pace. New technologies, frameworks, and methodologies are reshaping how we build and deploy web applications. In this comprehensive guide, we'll explore the most significant trends that are defining the future of web development.</p>

        <h2>1. AI-Powered Development Tools</h2>
        <p>Artificial Intelligence is revolutionizing the development process. From GitHub Copilot to AI-powered testing tools, developers are leveraging machine learning to write better code faster. AI is helping with:</p>
        <ul>
          <li>Automated code completion and suggestions</li>
          <li>Bug detection and fixing</li>
          <li>Performance optimization</li>
          <li>Automated testing and quality assurance</li>
        </ul>

        <h2>2. Progressive Web Apps (PWAs) Go Mainstream</h2>
        <p>Progressive Web Apps are becoming the standard for mobile-first development. With improved browser support and enhanced capabilities, PWAs offer native app-like experiences while maintaining web accessibility.</p>

        <h2>3. Serverless Architecture Adoption</h2>
        <p>Serverless computing is transforming how we deploy and scale applications. With platforms like AWS Lambda, Vercel, and Netlify Functions, developers can focus on code while infrastructure management is handled automatically.</p>

        <h2>Conclusion</h2>
        <p>The web development landscape in 2025 is more exciting than ever. By staying informed about these trends and adapting to new technologies, developers can create more efficient, scalable, and user-friendly applications.</p>`,
        featured_image: '/uploads/blog/web-development-trends-2025.jpg',
        reading_time: 8,
        word_count: 1200,
        category: 'Web Development',
        tags: JSON.stringify(['web development', 'trends', '2025', 'AI', 'PWA', 'serverless']),
        status: 'published',
        featured: true,
        published_at: new Date('2025-01-15'),
        author_name: 'Rajesh Kumar',
        author_id: 1,
        view_count: 324,
        like_count: 45,
        share_count: 23,
        seo_title: 'Web Development Trends 2025 | Future of Development',
        seo_description: 'Top web development trends for 2025 including AI tools, PWAs, serverless architecture, and emerging technologies shaping the future.',
        seo_keywords: JSON.stringify(['web development trends', '2025 web development', 'AI development tools', 'progressive web apps', 'serverless architecture']),
        og_image: '/uploads/blog/web-development-trends-2025-og.jpg',
        canonical_url: 'https://gsinfotech.com/blog/future-web-development-trends-2025',
        robots: 'index, follow',
        article_schema: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          'headline': 'The Future of Web Development: Trends to Watch in 2025',
          'author': {
            '@type': 'Person',
            'name': 'Rajesh Kumar'
          },
          'datePublished': '2025-01-15',
          'image': '/uploads/blog/web-development-trends-2025-og.jpg'
        }),
        created_at: new Date('2025-01-15'),
        updated_at: new Date('2025-01-15')
      },
      {
        id: 2,
        title: 'Building Scalable E-Commerce Solutions: A Complete Guide',
        slug: 'building-scalable-ecommerce-solutions-guide',
        excerpt: 'Learn how to build robust, scalable e-commerce platforms that can handle high traffic and provide excellent user experiences.',
        content: `<h2>Understanding E-Commerce Scalability</h2>
        <p>Building a scalable e-commerce platform requires careful planning and the right technology choices. In this guide, we'll walk through the essential components and best practices for creating e-commerce solutions that grow with your business.</p>

        <h2>Architecture Considerations</h2>
        <p>A well-designed architecture is the foundation of any scalable e-commerce platform. Key considerations include:</p>
        <ul>
          <li>Microservices architecture for modularity</li>
          <li>Database optimization and caching strategies</li>
          <li>CDN implementation for global content delivery</li>
          <li>Load balancing and auto-scaling</li>
        </ul>

        <h2>Technology Stack Recommendations</h2>
        <p>Choosing the right technology stack is crucial for long-term success. We recommend considering modern frameworks and cloud-native solutions that can adapt to changing requirements.</p>

        <h2>Performance Optimization</h2>
        <p>Performance is critical for e-commerce success. Slow loading times directly impact conversion rates and user satisfaction. Focus on optimizing images, implementing lazy loading, and minimizing JavaScript bundle sizes.</p>`,
        featured_image: '/uploads/blog/scalable-ecommerce-guide.jpg',
        reading_time: 12,
        word_count: 1800,
        category: 'E-Commerce',
        tags: JSON.stringify(['e-commerce', 'scalability', 'architecture', 'performance', 'development']),
        status: 'published',
        featured: true,
        published_at: new Date('2025-01-10'),
        author_name: 'Priya Sharma',
        author_id: 2,
        view_count: 189,
        like_count: 28,
        share_count: 15,
        seo_title: 'Scalable E-Commerce Guide | Build Better Stores',
        seo_description: 'Guide to building scalable e-commerce solutions with modern architecture, performance optimization, and best practices.',
        seo_keywords: JSON.stringify(['e-commerce development', 'scalable architecture', 'online store development', 'e-commerce platform']),
        og_image: '/uploads/blog/scalable-ecommerce-guide-og.jpg',
        canonical_url: 'https://gsinfotech.com/blog/building-scalable-ecommerce-solutions-guide',
        robots: 'index, follow',
        article_schema: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          'headline': 'Building Scalable E-Commerce Solutions: A Complete Guide',
          'author': {
            '@type': 'Person',
            'name': 'Priya Sharma'
          },
          'datePublished': '2025-01-10',
          'image': '/uploads/blog/scalable-ecommerce-guide-og.jpg'
        }),
        created_at: new Date('2025-01-10'),
        updated_at: new Date('2025-01-10')
      },
      {
        id: 3,
        title: 'Mobile App Development Best Practices for 2025',
        slug: 'mobile-app-development-best-practices-2025',
        excerpt: 'Discover the latest best practices for mobile app development, including cross-platform frameworks, performance optimization, and user experience design.',
        content: `<h2>Mobile Development Landscape</h2>
        <p>Mobile app development continues to evolve with new frameworks, tools, and user expectations. This guide covers the essential best practices for creating successful mobile applications in 2025.</p>

        <h2>Cross-Platform vs Native Development</h2>
        <p>The choice between cross-platform and native development depends on your specific requirements. React Native and Flutter have matured significantly, offering near-native performance with code reusability benefits.</p>

        <h2>Performance Optimization Strategies</h2>
        <ul>
          <li>Efficient image loading and caching</li>
          <li>Lazy loading for large datasets</li>
          <li>Memory management best practices</li>
          <li>Battery optimization techniques</li>
        </ul>

        <h2>User Experience Design</h2>
        <p>Great mobile apps prioritize user experience above all else. Focus on intuitive navigation, responsive design, and accessibility to create apps that users love.</p>`,
        featured_image: '/uploads/blog/mobile-app-best-practices.jpg',
        reading_time: 6,
        word_count: 900,
        category: 'Mobile Development',
        tags: JSON.stringify(['mobile development', 'best practices', 'React Native', 'Flutter', 'UX design']),
        status: 'published',
        featured: false,
        published_at: new Date('2025-01-05'),
        author_name: 'Amit Patel',
        author_id: 3,
        view_count: 145,
        like_count: 19,
        share_count: 8,
        seo_title: 'Mobile App Best Practices 2025 | Complete Guide',
        seo_description: 'Latest mobile app development best practices for 2025, including cross-platform frameworks, performance tips, and UX design.',
        seo_keywords: JSON.stringify(['mobile app development', 'mobile development best practices', 'React Native', 'Flutter', 'mobile UX']),
        og_image: '/uploads/blog/mobile-app-best-practices-og.jpg',
        canonical_url: 'https://gsinfotech.com/blog/mobile-app-development-best-practices-2025',
        robots: 'index, follow',
        article_schema: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          'headline': 'Mobile App Development Best Practices for 2025',
          'author': {
            '@type': 'Person',
            'name': 'Amit Patel'
          },
          'datePublished': '2025-01-05',
          'image': '/uploads/blog/mobile-app-best-practices-og.jpg'
        }),
        created_at: new Date('2025-01-05'),
        updated_at: new Date('2025-01-05')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('blog_posts', null, {});
  }
};