import { useState, useEffect } from 'react'
import { companyAPI } from '@/services/companyAPI'

export const useCompany = () => {
    const [companyInfo, setCompanyInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchCompanyInfo = async () => {
            try {
                setLoading(true)
                const data = await companyAPI.getInfo()
                setCompanyInfo(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchCompanyInfo()
    }, [])

    return { companyInfo, loading, error }
}