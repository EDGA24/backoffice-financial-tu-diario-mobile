export const spacingScale = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 24,
    xl: 32,
} as const;

export const radiusScale = {
    sm: 8,
    md: 12,   // inputs
    lg: 16,   // tarjetas
    xl: 24,   // hojas inferiores (sheet)
} as const;

export const fontFamily =
    "'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

// Tamaños enteros: los fraccionarios se renderizan distinto entre WebViews.
export const typeScale = {
    title: { fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
    description: { fontSize: 14, fontWeight: 400, letterSpacing: '0', lineHeight: 1.5 },
    label: { fontSize: 13, fontWeight: 600, letterSpacing: '0', lineHeight: 1.4 },
    input: { fontSize: 16, fontWeight: 500, letterSpacing: '0', lineHeight: 1.4 },
    button: { fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1 },
    aux: { fontSize: 12, fontWeight: 500, letterSpacing: '0', lineHeight: 1.4 },
} as const;

// Branding: una empresa futura sobrescribe este namespace completo.
export const brand = {
    // Primario con carácter pero sobrio. En oscuro se aclara para mantener
    // contraste, y el texto encima pasa a ser oscuro (ver onPrimary).
    primary: {
        light: '#4F46E5',
        dark: '#b0b4dd',
    },
    primaryPressed: {
        light: '#4338CA',
        dark: '#6366F1',
    },
    onPrimary: {
        light: '#FFFFFF',
        dark: '#0B1120',
    },
    // Halo de focus y fondos suaves de acento.
    primarySubtle: {
        light: 'rgba(79, 70, 229, 0.14)',
        dark: 'rgba(129, 140, 248, 0.20)',
    },
    // Panel de marca: MISMO valor en ambos modos y EXACTAMENTE igual al splash
    // nativo (colors.xml) y al frame 0 de LoginIntro, para que no haya costura.
    // Se distingue de la hoja (neutralPalette.*.surface) porque esta última
    // es más clara y, en oscuro, además lleva borde superior.
    surface: {
        light: '#040608',
        dark: '#040608',
    },
    // Elementos dentro del panel oscuro (tarjeta de producto, textos).
    onSurface: '#F8FAFC',
    onSurfaceMuted: '#94A3B8',
    surfaceCard: 'rgba(255, 255, 255, 0.06)',
    surfaceCardBorder: 'rgba(255, 255, 255, 0.10)',
    surfacePattern: 'rgba(148, 163, 184, 0.16)',
} as const;

// Semánticos en modo claro (se mantiene la forma original).
export const semanticColors = {
    success: '#059669',
    error: '#DC2626',
    warning: '#B45309',
    info: '#2563EB',
} as const;

// Semánticos en modo oscuro: más claros para contraste AA sobre #141925.
export const semanticColorsDark = {
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
} as const;

// Neutrales con un leve matiz frío (slate) para que combinen con el índigo.
export const neutralPalette = {
    light: {
        background: '#F5F7FB',
        surface: '#FFFFFF',
        inputBg: '#F8FAFC',
        border: '#E2E8F0',
        borderStrong: '#CBD5E1',
        textPrimary: '#0F172A',
        textSecondary: '#5B6475',
        textMuted: '#94A3B8',
        disabledBg: '#F1F5F9',
        disabledText: '#A3ACB9',
    },
    dark: {
        background: '#000000',
        surface: '#040608',
        inputBg: '#1A1A22',
        border: 'rgba(255, 255, 255, 0.10)',
        borderStrong: 'rgba(255, 255, 255, 0.18)',
        textPrimary: '#ffffff',
        textSecondary: '#a8b2c0',
        textMuted: '#64748B',
        disabledBg: 'rgba(255, 255, 255, 0.05)',
        disabledText: '#5B6475',
    },
} as const;