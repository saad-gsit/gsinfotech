// client/src/hooks/useAPI.js - React Query hooks for API integration
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Import API services
import { projectsAPI } from '../services/projectsAPI';
import { teamAPI } from '../services/teamAPI';
import { blogAPI } from '../services/blogAPI';
import { contactAPI } from '../services/contactAPI';
import { authAPI } from '../services/authAPI';
import { checkServerHealth, testDatabaseConnection } from '../services/api';
import { servicesAPI } from '../services/servicesAPI';
import { companyAPI } from '../services/companyAPI';

// Query Keys - centralized for cache management
export const QUERY_KEYS = {
    // Projects
    PROJECTS: 'projects',
    PROJECT_DETAIL: 'project-detail',
    PROJECT_STATS: 'project-stats',
    FEATURED_PROJECTS: 'featured-projects',

    // Team
    TEAM: 'team',
    TEAM_MEMBER: 'team-member',
    TEAM_STATS: 'team-stats',
    LEADERSHIP_TEAM: 'leadership-team',

    // Blog
    BLOG_POSTS: 'blog-posts',
    BLOG_POST: 'blog-post',
    BLOG_STATS: 'blog-stats',
    FEATURED_POSTS: 'featured-posts',
    BLOG_CATEGORIES: 'blog-categories',

    // Services
    SERVICES: 'services',
    SERVICE_DETAIL: 'service-detail',
    SERVICE_STATS: 'service-stats',
    FEATURED_SERVICES: 'featured-services',

    // Company
    COMPANY_INFO: 'company-info',
    COMPANY_STATS: 'company-stats',

    // Contact
    CONTACT_SUBMISSIONS: 'contact-submissions',
    CONTACT_STATS: 'contact-stats',
    NEWSLETTER_SUBSCRIBERS: 'newsletter-subscribers',

    // Auth
    CURRENT_USER: 'current-user',
    ADMIN_USERS: 'admin-users',

    // System
    SERVER_HEALTH: 'server-health',
    DB_CONNECTION: 'db-connection',
};

// ============= PROJECTS HOOKS =============

export const useProjects = (params = {}) => {
    return useQuery({
        queryKey: [QUERY_KEYS.PROJECTS, params],
        queryFn: () => projectsAPI.getAllProjects(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useProject = (id) => {
    return useQuery({
        queryKey: [QUERY_KEYS.PROJECT_DETAIL, id],
        queryFn: () => projectsAPI.getProjectById(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });
};

export const useFeaturedProjects = (limit = 6) => {
    return useQuery({
        queryKey: [QUERY_KEYS.FEATURED_PROJECTS, limit],
        queryFn: () => projectsAPI.getFeaturedProjects(limit),
        staleTime: 10 * 60 * 1000,
    });
};

export const useProjectStats = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.PROJECT_STATS],
        queryFn: () => projectsAPI.getProjectStats(),
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
};

// Project Mutations
export const useCreateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectData, images }) =>
            projectsAPI.createProject(projectData, images),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FEATURED_PROJECTS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECT_STATS] });
            toast.success('Project created successfully!');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create project');
        },
    });
};

export const useUpdateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, projectData, images }) =>
            projectsAPI.updateProject(id, projectData, images),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECT_DETAIL, variables.id] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FEATURED_PROJECTS] });
            toast.success('Project updated successfully!');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update project');
        },
    });
};

export const useDeleteProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => projectsAPI.deleteProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FEATURED_PROJECTS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECT_STATS] });
            toast.success('Project deleted successfully!');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete project');
        },
    });
};

// ============= TEAM HOOKS =============

export const useTeam = (params = {}) => {
    return useQuery({
        queryKey: [QUERY_KEYS.TEAM, params],
        queryFn: () => teamAPI.getAllTeamMembers(params),
        staleTime: 10 * 60 * 1000,
    });
};

export const useTeamMember = (id) => {
    return useQuery({
        queryKey: [QUERY_KEYS.TEAM_MEMBER, id],
        queryFn: () => teamAPI.getTeamMemberById(id),
        enabled: !!id,
    });
};

export const useLeadershipTeam = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.LEADERSHIP_TEAM],
        queryFn: () => teamAPI.getLeadershipTeam(),
        staleTime: 30 * 60 * 1000,
    });
};

export const useTeamStats = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.TEAM_STATS],
        queryFn: () => teamAPI.getTeamStats(),
        staleTime: 30 * 60 * 1000,
    });
};

// Team Mutations
export const useCreateTeamMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ memberData, photo }) =>
            teamAPI.createTeamMember(memberData, photo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAM] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEADERSHIP_TEAM] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAM_STATS] });
            toast.success('Team member added successfully!');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to add team member');
        },
    });
};

