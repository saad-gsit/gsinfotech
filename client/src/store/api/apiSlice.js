// client/src/store/api/apiSlice.js - Enhanced version
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        // Add auth token if available
        const token = getState()?.auth?.token
        if (token) {
            headers.set('authorization', `Bearer ${token}`)
        }

        // Add common headers
        headers.set('Content-Type', 'application/json')
        return headers
    },
})

// Base query with error handling
const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions)

    // Handle 401 errors (unauthorized)
    if (result?.error?.status === 401) {
        console.log('Unauthorized - clearing auth state')
        // Could dispatch logout action here
    }

    return result
}

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Project', 'Team', 'Blog', 'Service', 'Contact', 'SEO', 'Analytics'],
    endpoints: (builder) => ({

        // Projects endpoints
        getProjects: builder.query({
            query: (params = {}) => ({
                url: '/projects',
                params,
            }),
            providesTags: ['Project'],
            transformResponse: (response) => {
                // Handle different response formats
                if (Array.isArray(response)) {
                    return { projects: response, total: response.length }
                }
                return response.projects ? response : { projects: response.data || [], total: response.total || 0 }
            },
        }),

        getProject: builder.query({
            query: (id) => `/projects/${id}`,
            providesTags: (result, error, id) => [{ type: 'Project', id }],
        }),

        getProjectStats: builder.query({
            query: () => '/projects/stats',
            providesTags: ['Project'],
        }),

        createProject: builder.mutation({
            query: (newProject) => ({
                url: '/projects',
                method: 'POST',
                body: newProject,
            }),
            invalidatesTags: ['Project'],
        }),

        updateProject: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/projects/${id}`,
                method: 'PUT',
                body: patch,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Project', id }],
        }),

        deleteProject: builder.mutation({
            query: (id) => ({
                url: `/projects/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Project'],
        }),

        // Team endpoints
        getTeam: builder.query({
            query: (params = {}) => ({
                url: '/team',
                params,
            }),
            providesTags: ['Team'],
            transformResponse: (response) => {
                // Handle different response formats
                if (Array.isArray(response)) {
                    return { members: response, total: response.length }
                }
                return response.members ? response : { members: response.data || [], total: response.total || 0 }
            },
        }),

        getTeamMember: builder.query({
            query: (id) => `/team/${id}`,
            providesTags: (result, error, id) => [{ type: 'Team', id }],
        }),

        createTeamMember: builder.mutation({
            query: (newMember) => ({
                url: '/team',
                method: 'POST',
                body: newMember,
            }),
            invalidatesTags: ['Team'],
        }),

        updateTeamMember: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/team/${id}`,
                method: 'PUT',
                body: patch,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Team', id }],
        }),

        deleteTeamMember: builder.mutation({
            query: (id) => ({
                url: `/team/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Team'],
        }),

        // Blog endpoints
        getBlogPosts: builder.query({
            query: (params = {}) => ({
                url: '/blog',
                params,
            }),
            providesTags: ['Blog'],
            transformResponse: (response) => {
                if (Array.isArray(response)) {
                    return { posts: response, total: response.length }
                }
                return response.posts ? response : { posts: response.data || [], total: response.total || 0 }
            },
        }),

        getBlogPost: builder.query({
            query: (slug) => `/blog/${slug}`,
            providesTags: (result, error, slug) => [{ type: 'Blog', id: slug }],
        }),

        createBlogPost: builder.mutation({
            query: (newPost) => ({
                url: '/blog',
                method: 'POST',
                body: newPost,
            }),
            invalidatesTags: ['Blog'],
        }),

        updateBlogPost: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/blog/${id}`,
                method: 'PUT',
                body: patch,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Blog', id }],
        }),

        deleteBlogPost: builder.mutation({
            query: (id) => ({
                url: `/blog/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Blog'],
        }),

        // Services endpoints
        getServices: builder.query({
            query: (params = {}) => ({
                url: '/services',
                params,
            }),
            providesTags: ['Service'],
            transformResponse: (response) => {
                if (Array.isArray(response)) {
                    return { services: response, total: response.length }
                }
                return response.services ? response : { services: response.data || [], total: response.total || 0 }
            },
        }),

        getService: builder.query({
            query: (id) => `/services/${id}`,
            providesTags: (result, error, id) => [{ type: 'Service', id }],
        }),

        createService: builder.mutation({
            query: (newService) => ({
                url: '/services',
                method: 'POST',
                body: newService,
            }),
            invalidatesTags: ['Service'],
        }),

        updateService: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/services/${id}`,
                method: 'PUT',
                body: patch,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Service', id }],
        }),

        deleteService: builder.mutation({
            query: (id) => ({
                url: `/services/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Service'],
        }),

        // Contact endpoint
        submitContact: builder.mutation({
            query: (contactData) => ({
                url: '/contact',
                method: 'POST',
                body: contactData,
            }),
            invalidatesTags: ['Contact'],
        }),

        getContactSubmissions: builder.query({
            query: (params = {}) => ({
                url: '/contact/submissions',
                params,
            }),
            providesTags: ['Contact'],
        }),

        // SEO endpoints
        getSEOData: builder.query({
            query: (path) => `/seo?path=${encodeURIComponent(path)}`,
            providesTags: ['SEO'],
        }),

        generateSitemap: builder.mutation({
            query: (type = 'xml') => ({
                url: `/seo/generate-sitemap?type=${type}`,
                method: 'POST',
            }),
            invalidatesTags: ['SEO'],
        }),

        // Analytics endpoints
        getAnalytics: builder.query({
            query: (params = {}) => ({
                url: '/analytics',
                params,
            }),
            providesTags: ['Analytics'],
        }),

        trackEvent: builder.mutation({
            query: (eventData) => ({
                url: '/analytics/track',
                method: 'POST',
                body: eventData,
            }),
        }),

        // Health and utility endpoints
        getHealthStatus: builder.query({
            query: () => '/health',
            transformResponse: (response) => response,
        }),

        getPerformanceMetrics: builder.query({
            query: () => '/performance',
            transformResponse: (response) => response,
        }),

        testDatabaseConnection: builder.query({
            query: () => '/db-test',
            transformResponse: (response) => response,
        }),

        // File upload endpoints
        uploadFile: builder.mutation({
            query: ({ file, folder = 'temp' }) => {
                const formData = new FormData()
                formData.append('file', file)
                formData.append('folder', folder)

                return {
                    url: '/upload',
                    method: 'POST',
                    body: formData,
                    formData: true,
                }
            },
        }),

        optimizeImage: builder.mutation({
            query: ({ file, options = {} }) => {
                const formData = new FormData()
                formData.append('image', file)
                formData.append('options', JSON.stringify(options))

                return {
                    url: '/images/optimize',
                    method: 'POST',
                    body: formData,
                    formData: true,
                }
            },
        }),
    }),
})

