import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    members: [],
    currentMember: null,
    loading: false,
    error: null,
}

const teamSlice = createSlice({
    name: 'team',
    initialState,
    reducers: {
        setMembers: (state, action) => {
            state.members = action.payload
        },
        setCurrentMember: (state, action) => {
            state.currentMember = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
    },
})

export const { setMembers, setCurrentMember, setLoading, setError } = teamSlice.actions
export default teamSlice.reducer