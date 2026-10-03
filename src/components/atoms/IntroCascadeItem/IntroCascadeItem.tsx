import React from 'react';
import { Box } from '@mui/material';
import { motionDelay, motionDuration } from '@/theme/motionTokens';

export type IntroVariant = 'none' | 'reduced' | 'full';

export interface IntroCascadeItemProps {
    children: React.ReactNode;
    // Posición dentro de la cascada (0, 1, 2…) — determina el retraso:
    // motionDelay.staggerStart + index * motionDuration.staggerGap.
    index: number;
    variant: IntroVariant;
    // true en cuanto se salta/skippea la intro — fuerza el estado final sin
    // animación, sin importar en qué punto de la cascada iba.
    skipped: boolean;
}

// Envuelve cualquier bloque del formulario para que entre en cascada durante
// la intro del Login (opacity + translateY 10px→0). Reutilizable para otras
// pantallas de auth que quieran el mismo efecto de entrada.
export const IntroCascadeItem: React.FC<IntroCascadeItemProps> = ({ children, index, variant, skipped }) => {
    if (variant === 'none' || skipped) {
        return <>{children}</>;
    }

    if (variant === 'reduced') {
        // prefers-reduced-motion: sin traslados/escalas — el contenido del
        // formulario simplemente ya está ahí cuando el fade general termina.
        return <>{children}</>;
    }

    const delayMs = motionDelay.staggerStart + index * motionDuration.staggerGap;

    return (
        <Box
            sx={{
                opacity: 0,
                animation: `login-intro-fade-up ${motionDuration.staggerItem}ms ${delayMs}ms forwards`,
            }}
        >
            {children}
        </Box>
    );
};

export default IntroCascadeItem;