export const useUpdateTeamMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, memberData, photo }) =>
            teamAPI.updateTeamMember(id, memberData, photo),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAM] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAM_MEMBER, variables.id] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEADERSHIP_TEAM] });
            toast.success('Team member updated successfully!');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update team member');
        },
    });
};

export const useDeleteTeamMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => teamAPI.deleteTeamMember(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAM] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEADERSHIP_TEAM] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAM_STATS] });
            toast.success('Team member deleted successfully!');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete team member');
        },
    });
};

// ============= BLOG HOOKS (UPDATED FOR PAGINATION) =============

export const useBlogPosts = (params = {}, options = {}) => {
    // Create a stable query key that includes all relevant parameters
    const queryKey = [QUERY_KEYS.BLOG_POSTS, params];

    return useQuery({
        queryKey,
        queryFn: () => {
            console.log('Fetching blog posts with params:', params); // Debug log
            return blogAPI.getAllPosts(params);
        },
        staleTime: 0, // Always consider data stale for pagination
        cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
        keepPreviousData: true, // Keep previous data while fetching new data
        refetchOnMount: true, // Always refetch when component mounts
        refetchOnWindowFocus: false, // Don't refetch on window focus
        // Merge with custom options
        ...options,
    });
};

export const useBlogPost = (id) => {
    return useQuery({
        queryKey: [QUERY_KEYS.BLOG_POST, id],
        queryFn: () => blogAPI.getPostById(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000, // 10 minutes for individual posts
    });
};

export const useFeaturedPosts = (limit = 3) => {
    return useQuery({
        queryKey: [QUERY_KEYS.FEATURED_POSTS, limit],
        queryFn: () => blogAPI.getFeaturedPosts(limit),
        staleTime: 10 * 60 * 1000,
    });
};

export const useBlogStats = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.BLOG_STATS],
        queryFn: () => blogAPI.getBlogStats(),
        staleTime: 30 * 60 * 1000,
    });
};

export const useBlogCategories = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.BLOG_CATEGORIES],
        queryFn: () => blogAPI.getCategories(),
        staleTime: 60 * 60 * 1000, // 1 hour
        retry: 1, // Only retry once
        retryOnMount: false, // Don't retry on component mount
    });
};

// Blog Mutations
export const useCreateBlogPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postData, featuredImage, additionalImages }) =>
            blogAPI.createPost(postData, featuredImage, additionalImages),
        onSuccess: () => {
            // Invalidate all blog posts queries to refresh pagination
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOG_POSTS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FEATURED_POSTS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOG_STATS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOG_CATEGORIES] });
            toast.success('Blog post created successfully!');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create blog post');
        },
    });
};

export const useUpdateBlogPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, postData, featuredImage, additionalImages }) =>
            blogAPI.updatePost(id, postData, featuredImage, additionalImages),
        onSuccess: (data, variables) => {
            // Invalidate all blog posts queries to refresh pagination
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOG_POSTS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOG_POST, variables.id] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FEATURED_POSTS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOG_CATEGORIES] });
            toast.success('Blog post updated successfully!');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update blog post');
        },
    });
};

export const useDeleteBlogPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => blogAPI.deletePost(id),
        onSuccess: () => {
            // Invalidate all blog posts queries to refresh pagination
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOG_POSTS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FEATURED_POSTS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOG_STATS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOG_CATEGORIES] });
            toast.success('Blog post deleted successfully!');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete blog post');
        },
    });
};

// ============= SERVICES HOOKS =============
export const useServices = (params = {}) => {
    return useQuery({
        queryKey: [QUERY_KEYS.SERVICES, params],
        queryFn: () => servicesAPI.getAllServices(params),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useService = (id) => {
    return useQuery({
        queryKey: [QUERY_KEYS.SERVICE_DETAIL, id],
        queryFn: () => servicesAPI.getServiceById(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });
};

export const useFeaturedServices = (limit = 4) => {
    return useQuery({
        queryKey: [QUERY_KEYS.FEATURED_SERVICES, limit],
        queryFn: () => servicesAPI.getFeaturedServices(limit),
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
};

export const useServiceStats = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.SERVICE_STATS],
        queryFn: () => servicesAPI.getServiceStats(),
        staleTime: 30 * 60 * 1000,
    });
};

// Service Mutations
export const useCreateService = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (serviceData) => servicesAPI.createService(serviceData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SERVICES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FEATURED_SERVICES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SERVICE_STATS] });
            toast.success('Service created successfully!');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create service');
        },
    });
};

export const useUpdateService = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, serviceData }) => servicesAPI.updateService(id, serviceData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SERVICES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SERVICE_DETAIL, variables.id] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FEATURED_SERVICES] });
            toast.success('Service updated successfully!');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update service');
        },
    });
};

export const useDeleteService = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => servicesAPI.deleteService(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SERVICES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FEATURED_SERVICES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SERVICE_STATS] });
            toast.success('Service deleted successfully!');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete service');
        },
    });
};

// ============= COMPANY HOOKS =============

