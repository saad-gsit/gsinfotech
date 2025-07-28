// client/src/services/teamAPI.js
import { apiClient, uploadFile } from './api.js';

export const teamAPI = {
    // Simple CRUD operations
    getAll: () => apiClient.get('/team'),
    create: (data) => apiClient.post('/team', data),
    update: (id, data) => apiClient.put(`/team/${id}`, data),
    delete: (id) => apiClient.delete(`/team/${id}`),

    // Get all team members
    getAllTeamMembers: async (params = {}) => {
        const response = await apiClient.get('/team', { params });
        return response.data;
    },

    // Get team statistics
    getTeamStats: async () => {
        const response = await apiClient.get('/team/stats');
        return response.data;
    },

    // Get team member by ID
    getTeamMemberById: async (id) => {
        const response = await apiClient.get(`/team/${id}`);
        return response.data;
    },

    // Get leadership team for homepage
    getLeadershipTeam: async () => {
        const response = await apiClient.get('/team', {
            params: { leadership: true }
        });
        return response.data;
    },

    // Get featured team members
    getFeaturedMembers: async (limit = 4) => {
        const response = await apiClient.get('/team', {
            params: { featured: true, limit }
        });
        return response.data;
    },

    // Get team members by department
    getTeamByDepartment: async (department) => {
        const response = await apiClient.get('/team', {
            params: { department }
        });
        return response.data;
    },

    // Admin: Create new team member with photo upload
    createTeamMember: async (memberData, photo = null) => {
        if (photo) {
            const formData = new FormData();

            // Add member data
            Object.keys(memberData).forEach(key => {
                if (memberData[key] !== null && memberData[key] !== undefined) {
                    formData.append(key, memberData[key]);
                }
            });

            // Add photo
            formData.append('photo', photo);

            const response = await apiClient.post('/team', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } else {
            const response = await apiClient.post('/team', memberData);
            return response.data;
        }
    },

    // Admin: Update team member
    updateTeamMember: async (id, memberData, photo = null) => {
        if (photo) {
            const formData = new FormData();

            Object.keys(memberData).forEach(key => {
                if (memberData[key] !== null && memberData[key] !== undefined) {
                    formData.append(key, memberData[key]);
                }
            });

            formData.append('photo', photo);

            const response = await apiClient.put(`/team/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } else {
            const response = await apiClient.put(`/team/${id}`, memberData);
            return response.data;
        }
    },

    // Admin: Delete team member
    deleteTeamMember: async (id) => {
        const response = await apiClient.delete(`/team/${id}`);
        return response.data;
    },

    // Upload team member photo
    uploadMemberPhoto: async (memberId, photo, onProgress) => {
        return uploadFile(photo, '/team/upload-photo', onProgress, {
            memberId,
        });
    },

    // Get departments list
    getDepartments: async () => {
        const response = await apiClient.get('/team/departments');
        return response.data;
    },

    // Search team members
    searchTeamMembers: async (query, filters = {}) => {
        const response = await apiClient.get('/team', {
            params: { search: query, ...filters }
        });
        return response.data;
    },

    // Admin: Bulk update team members
    bulkUpdateMembers: async (updates) => {
        const response = await apiClient.patch('/team/bulk', { updates });
        return response.data;
    },

    // Admin: Bulk delete team members
    bulkDeleteMembers: async (ids) => {
        const response = await apiClient.delete('/team/bulk', {
            data: { ids }
        });
        return response.data;
    },
};