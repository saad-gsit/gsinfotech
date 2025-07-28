// client/src/store/index.js
import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { apiSlice } from './api/apiSlice'
import authSlice from './slices/authSlice'
import projectsSlice from './slices/projectsSlice'
import teamSlice from './slices/teamSlice'
import blogSlice from './slices/blogSlice'
import servicesSlice from './slices/servicesSlice'
import uiSlice from './slices/uiSlice'
import themeSlice from './slices/themeSlice'
import toastReducer from './slices/toastSlice'
import authReducer from './slices/authSlice'

export const store = configureStore({
    reducer: {
        api: apiSlice.reducer,
        auth: authSlice,
        auth: authReducer,
        projects: projectsSlice,
        team: teamSlice,
        blog: blogSlice,
        services: servicesSlice,
        ui: uiSlice,
        theme: themeSlice,
        toast: toastReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }).concat(apiSlice.middleware),
    devTools: import.meta.env.VITE_ENVIRONMENT === 'development',
})

// Enable listener behavior for the store
setupListeners(store.dispatch)

export default store

