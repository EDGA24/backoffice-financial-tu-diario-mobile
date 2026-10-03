import React from 'react';
import { Box, Typography } from '@mui/material';
import { brand } from '@/theme/tokens';

export interface BrandHeaderConfig {
    // Logo de la empresa acreedora (futuro) — si no se manda, se usa el
    // monograma neutro de la plataforma.
    logo?: React.ReactNode;
    // Nombre de la empresa acreedora (futuro) — si no se manda, se usa el
    // texto genérico de plataforma ("Gestión de créditos").
    name?: string;
    // Consumido por el theme del auth flow (ver getAuthTheme), no por este
    // componente — se deja aquí solo para que una sola config baste.
    primaryColor?: string;
}

export interface BrandHeaderProps {
    config?: BrandHeaderConfig;
    // Ref al contenedor del logo — usado por LoginIntro (FLIP) para medir en
    // vivo dónde debe "aterrizar" el logo que viaja desde el splash.
    logoRef?: React.Ref<HTMLDivElement>;
}

// BrandHeader vive siempre sobre el panel oscuro (brand.surface) del Login —
// por eso usa brand.onSurface/brand.surface directo (mismo valor en ambos
// modos), no los tokens de modo claro/oscuro de la página.
const PlatformMark: React.FC = () => (
    <Box
        sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            bgcolor: brand.onSurface,
            color: brand.surface.light,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 15,
            fontWeight: 600,
        }}
    >
        G
    </Box>
);

// Sin config: monograma neutro de plataforma + "Gestión de créditos" (caso
// actual del Login, donde todavía no se conoce la empresa del usuario). Con
// config: muestra el logo/nombre de la empresa en el mismo lugar.
export const BrandHeader: React.FC<BrandHeaderProps> = ({ config, logoRef }) => {
    const logo = config?.logo ?? <PlatformMark />;
    const label = config?.name ?? 'Gestión de créditos';

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box ref={logoRef}>{logo}</Box>
            <Typography sx={{ fontSize: 15, fontWeight: 500, color: brand.onSurface }}>
                {label}
            </Typography>
        </Box>
    );
};

export default BrandHeader;
