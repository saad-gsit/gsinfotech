import { useSelector, useDispatch } from 'react-redux'
import { useGetProjectsQuery } from '@/store/api/apiSlice'
import { setProjects, setFilters, setLoading, setError } from '@/store/slices/projectsSlice'

export const useProjects = (filters = {}) => {
    const dispatch = useDispatch()
    const { projects, filters: currentFilters } = useSelector(state => state.projects)

    const {
        data,
        error,
        isLoading,
        refetch,
    } = useGetProjectsQuery({ ...currentFilters, ...filters })

    // Update Redux state when data changes
    useEffect(() => {
        if (data?.projects) {
            dispatch(setProjects(data.projects))
        }
    }, [data, dispatch])

    const updateFilters = (newFilters) => {
        dispatch(setFilters(newFilters))
    }

    return {
        projects: data?.projects || projects,
        pagination: data?.pagination,
        filters: currentFilters,
        loading: isLoading,
        error,
        refetch,
        updateFilters,
    }
}