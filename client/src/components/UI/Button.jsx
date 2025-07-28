// client/src/components/UI/Button.jsx
import { forwardRef } from 'react'
import { Button as MuiButton, CircularProgress } from '@mui/material'
import { styled } from '@mui/material/styles'

const StyledButton = styled(MuiButton)(({ theme, variant, size }) => ({
    textTransform: 'none',
    fontWeight: 500,
    borderRadius: 0,
    transition: 'all 0.3s ease',

    // Size variants
    ...(size === 'small' && {
        padding: '6px 16px',
        fontSize: '0.875rem',
    }),
    ...(size === 'medium' && {
        padding: '10px 24px',
        fontSize: '0.95rem',
    }),
    ...(size === 'large' && {
        padding: '14px 32px',
        fontSize: '1rem',
    }),

    // Variant styles
    ...(variant === 'contained' && {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        boxShadow: 'none',
        '&:hover': {
            backgroundColor: theme.palette.primary.dark,
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.3)',
        },
        '&:active': {
            transform: 'translateY(0)',
        },
    }),

    ...(variant === 'outlined' && {
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.main,
        borderWidth: 1,
        '&:hover': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.2)',
        },
        '&:active': {
            transform: 'translateY(0)',
        },
    }),

    ...(variant === 'text' && {
        color: theme.palette.primary.main,
        '&:hover': {
            backgroundColor: 'transparent',
            color: theme.palette.primary.dark,
            transform: 'translateX(4px)',
        },
    }),

    '&:disabled': {
        transform: 'none',
        opacity: 0.6,
    },
}))

const Button = forwardRef(({
    children,
    loading = false,
    disabled = false,
    startIcon,
    endIcon,
    loadingPosition = 'start',
    ...props
}, ref) => {
    const isDisabled = disabled || loading

    const renderStartIcon = () => {
        if (loading && loadingPosition === 'start') {
            return <CircularProgress size={16} color="inherit" />
        }
        return startIcon
    }

    const renderEndIcon = () => {
        if (loading && loadingPosition === 'end') {
            return <CircularProgress size={16} color="inherit" />
        }
        return endIcon
    }

    return (
        <StyledButton
            ref={ref}
            disabled={isDisabled}
            startIcon={renderStartIcon()}
            endIcon={renderEndIcon()}
            {...props}
        >
            {children}
        </StyledButton>
    )
})

Button.displayName = 'Button'

export default Button