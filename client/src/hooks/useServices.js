import { useSelector, useDispatch } from 'react-redux'
import { useGetServicesQuery } from '@/store/api/apiSlice'
import { setServices, setLoading, setError } from '@/store/slices/servicesSlice'

export const useServices = () => {
    const dispatch = useDispatch()
    const { services } = useSelector(state => state.services)

    const {
        data,
        error,
        isLoading,
        refetch,
    } = useGetServicesQuery()

    return {
        services: data?.services || services,
        loading: isLoading,
        error,
        refetch,
    }
}