// Export hooks for usage in functional components
export const {
    // Projects
    useGetProjectsQuery,
    useGetProjectQuery,
    useGetProjectStatsQuery,
    useCreateProjectMutation,
    useUpdateProjectMutation,
    useDeleteProjectMutation,

    // Team
    useGetTeamQuery,
    useGetTeamMemberQuery,
    useCreateTeamMemberMutation,
    useUpdateTeamMemberMutation,
    useDeleteTeamMemberMutation,

    // Blog
    useGetBlogPostsQuery,
    useGetBlogPostQuery,
    useCreateBlogPostMutation,
    useUpdateBlogPostMutation,
    useDeleteBlogPostMutation,

    // Services
    useGetServicesQuery,
    useGetServiceQuery,
    useCreateServiceMutation,
    useUpdateServiceMutation,
    useDeleteServiceMutation,

    // Contact
    useSubmitContactMutation,
    useGetContactSubmissionsQuery,

    // SEO
    useGetSEODataQuery,
    useGenerateSitemapMutation,

    // Analytics
    useGetAnalyticsQuery,
    useTrackEventMutation,

    // Utility
    useGetHealthStatusQuery,
    useGetPerformanceMetricsQuery,
    useTestDatabaseConnectionQuery,
    useUploadFileMutation,
    useOptimizeImageMutation,
} = apiSlice