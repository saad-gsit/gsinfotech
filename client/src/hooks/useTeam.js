import { useSelector, useDispatch } from 'react-redux'
import { useGetTeamQuery } from '@/store/api/apiSlice'
import { setMembers, setLoading, setError } from '@/store/slices/teamSlice'

export const useTeam = () => {
    const dispatch = useDispatch()
    const { members } = useSelector(state => state.team)

    const {
        data,
        error,
        isLoading,
        refetch,
    } = useGetTeamQuery()

    return {
        members: data?.members || members,
        loading: isLoading,
        error,
        refetch,
    }
}