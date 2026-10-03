import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { typeScale } from '@/theme/tokens';

export interface AppButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'text';
    fullWidth?: boolean;
    disabled?: boolean;
    loading?: boolean;
    loadingText?: string;
}

// Botones del flujo de auth: variant="primary" es la acción principal
// (sólido, 52px), variant="text" es la acción terciaria (Cancelar). No
// sobrescribe MuiButton globalmente — es un wrapper nuevo que el Login usa,
// para no afectar botones ya existentes en el resto de la app.
export const AppButton: React.FC<AppButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    fullWidth = false,
    disabled = false,
    loading = false,
    loadingText = 'Verificando…',
}) => {
    const isPrimary = variant === 'primary';

    return (
        <Button
            onClick={onClick}
            fullWidth={fullWidth}
            disabled={disabled || loading}
            variant={isPrimary ? 'contained' : 'text'}
            disableElevation
            sx={{
                height: isPrimary ? 52 : 48,
                borderRadius: isPrimary ? '12px' : '10px',
                textTransform: 'none',
                ...typeScale.button,
                ...(isPrimary
                    ? {
                        '&:active:not(:disabled)': {
                            backgroundColor: (theme) => theme.authTokens.primaryPressed,
                            transform: 'scale(0.98)',
                        },
                    }
                    : {
                        color: 'text.secondary',
                    }),
            }}
        >
            {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={18} sx={{ color: isPrimary ? 'primary.contrastText' : 'inherit' }} />
                    {loadingText}
                </Box>
            ) : (
                children
            )}
        </Button>
    );
};

export default AppButton;
