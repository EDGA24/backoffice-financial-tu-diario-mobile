import React from 'react';
import { Button as MuiButton, type ButtonProps as MuiButtonProps } from '@mui/material';

interface CustomButtonProps extends MuiButtonProps {
    isLoading?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
    children,
    isLoading,
    variant = 'contained',
    color = 'primary',
    ...rest
}) => {
    return (
        <MuiButton
            variant={variant}
            color={color}
            disabled={isLoading || rest.disabled}
            {...rest}
        >
            {isLoading ? 'Cargando...' : children}
        </MuiButton>
    );
};
