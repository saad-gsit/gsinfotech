'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Additional performance indexes across all tables

    // Cross-table search indexes
    await queryInterface.addIndex('projects', ['title'], {
      name: 'projects_title_search_idx',
      type: 'FULLTEXT'
    });

    await queryInterface.addIndex('projects', ['description'], {
      name: 'projects_description_search_idx',
      type: 'FULLTEXT'
    });

    await queryInterface.addIndex('blog_posts', ['title'], {
      name: 'blog_posts_title_search_idx',
      type: 'FULLTEXT'
    });

    await queryInterface.addIndex('blog_posts', ['content'], {
      name: 'blog_posts_content_search_idx',
      type: 'FULLTEXT'
    });

    await queryInterface.addIndex('services', ['name'], {
      name: 'services_name_search_idx',
      type: 'FULLTEXT'
    });

    await queryInterface.addIndex('services', ['description'], {
      name: 'services_description_search_idx',
      type: 'FULLTEXT'
    });

    // Composite indexes for common query patterns
    await queryInterface.addIndex('projects', ['status', 'featured'], {
      name: 'projects_status_featured_idx'
    });

    await queryInterface.addIndex('projects', ['category', 'status'], {
      name: 'projects_category_status_idx'
    });

    await queryInterface.addIndex('blog_posts', ['status', 'featured'], {
      name: 'blog_posts_status_featured_idx'
    });

    await queryInterface.addIndex('blog_posts', ['status', 'published_at'], {
      name: 'blog_posts_status_published_at_idx'
    });

    await queryInterface.addIndex('services', ['category', 'is_active'], {
      name: 'services_category_is_active_idx'
    });

    await queryInterface.addIndex('team_members', ['is_active', 'is_featured'], {
      name: 'team_members_is_active_is_featured_idx'
    });

    // SEO-related composite indexes
    await queryInterface.addIndex('projects', ['status', 'seo_title'], {
      name: 'projects_status_seo_title_idx'
    });

    await queryInterface.addIndex('blog_posts', ['status', 'seo_title'], {
      name: 'blog_posts_status_seo_title_idx'
    });

    // Performance optimization indexes
    await queryInterface.addIndex('contact_submissions', ['status', 'priority'], {
      name: 'contact_submissions_status_priority_idx'
    });

    await queryInterface.addIndex('contact_submissions', ['created_at', 'status'], {
      name: 'contact_submissions_created_at_status_idx'
    });

    // Analytics performance indexes
    await queryInterface.addIndex('analytics', ['timestamp', 'event_type'], {
      name: 'analytics_timestamp_event_type_idx'
    });

    // View count optimization
    await queryInterface.addIndex('projects', ['view_count'], {
      name: 'projects_view_count_idx'
    });

    await queryInterface.addIndex('blog_posts', ['view_count'], {
      name: 'blog_posts_view_count_idx'
    });

    // Date range queries optimization
    await queryInterface.addIndex('projects', ['completion_date'], {
      name: 'projects_completion_date_idx'
    });

    await queryInterface.addIndex('team_members', ['hire_date'], {
      name: 'team_members_hire_date_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove all the indexes we created
    const indexes = [
      'projects_title_search_idx',
      'projects_description_search_idx',
      'blog_posts_title_search_idx',
      'blog_posts_content_search_idx',
      'services_name_search_idx',
      'services_description_search_idx',
      'projects_status_featured_idx',
      'projects_category_status_idx',
      'blog_posts_status_featured_idx',
      'blog_posts_status_published_at_idx',
      'services_category_is_active_idx',
      'team_members_is_active_is_featured_idx',
      'projects_status_seo_title_idx',
      'blog_posts_status_seo_title_idx',
      'contact_submissions_status_priority_idx',
      'contact_submissions_created_at_status_idx',
      'analytics_timestamp_event_type_idx',
      'projects_view_count_idx',
      'blog_posts_view_count_idx',
      'projects_completion_date_idx',
      'team_members_hire_date_idx'
    ];

    // Remove indexes from their respective tables
    for (const indexName of indexes) {
      try {
        if (indexName.startsWith('projects_')) {
          await queryInterface.removeIndex('projects', indexName);
        } else if (indexName.startsWith('blog_posts_')) {
          await queryInterface.removeIndex('blog_posts', indexName);
        } else if (indexName.startsWith('services_')) {
          await queryInterface.removeIndex('services', indexName);
        } else if (indexName.startsWith('team_members_')) {
          await queryInterface.removeIndex('team_members', indexName);
        } else if (indexName.startsWith('contact_submissions_')) {
          await queryInterface.removeIndex('contact_submissions', indexName);
        } else if (indexName.startsWith('analytics_')) {
          await queryInterface.removeIndex('analytics', indexName);
        }
      } catch (error) {
        console.log(`Could not remove index ${indexName}:`, error.message);
      }
    }
  }
};