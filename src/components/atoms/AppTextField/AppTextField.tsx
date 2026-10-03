import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import { Box, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { get } from 'lodash';
import { EyeIcon, EyeOffIcon } from '@/components/atoms/Icons/AuthIcons';
import { radiusScale, typeScale } from '@/theme/tokens';

export interface AppTextFieldProps {
    name: string;
    control: any;
    errors?: FieldErrors<any>;
    label: string;
    placeholder?: string;
    required?: boolean;
    rules?: object;
    type?: string;
    disabled?: boolean;
    autoComplete?: string;
}

// Al enfocar en mobile, deja que el teclado virtual termine de animarse
// (Capacitor/WebView) y recién entonces centra el campo — sin esto, en
// pantallas chicas el campo puede quedar tapado por el teclado. No agrega
// dependencias: usa la API nativa scrollIntoView.
const SCROLL_INTO_VIEW_DELAY_MS = 300;
const handleFocusScrollIntoView = (event: React.FocusEvent<HTMLInputElement>) => {
    const target = event.target;
    setTimeout(() => {
        target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, SCROLL_INTO_VIEW_DELAY_MS);
};

// Wrapper de TextField para el flujo de auth: label SIEMPRE visible arriba
// (nada de floating label ni notched outline — no se le pasa `label` al
// TextField, así el fieldset nunca dibuja el corte para la leyenda), estados
// normal/focus/error/disabled explícitos, y el único ícono permitido es el
// de mostrar/ocultar contraseña (44x44, con aria-label).
export const AppTextField: React.FC<AppTextFieldProps> = ({
    name,
    control,
    errors,
    label,
    placeholder,
    required = false,
    rules = {},
    type = 'text',
    disabled = false,
    autoComplete,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const resolvedType = isPassword && showPassword ? 'text' : type;
    const fieldError = get(errors, name);
    const errorMessage = fieldError?.message as string | undefined;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography
                component="label"
                htmlFor={`${name}-input`}
                sx={{ ...typeScale.label, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
                {label}
                {required && (
                    <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        *
                    </Box>
                )}
            </Typography>

            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field }) => (
                    <TextField
                        {...field}
                        id={`${name}-input`}
                        value={field.value ?? ''}
                        onFocus={handleFocusScrollIntoView}
                        autoComplete={autoComplete ?? name}
                        fullWidth
                        placeholder={placeholder}
                        type={resolvedType}
                        disabled={disabled}
                        variant="outlined"
                        error={!!fieldError}
                        // Se reserva el espacio ( " " ) para que el campo no salte de
                        // alto entre estados — el mensaje real (con ícono) se muestra
                        // aparte, debajo, para no depender solo del color.
                        helperText=" "
                        slotProps={{
                            htmlInput: { style: { ...typeScale.input } },
                            input: isPassword
                                ? {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                edge="end"
                                                tabIndex={-1}
                                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                                sx={{ width: 44, height: 44, color: 'text.secondary' }}
                                            >
                                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }
                                : undefined,
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                height: 50,
                                borderRadius: `${radiusScale.md}px`,
                                backgroundColor: (theme) => theme.authTokens.inputBg,
                                '& fieldset': { borderColor: 'divider' },
                                '&:hover fieldset': { borderColor: (theme) => theme.authTokens.borderStrong },
                                '&.Mui-focused': {
                                    boxShadow: (theme) => `0 0 0 4px ${theme.authTokens.primarySubtle}`,
                                },
                                '&.Mui-focused fieldset': { borderWidth: '1.5px', borderColor: 'primary.main' },
                                '&.Mui-error fieldset': { borderColor: 'error.main' },
                                '&.Mui-disabled': { backgroundColor: 'action.disabledBackground' },
                                // Contraste AA explícito del placeholder — el default del
                                // navegador (opacity reducida sobre el color del texto) no
                                // siempre alcanza suficiente contraste en oscuro.
                                '& input::placeholder': {
                                    color: (theme) => theme.authTokens.textMuted,
                                    opacity: 1,
                                },
                                // Autofill del navegador: sobrescribe el azul/amarillo por
                                // defecto para que combine con el input (theme-aware, así
                                // se ajusta solo entre claro/oscuro).
                                '& input:-webkit-autofill': {
                                    WebkitBoxShadow: (theme) => `0 0 0 1000px ${theme.authTokens.inputBg} inset`,
                                    WebkitTextFillColor: (theme) => theme.palette.text.primary,
                                    caretColor: (theme) => theme.palette.text.primary,
                                    transition: 'background-color 9999s',
                                },
                            },
                            '& .MuiFormHelperText-root': { display: 'none' },
                        }}
                    />
                )}
            />

            {errorMessage && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mt: -0.25 }}>
                    <ErrorOutlineRoundedIcon sx={{ fontSize: 15, color: 'error.main', mt: '1px' }} />
                    <Typography sx={{ ...typeScale.aux, color: 'error.main' }}>{errorMessage}</Typography>
                </Box>
            )}
        </Box>
    );
};

export default AppTextField;
