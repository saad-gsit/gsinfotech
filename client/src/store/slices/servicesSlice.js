import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    services: [],
    currentService: null,
    features: [],
    loading: false,
    error: null,
}

const servicesSlice = createSlice({
    name: 'services',
    initialState,
    reducers: {
        setServices: (state, action) => {
            state.services = action.payload
        },
        setCurrentService: (state, action) => {
            state.currentService = action.payload
        },
        setFeatures: (state, action) => {
            state.features = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
    },
})

export const { setServices, setCurrentService, setFeatures, setLoading, setError } = servicesSlice.actions
export default servicesSlice.reducer