import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import type { FieldErrors } from 'react-hook-form';
import { PersonIcon, LockIcon, ShieldIcon } from '@/components/atoms/Icons/AuthIcons';


import AuthScreenLayout from '@/components/atoms/AuthScreenLayout/AuthScreenLayout';
import InputFormatField from '@/components/atoms/FormInputFileds/InputFormatField/InputFormatField';
import { LoginFormFieldsEnum } from '@/shared/constants/LoginFormFieldsEnum';
import type { UserRequest } from '@/types/UserRequest';

export interface LoginFormProps {
    control: any;
    errors: FieldErrors<UserRequest>;
    loadingSave: boolean;
    onLogin: () => void;
}

const BLUE_ACCENT = '#7FA6F5';
const BLUE_BUTTON = '#3B6BF5';

const whiteFieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: '#fff',
        fontSize: 14.5,
        '& fieldset': { border: 'none' },
    },
    '& .MuiInputLabel-root': { display: 'none' },
    '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.7)', minHeight: 18 },
};

export const LoginForm: React.FC<LoginFormProps> = ({ control, errors, loadingSave, onLogin }) => {
    return (
        <AuthScreenLayout
            title="Bienvenido"
            subtitle="Inicia sesión para continuar"
            icon={<ShieldIcon />}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <InputFormatField
                    name={LoginFormFieldsEnum.USER_NAME}
                    control={control}
                    errors={errors}
                    required
                    placeholder="Nombre de usuario"
                   startIcon={<PersonIcon />}
                    sx={whiteFieldSx}
                />

                <InputFormatField
                    name={LoginFormFieldsEnum.PASSWORD}
                    control={control}
                    errors={errors}
                    required
                    type="password"
                    placeholder="Contraseña"
                   startIcon={<LockIcon />}
                    sx={whiteFieldSx}
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 3.5 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: BLUE_ACCENT, cursor: 'pointer' }}>
                    Olvidé mi contraseña
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
                <Button
                    variant="contained"
                    loading={loadingSave}
                    onClick={onLogin}
                    sx={{ bgcolor: BLUE_BUTTON, height: 48, borderRadius: '12px' }}
                >
                    {loadingSave ? 'Ingresando...' : 'Iniciar sesión'}
                </Button>

                <Button
                    variant="outlined"
                    onClick={() => window.history.back()}
                    sx={{
                        height: 48,
                        borderRadius: '12px',
                        color: '#fff',
                        borderColor: 'rgba(255,255,255,0.25)',
                    }}
                >
                    Cancelar
                </Button>
            </Box>
        </AuthScreenLayout>
    );
};

export default LoginForm;