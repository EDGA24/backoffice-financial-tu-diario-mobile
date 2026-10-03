import { useEffect, useState } from 'react';
import { Box, CircularProgress, Stack, Typography, Zoom, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';

// Piezas visuales del "stepper" de procesos (anillo de progreso + filas por
// paso; los mensajes que rotan están en useRotatingMessage.ts). Las comparten RenewalFlowModal (pago de
// renovación) y FirstChargeFlowModal (crédito + primer pago), para que ambos
// procesos se vean exactamente igual.

export type TrackRowState = 'pending' | 'active' | 'done' | 'error';

// Check que se "dibuja" con el trazo (stroke-dashoffset) en vez de solo
// aparecer — el remate típico de las pantallas de éxito de apps bancarias.
export const DrawnCheck = ({ size = 34 }: { size?: number }) => {
    const [drawn, setDrawn] = useState(false);
    useEffect(() => {
        const id = requestAnimationFrame(() => setDrawn(true));
        return () => cancelAnimationFrame(id);
    }, []);
    const pathLength = 36;
    return (
        <Box sx={{ color: 'success.main' }}>
            <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
                <path
                    d="M14 27l7 7 17-17"
                    stroke="currentColor"
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        strokeDasharray: pathLength,
                        strokeDashoffset: drawn ? 0 : pathLength,
                        transition: 'stroke-dashoffset 0.5s ease 0.05s',
                    }}
                />
            </svg>
        </Box>
    );
};

const RING_SIZE = 108;
const RING_STROKE = 7;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Anillo circular de progreso con el ícono del paso actual al centro — el
// mismo patrón que usa Revolut mientras procesa una transferencia.
export const ProgressRing = ({ progress, hasError, children }: { progress: number; hasError: boolean; children: React.ReactNode }) => {
    const theme = useTheme();
    const strokeColor = hasError ? theme.palette.error.main : theme.palette.primary.main;
    const offset = RING_CIRCUMFERENCE * (1 - progress);

    return (
        <Box sx={{ position: 'relative', width: RING_SIZE, height: RING_SIZE, mx: 'auto' }}>
            {/* Resplandor suave detrás del anillo, con pulso mientras hay algo en curso */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 8,
                    borderRadius: '50%',
                    bgcolor: hasError ? alpha(theme.palette.error.main, 0.14) : alpha(theme.palette.primary.main, 0.12),
                    filter: 'blur(10px)',
                    transition: 'background-color 0.4s ease',
                    animation: !hasError && progress < 1 ? 'renewalPulse 1.6s ease-in-out infinite' : 'none',
                    '@keyframes renewalPulse': {
                        '0%, 100%': { opacity: 0.55, transform: 'scale(1)' },
                        '50%': { opacity: 1, transform: 'scale(1.1)' },
                    },
                }}
            />
            <svg width={RING_SIZE} height={RING_SIZE} style={{ position: 'relative', transform: 'rotate(-90deg)' }}>
                <circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RING_RADIUS}
                    fill="none"
                    stroke={alpha(theme.palette.text.primary, 0.08)}
                    strokeWidth={RING_STROKE}
                />
                <circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RING_RADIUS}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={RING_STROKE}
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
                />
            </svg>
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {children}
            </Box>
        </Box>
    );
};

export const TrackRow = ({ label, state }: { label: string; state: TrackRowState }) => (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box sx={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {state === 'done' && (
                <Zoom in appear>
                    <CheckCircleRoundedIcon sx={{ fontSize: 22, color: 'success.main' }} />
                </Zoom>
            )}
            {state === 'active' && <CircularProgress size={18} thickness={5} />}
            {state === 'error' && <ErrorRoundedIcon sx={{ fontSize: 22, color: 'error.main' }} />}
            {state === 'pending' && <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 20, color: 'text.disabled' }} />}
        </Box>
        <Typography
            variant="body2"
            sx={{
                fontWeight: state === 'active' ? 700 : 500,
                color: state === 'pending' ? 'text.disabled' : 'text.primary',
                transition: 'color 0.25s ease',
            }}
        >
            {label}
        </Typography>
    </Stack>
);
