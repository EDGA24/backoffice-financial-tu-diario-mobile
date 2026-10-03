import { Box, Typography } from '@mui/material';
import { keyframes } from '@emotion/react';

/**
 * Tarjeta tipo wallet decorativa para el panel de marca del Login.
 * Solo presentación: datos estáticos, sin llamadas a APIs ni stores.
 * Colores configurables para branding por empresa.
 */

export interface WalletCardPreviewProps {
    /** Color base del degradado (normalmente brand.primary). */
    primary?: string;
    /** Color medio del degradado. */
    secondary?: string;
    /** Color profundo (esquina inferior). */
    deep?: string;
    /** Acento luminoso superior izquierdo. */
    glowA?: string;
    /** Acento luminoso inferior derecho. */
    glowB?: string;
    /** Color final del degradado de la tarjeta trasera. */
    backEnd?: string;
    /** Color de la sombra/halo bajo la tarjeta. */
    shadowColor?: string;
    holderName?: string;
    lastDigits?: string;
    expiry?: string;
}

const enter = keyframes`
  from { opacity: 0; transform: translateY(28px) rotateX(24deg); }
  to   { opacity: 1; transform: none; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0) rotateX(10deg) rotateY(-12deg) rotateZ(2deg); }
  50%      { transform: translateY(-8px) rotateX(5deg) rotateY(-5deg) rotateZ(0deg); }
`;

const sheen = keyframes`
  0%        { transform: translateX(-120%); }
  35%, 100% { transform: translateX(120%); }
`;

const reducedMotion = '@media (prefers-reduced-motion: reduce)';

function ContactlessIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M8.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M15.5 3.5a12 12 0 0 1 0 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

export default function WalletCardPreview({
    primary = '#A5A8DC',
    secondary = '#5E6192',
    deep = '#1C1D2A',
    glowA = 'rgba(214, 216, 245, 0.55)',
    glowB = 'rgba(129, 134, 214, 0.35)',
    backEnd = '#0B0B10',
    shadowColor = 'rgba(165, 168, 220, 0.28)',
    holderName = 'Cartera empresarial',
    lastDigits = '4821',
    expiry = '12/28',
}: WalletCardPreviewProps) {
    return (
        <Box
            aria-hidden="true"
            sx={{
                perspective: '900px',
                display: 'flex',
                justifyContent: 'center',
                py: 3,
                pointerEvents: 'none',
                userSelect: 'none',
            }}
        >
            {/* Entrada (una sola vez) */}
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 300,
                    animation: `${enter} 900ms cubic-bezier(.2,.8,.2,1) both`,
                    [reducedMotion]: { animation: 'none' },
                }}
            >
                {/* Flotación continua con inclinación 3D */}
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '1.586',
                        transformStyle: 'preserve-3d',
                        animation: `${float} 6s ease-in-out infinite`,
                        willChange: 'transform',
                        [reducedMotion]: { animation: 'none' },
                    }}
                >
                    {/* Tarjeta trasera (profundidad) */}
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '18px',
                            background: `linear-gradient(135deg, ${deep}, ${backEnd})`,
                            border: '1px solid rgba(255,255,255,0.08)',
                            transform: 'translate(14px, -16px) scale(0.94)',
                            opacity: 0.7,
                        }}
                    />

                    {/* Tarjeta principal */}
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '18px',
                            overflow: 'hidden',
                            p: '16px 18px',
                            color: '#FFFFFF',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            background: [
                                `radial-gradient(110% 130% at 0% 0%, ${glowA} 0%, transparent 48%)`,
                                `radial-gradient(120% 140% at 100% 100%, ${glowB} 0%, transparent 52%)`,
                                `linear-gradient(135deg, ${primary} 0%, ${secondary} 55%, ${deep} 100%)`,
                            ].join(', '),
                            boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.18), 0 24px 40px -14px ${shadowColor}`,
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                inset: 0,
                                background:
                                    'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.32) 48%, transparent 60%)',
                                transform: 'translateX(-120%)',
                                animation: `${sheen} 5s ease-in-out 1.2s infinite`,
                                [reducedMotion]: { animation: 'none', display: 'none' },
                            },
                            '& > *': { position: 'relative', zIndex: 1 },
                        }}
                    >
                        {/* Fila superior: chip + contactless */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box
                                sx={{
                                    width: 36,
                                    height: 27,
                                    borderRadius: '6px',
                                    background: 'linear-gradient(135deg, #F1F5F9, #94A3B8)',
                                    position: 'relative',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        inset: '6px 8px',
                                        border: '1px solid rgba(15,23,42,0.25)',
                                        borderRadius: '3px',
                                    },
                                }}
                            />
                            <Box sx={{ opacity: 0.9, display: 'flex' }}>
                                <ContactlessIcon />
                            </Box>
                        </Box>

                        {/* Número */}
                        <Typography
                            sx={{
                                fontSize: 16,
                                fontWeight: 600,
                                letterSpacing: '0.14em',
                                fontVariantNumeric: 'tabular-nums',
                                color: 'inherit',
                            }}
                        >
                            •••• •••• •••• {lastDigits}
                        </Typography>

                        {/* Titular + vencimiento */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <Box>
                                <Typography sx={{ fontSize: 10, opacity: 0.75, color: 'inherit' }}>Titular</Typography>
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'inherit' }}>
                                    {holderName}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography sx={{ fontSize: 10, opacity: 0.75, color: 'inherit' }}>Vence</Typography>
                                <Typography
                                    sx={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        fontVariantNumeric: 'tabular-nums',
                                        color: 'inherit',
                                    }}
                                >
                                    {expiry}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
