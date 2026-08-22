import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ThemeProvider, type PaletteMode } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import getAppTheme from './theme';

interface ColorModeContextValue {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextValue>({
  mode: 'light',
  toggleColorMode: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);

const STORAGE_KEY = 'app-color-mode';

const getInitialMode = (): PaletteMode => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<PaletteMode>(getInitialMode);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    // Sincroniza la clase .dark en <html> por si en algún lado usas
    // Tailwind/shadcn además de MUI (ver index.css con variables .dark).
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  const toggleColorMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const theme = useMemo(() => getAppTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggleColorMode }), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};