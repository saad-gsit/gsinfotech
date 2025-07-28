import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    sidebarOpen: false,
    mobileMenuOpen: false,
    theme: 'light',
    loading: false,
    notifications: [],
    modal: {
        isOpen: false,
        type: null,
        data: null,
    },
}

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen
        },
        setSidebarOpen: (state, action) => {
            state.sidebarOpen = action.payload
        },
        toggleMobileMenu: (state) => {
            state.mobileMenuOpen = !state.mobileMenuOpen
        },
        setMobileMenuOpen: (state, action) => {
            state.mobileMenuOpen = action.payload
        },
        setTheme: (state, action) => {
            state.theme = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        addNotification: (state, action) => {
            state.notifications.push({
                id: Date.now(),
                ...action.payload,
            })
        },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(
                notification => notification.id !== action.payload
            )
        },
        openModal: (state, action) => {
            state.modal = {
                isOpen: true,
                type: action.payload.type,
                data: action.payload.data || null,
            }
        },
        closeModal: (state) => {
            state.modal = {
                isOpen: false,
                type: null,
                data: null,
            }
        },
    },
})

export const {
    toggleSidebar,
    setSidebarOpen,
    toggleMobileMenu,
    setMobileMenuOpen,
    setTheme,
    setLoading,
    addNotification,
    removeNotification,
    openModal,
    closeModal,
} = uiSlice.actions
export default uiSlice.reducer