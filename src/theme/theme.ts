import { createTheme, type PaletteMode, type Theme } from '@mui/material/styles';

// Colores de marca — se mantienen iguales en claro y oscuro
const brand = {
  primary: '#1e3c72',
  primaryDark: '#16305c',
  secondary: '#2a5298',
  success: '#2e7d32',
  successBg: '#e8f5e9',
  warning: '#ed6c02',
  warningBg: '#fff4e5',
  danger: '#d32f2f',
  dangerBg: '#fdecea',
  purple: '#9c27b0',
  purpleBg: '#f5e9fa',
};

export const getAppTheme = (mode: PaletteMode): Theme =>
  createTheme({
    palette: {
      mode,
      primary: { main: brand.primary },
      secondary: { main: brand.secondary },
      success: { main: brand.success },
      warning: { main: brand.warning },
      error: { main: brand.danger },
      ...(mode === 'light'
        ? {
            background: { default: '#f4f5f8', paper: '#ffffff' },
            text: { primary: '#1a1f2b', secondary: '#6b7280' },
            divider: '#e8eaf0',
          }
        : {
            background: { default: '#101218', paper: '#1a1d24' },
            text: { primary: '#f4f5f8', secondary: '#9aa1ae' },
            divider: 'rgba(255,255,255,0.08)',
          }),
    },
  });

// Se mantiene por compatibilidad con imports existentes de `colors` en tu código.
// OJO: estos valores NO cambian con el modo oscuro (son estáticos). Si algún
// componente los usa directamente en vez de theme.palette, no vas a ver el
// cambio de tema ahí — conviene migrarlo a `sx={{ color: 'text.secondary' }}`
// (theme-aware) en vez de `color: colors.textMuted` (fijo).
export const colors = {
  primary: brand.primary,
  primaryDark: brand.primaryDark,
  secondary: brand.secondary,
  bg: '#f4f5f8',
  surface: '#ffffff',
  textMain: '#1a1f2b',
  textMuted: '#6b7280',
  border: '#e8eaf0',
  success: brand.success,
  successBg: brand.successBg,
  warning: brand.warning,
  warningBg: brand.warningBg,
  danger: brand.danger,
  dangerBg: brand.dangerBg,
  purple: brand.purple,
  purpleBg: brand.purpleBg,
};

export default getAppTheme;