export const useCompanyInfo = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.COMPANY_INFO],
        queryFn: () => companyAPI.getCompanyInfo(),
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
};

export const useCompanyStats = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.COMPANY_STATS],
        queryFn: () => companyAPI.getCompanyStats(),
        staleTime: 30 * 60 * 1000,
    });
};

// Company Mutations
export const useUpdateCompanyInfo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (companyData) => companyAPI.updateCompanyInfo(companyData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMPANY_INFO] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COMPANY_STATS] });
            toast.success('Company information updated successfully!');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update company information');
        },
    });
};

// ============= CONTACT HOOKS =============

export const useContactSubmissions = (params = {}) => {
    return useQuery({
        queryKey: [QUERY_KEYS.CONTACT_SUBMISSIONS, params],
        queryFn: () => contactAPI.getAllSubmissions(params),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

export const useContactStats = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.CONTACT_STATS],
        queryFn: () => contactAPI.getContactStats(),
        staleTime: 10 * 60 * 1000,
    });
};

// Contact Mutations
export const useSubmitContactForm = () => {
    return useMutation({
        mutationFn: (contactData) => contactAPI.submitContactForm(contactData),
        onSuccess: () => {
            toast.success('Message sent successfully! We\'ll get back to you soon.');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to send message');
        },
    });
};

export const useSubscribeNewsletter = () => {
    return useMutation({
        mutationFn: (email) => contactAPI.subscribeNewsletter(email),
        onSuccess: () => {
            toast.success('Successfully subscribed to newsletter!');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to subscribe');
        },
    });
};

// ============= AUTH HOOKS =============

export const useCurrentUser = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.CURRENT_USER],
        queryFn: () => authAPI.getCurrentUser(),
        enabled: authAPI.isAuthenticated(),
        staleTime: 10 * 60 * 1000,
        retry: false,
    });
};

export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (credentials) => authAPI.login(credentials),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CURRENT_USER] });
            toast.success('Login successful!');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Login failed');
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => authAPI.logout(),
        onSuccess: () => {
            queryClient.clear(); // Clear all cached data
            window.location.href = '/';
            toast.success('Logged out successfully!');
        },
        onError: (error) => {
            console.error('Logout error:', error);
            // Force logout even on error
            queryClient.clear();
            window.location.href = '/';
        },
    });
};

// ============= SYSTEM HOOKS =============

export const useServerHealth = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.SERVER_HEALTH],
        queryFn: () => checkServerHealth(),
        staleTime: 30 * 1000, // 30 seconds
        retry: 3,
        retryDelay: 1000,
    });
};

export const useDatabaseConnection = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.DB_CONNECTION],
        queryFn: () => testDatabaseConnection(),
        staleTime: 60 * 1000, // 1 minute
        retry: 2,
    });
};

// ============= UTILITY HOOKS =============

// Generic hook for invalidating queries
export const useInvalidateQueries = () => {
    const queryClient = useQueryClient();

    return (queryKeys) => {
        if (Array.isArray(queryKeys)) {
            queryKeys.forEach(key => {
                queryClient.invalidateQueries({ queryKey: [key] });
            });
        } else {
            queryClient.invalidateQueries({ queryKey: [queryKeys] });
        }
    };
};

// Hook for prefetching data
export const usePrefetch = () => {
    const queryClient = useQueryClient();

    return {
        prefetchProjects: () => {
            queryClient.prefetchQuery({
                queryKey: [QUERY_KEYS.PROJECTS],
                queryFn: () => projectsAPI.getAllProjects(),
                staleTime: 5 * 60 * 1000,
            });
        },
        prefetchTeam: () => {
            queryClient.prefetchQuery({
                queryKey: [QUERY_KEYS.TEAM],
                queryFn: () => teamAPI.getAllTeamMembers(),
                staleTime: 10 * 60 * 1000,
            });
        },
        prefetchBlog: () => {
            queryClient.prefetchQuery({
                queryKey: [QUERY_KEYS.BLOG_POSTS],
                queryFn: () => blogAPI.getAllPosts(),
                staleTime: 5 * 60 * 1000,
            });
        },
    };
};

// NEW: Helper hook for blog pagination debugging
export const useBlogDebug = () => {
    const queryClient = useQueryClient();

    return {
        logCacheStatus: () => {
            const cache = queryClient.getQueryCache();
            const blogQueries = cache.findAll([QUERY_KEYS.BLOG_POSTS]);
            console.log('Blog queries in cache:', blogQueries.map(q => ({
                queryKey: q.queryKey,
                state: q.state.status,
                dataUpdatedAt: q.state.dataUpdatedAt,
                data: q.state.data
            })));
        },
        clearBlogCache: () => {
            queryClient.removeQueries({ queryKey: [QUERY_KEYS.BLOG_POSTS] });
            console.log('Blog cache cleared');
        }
    };
};