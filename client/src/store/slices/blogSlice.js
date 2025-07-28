import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    posts: [],
    currentPost: null,
    categories: [],
    tags: [],
    filters: {
        category: 'all',
        tag: 'all',
        search: '',
    },
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalPosts: 0,
        postsPerPage: 10,
    },
    loading: false,
    error: null,
}

const blogSlice = createSlice({
    name: 'blog',
    initialState,
    reducers: {
        setPosts: (state, action) => {
            state.posts = action.payload
        },
        setCurrentPost: (state, action) => {
            state.currentPost = action.payload
        },
        setCategories: (state, action) => {
            state.categories = action.payload
        },
        setTags: (state, action) => {
            state.tags = action.payload
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
        clearCurrentPost: (state) => {
            state.currentPost = null
        },
    },
})

export const {
    setPosts,
    setCurrentPost,
    setCategories,
    setTags,
    setFilters,
    setPagination,
    setLoading,
    setError,
    clearCurrentPost
} = blogSlice.actions
export default blogSlice.reducer