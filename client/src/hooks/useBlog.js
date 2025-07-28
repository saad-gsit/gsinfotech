import { useSelector, useDispatch } from 'react-redux'
import { useGetBlogPostsQuery } from '@/store/api/apiSlice'
import { setPosts, setFilters, setLoading, setError } from '@/store/slices/blogSlice'

export const useBlog = (filters = {}) => {
    const dispatch = useDispatch()
    const { posts, filters: currentFilters, pagination } = useSelector(state => state.blog)

    const {
        data,
        error,
        isLoading,
        refetch,
    } = useGetBlogPostsQuery({ ...currentFilters, ...filters })

    const updateFilters = (newFilters) => {
        dispatch(setFilters(newFilters))
    }

    return {
        posts: data?.posts || posts,
        pagination: data?.pagination || pagination,
        filters: currentFilters,
        loading: isLoading,
        error,
        refetch,
        updateFilters,
    }
}