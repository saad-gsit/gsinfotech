// src/store/slices/toastSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    toasts: []
}

const toastSlice = createSlice({
    name: 'toast',
    initialState,
    reducers: {
        addToast: (state, action) => {
            state.toasts.push(action.payload)
        },
        removeToast: (state, action) => {
            state.toasts = state.toasts.filter(toast => toast.id !== action.payload)
        },
        clearToasts: (state) => {
            state.toasts = []
        }
    }
})

export const { addToast, removeToast, clearToasts } = toastSlice.actions
export default toastSlice.reducer