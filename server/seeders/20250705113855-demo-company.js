'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('company_info', [
      {
        key: 'company_name',
        value: 'GS Infotech',
        type: 'text',
        category: 'basic',
        description: 'Company name',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'company_tagline',
        value: 'Leading Software Development Company',
        type: 'text',
        category: 'basic',
        description: 'Company tagline',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'company_description',
        value: 'GS Infotech is a leading software development company specializing in web development, mobile applications, and custom software solutions. We help businesses transform their ideas into powerful digital experiences.',
        type: 'text',
        category: 'basic',
        description: 'Company description',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'mission_statement',
        value: 'To empower businesses with innovative technology solutions that drive growth, efficiency, and success in the digital age.',
        type: 'text',
        category: 'about',
        description: 'Company mission statement',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'vision_statement',
        value: 'To be the most trusted technology partner for businesses worldwide, delivering cutting-edge solutions that shape the future of digital innovation.',
        type: 'text',
        category: 'about',
        description: 'Company vision statement',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'core_values',
        value: JSON.stringify([
          'Innovation: We embrace new technologies and creative solutions',
          'Quality: We deliver excellence in every project',
          'Integrity: We build trust through transparency and honesty',
          'Collaboration: We work as partners with our clients',
          'Growth: We continuously learn and evolve'
        ]),
        type: 'json',
        category: 'about',
        description: 'Company core values',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'contact_email',
        value: 'info@gsinfotech.com',
        type: 'email',
        category: 'contact',
        description: 'Primary contact email',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'contact_phone',
        value: '+1 (555) 123-4567',
        type: 'text',
        category: 'contact',
        description: 'Primary contact phone',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'office_address',
        value: '123 Tech Street, Digital City, TC 12345, United States',
        type: 'text',
        category: 'contact',
        description: 'Office address',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'business_hours',
        value: JSON.stringify({
          'Monday': '9:00 AM - 6:00 PM',
          'Tuesday': '9:00 AM - 6:00 PM',
          'Wednesday': '9:00 AM - 6:00 PM',
          'Thursday': '9:00 AM - 6:00 PM',
          'Friday': '9:00 AM - 6:00 PM',
          'Saturday': 'Closed',
          'Sunday': 'Closed'
        }),
        type: 'json',
        category: 'contact',
        description: 'Business hours',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'social_media_links',
        value: JSON.stringify({
          'facebook': 'https://facebook.com/gsinfotech',
          'twitter': 'https://twitter.com/gsinfotech',
          'linkedin': 'https://linkedin.com/company/gsinfotech',
          'instagram': 'https://instagram.com/gsinfotech',
          'youtube': 'https://youtube.com/gsinfotech'
        }),
        type: 'json',
        category: 'social',
        description: 'Social media links',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'company_stats',
        value: JSON.stringify({
          'projects_completed': '500+',
          'happy_clients': '200+',
          'team_members': '50+',
          'years_experience': '10+',
          'countries_served': '25+'
        }),
        type: 'json',
        category: 'stats',
        description: 'Company statistics',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'technologies_expertise',
        value: JSON.stringify([
          'React.js', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java',
          'React Native', 'Flutter', 'iOS', 'Android',
          'MySQL', 'PostgreSQL', 'MongoDB', 'Redis',
          'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes'
        ]),
        type: 'json',
        category: 'technical',
        description: 'Technologies we specialize in',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'certifications',
        value: JSON.stringify([
          'AWS Certified Solutions Architect',
          'Google Cloud Professional',
          'Microsoft Azure Certified',
          'Certified Scrum Master',
          'ISO 9001:2015 Certified'
        ]),
        type: 'json',
        category: 'technical',
        description: 'Company and team certifications',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('company_info', null, {});
  }
};