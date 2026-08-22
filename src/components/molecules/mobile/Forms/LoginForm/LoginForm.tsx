import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import type { FieldErrors } from 'react-hook-form';
import { PersonIcon, LockIcon, ShieldIcon } from '@/components/atoms/Icons/AuthIcons';


import AuthScreenLayout from '@/components/atoms/AuthScreenLayout/AuthScreenLayout';
import InputFormatField from '@/components/atoms/FormInputFileds/InputFormatField/InputFormatField';
import { LoginFormFieldsEnum } from '@/shared/constants/LoginFormFieldsEnum';
import type { UserRequest } from '@/types/UserRequest';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface LoginFormProps {
    control: any;
    errors: FieldErrors<UserRequest>;
    loadingSave: boolean;
    showSlowServerHint?: boolean;
    serverError?: string;
    onLogin: () => void;
}

const BLUE_ACCENT = '#7FA6F5';
const BLUE_BUTTON = '#3B6BF5';

const whiteFieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: '#fff',
        fontSize: 14.5,
        color: '#1a1f2b',
        '& fieldset': { border: 'none' },
        '& input': {
            color: '#1a1f2b',
            WebkitTextFillColor: '#1a1f2b',
            '&::placeholder': { color: 'rgba(26,31,43,0.5)', opacity: 1 },
        },
    },
    '& .MuiInputLabel-root': { display: 'none' },
    '& .MuiFormHelperText-root': {
        color: 'rgba(255,255,255,0.7)',
        minHeight: 18,
        '&.Mui-error': { color: '#ffb4b4' },
    },
};

export const LoginForm: React.FC<LoginFormProps> = ({
    control,
    errors,
    loadingSave,
    showSlowServerHint = false,
    serverError,
    onLogin,
}) => {
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
                    placeholder="Email"
                   startIcon={<PersonIcon />}
                    sx={whiteFieldSx}
                    rules={{
                        required: 'Ingresa tu correo',
                        pattern: { value: EMAIL_PATTERN, message: 'Ingresa un correo válido' },
                    }}
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
                    rules={{ required: 'Ingresa tu contraseña' }}
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 3.5 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: BLUE_ACCENT, cursor: 'pointer' }}>
                    Olvidé mi contraseña
                </Typography>
            </Box>

            {serverError && (
                <Box
                    sx={{
                        borderRadius: '10px',
                        backgroundColor: 'rgba(214,69,69,0.18)',
                        border: '1px solid rgba(255,180,180,0.4)',
                        px: 1.5,
                        py: 1,
                        mb: 2,
                        mt: -2.5,
                    }}
                >
                    <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#ffb4b4', textAlign: 'center' }}>
                        {serverError}
                    </Typography>
                </Box>
            )}

            {loadingSave && showSlowServerHint && (
                <Typography
                    sx={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: 'rgba(255,255,255,0.75)',
                        textAlign: 'center',
                        mb: 1.5,
                        mt: -2.5,
                    }}
                >
                    El servidor estaba dormido y está despertando, esto puede tardar unos segundos más de lo normal…
                </Typography>
            )}

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