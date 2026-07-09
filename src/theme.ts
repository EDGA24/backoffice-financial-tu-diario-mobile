import { createTheme } from '@mui/material/styles';

const customTheme = {
  palette: {
    primary: {
      main: '#1e3c72',
    },
    secondary: {
      main: '#2a5298',
    },
  },
};

const colors = {
  primary: "#1e3c72",
  primaryDark: "#16305c",
  secondary: "#2a5298",
  bg: "#f4f5f8",
  surface: "#ffffff",
  textMain: "#1a1f2b",
  textMuted: "#6b7280",
  border: "#e8eaf0",
  success: "#2e7d32",
  successBg: "#e8f5e9",
  warning: "#ed6c02",
  warningBg: "#fff4e5",
  danger: "#d32f2f",
  dangerBg: "#fdecea",
  purple: "#9c27b0",
  purpleBg: "#f5e9fa",
};

const theme = createTheme(customTheme);

export default theme;
