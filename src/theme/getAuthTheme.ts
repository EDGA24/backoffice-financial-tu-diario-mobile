import { createTheme, darken, type PaletteMode, type Theme } from '@mui/material/styles';
import { brand, fontFamily, neutralPalette, semanticColors, semanticColorsDark } from './tokens';

export interface AuthThemeConfig {
    // Color de marca de la empresa acreedora (futuro) — si no se manda, se
    // usa el primario neutral de plataforma (ver tokens.brand.primary).
    primaryColor?: string;
}

// Tokens propios del auth flow que no tienen un slot nativo en MUI Palette
// (estado pressed, halo de foco, superficies dentro del panel oscuro, etc.)
// — se exponen aparte en `theme.authTokens` para poder usarlos en `sx`
// callbacks igual que `theme.palette.*`, sin inventarle campos falsos a
// Palette. Ver la extensión de tipos más abajo.
export interface AuthThemeTokens {
    primaryPressed: string;
    onPrimary: string;
    primarySubtle: string;
    inputBg: string;
    borderStrong: string;
    textMuted: string;
    onSurface: string;
    onSurfaceMuted: string;
    surfaceCard: string;
    surfaceCardBorder: string;
    surfacePattern: string;
}

declare module '@mui/material/styles' {
    interface Theme {
        authTokens: AuthThemeTokens;
    }
    interface ThemeOptions {
        authTokens?: AuthThemeTokens;
    }
}

// Theme AISLADO para el flujo de autenticación (Login, y a futuro "Olvidé mi
// contraseña"). A propósito NO es el mismo theme que `theme/theme.ts` (el de
// toda la app): así el branding del Login no cambia el look de ninguna
// pantalla ya existente, y una empresa futura puede inyectar su propio
// primaryColor aquí sin tocar el resto del theme de la app.
export const getAuthTheme = (mode: PaletteMode, config?: AuthThemeConfig): Theme => {
    const n = neutralPalette[mode];
    const semantic = mode === 'light' ? semanticColors : semanticColorsDark;
    const primaryMain = config?.primaryColor ?? brand.primary[mode];
    // Si viene un primaryColor de una empresa (no tenemos su "pressed" de
    // marca), lo oscurecemos nosotros; si es el neutral de plataforma, se usa
    // el primaryPressed ya diseñado para ese color exacto.
    const primaryPressed = config?.primaryColor ? darken(config.primaryColor, 0.12) : brand.primaryPressed[mode];

    return createTheme({
        palette: {
            mode,
            primary: { main: primaryMain, dark: primaryPressed, contrastText: brand.onPrimary[mode] },
            success: { main: semantic.success },
            error: { main: semantic.error },
            warning: { main: semantic.warning },
            info: { main: semantic.info },
            background: { default: n.background, paper: n.surface },
            text: { primary: n.textPrimary, secondary: n.textSecondary },
            divider: n.border,
            action: { disabledBackground: n.disabledBg, disabled: n.disabledText },
        },
        typography: {
            fontFamily,
        },
        authTokens: {
            primaryPressed,
            onPrimary: brand.onPrimary[mode],
            primarySubtle: brand.primarySubtle[mode],
            inputBg: n.inputBg,
            borderStrong: n.borderStrong,
            textMuted: n.textMuted,
            onSurface: brand.onSurface,
            onSurfaceMuted: brand.onSurfaceMuted,
            surfaceCard: brand.surfaceCard,
            surfaceCardBorder: brand.surfaceCardBorder,
            surfacePattern: brand.surfacePattern,
        },
    });
};

export default getAuthTheme;
