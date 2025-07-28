import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    projects: [],
    currentProject: null,
    filters: {
        category: 'all',
        technology: 'all',
        status: 'published',
        featured: false,
    },
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalProjects: 0,
        projectsPerPage: 10,
    },
    loading: false,
    error: null,
}

const projectsSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        setProjects: (state, action) => {
            state.projects = action.payload
        },
        setCurrentProject: (state, action) => {
            state.currentProject = action.payload
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload }
        },
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload }
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        clearCurrentProject: (state) => {
            state.currentProject = null
        },
        clearError: (state) => {
            state.error = null
        },
    },
})

export const {
    setProjects,
    setCurrentProject,
    setFilters,
    setPagination,
    setLoading,
    setError,
    clearCurrentProject,
    clearError
} = projectsSlice.actions
export default projectsSlice.reducer