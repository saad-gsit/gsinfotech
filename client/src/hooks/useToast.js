import toast from 'react-hot-toast'

export const useToast = () => {
    const showSuccess = (message, options = {}) => {
        toast.success(message, {
            duration: 4000,
            position: 'bottom-right',
            style: {
                background: '#10b981',
                color: '#fff',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500'
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#10b981'
            },
            ...options
        })
    }

    const showError = (message, options = {}) => {
        toast.error(message, {
            duration: 5000,
            position: 'bottom-right',
            style: {
                background: '#ef4444',
                color: '#fff',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500'
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#ef4444'
            },
            ...options
        })
    }

    const showInfo = (message, options = {}) => {
        toast(message, {
            duration: 4000,
            position: 'bottom-right',
            icon: 'ℹ️',
            style: {
                background: '#3b82f6',
                color: '#fff',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500'
            },
            ...options
        })
    }

    const showLoading = (message, options = {}) => {
        return toast.loading(message, {
            position: 'bottom-right',
            style: {
                background: '#6b7280',
                color: '#fff',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500'
            },
            ...options
        })
    }

    const dismiss = (toastId) => {
        toast.dismiss(toastId)
    }

    const dismissAll = () => {
        toast.dismiss()
    }

    return {
        showSuccess,
        showError,
        showInfo,
        showLoading,
        dismiss,
        dismissAll
    }
}