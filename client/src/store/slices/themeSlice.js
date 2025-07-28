import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    mode: 'light', // 'light' | 'dark' | 'auto'
    primaryColor: '#ea5b66',
    animations: true,
    reducedMotion: false,
}

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setThemeMode: (state, action) => {
            state.mode = action.payload
        },
        setPrimaryColor: (state, action) => {
            state.primaryColor = action.payload
        },
        toggleAnimations: (state) => {
            state.animations = !state.animations
        },
        setReducedMotion: (state, action) => {
            state.reducedMotion = action.payload
        },
    },
})

export const { setThemeMode, setPrimaryColor, toggleAnimations, setReducedMotion } = themeSlice.actions
export default themeSlice.reducer