import { IconButton, Tooltip, type SxProps, type Theme } from '@mui/material';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import { useColorMode } from '@/theme/ColorModeContext';

export interface ThemeToggleButtonProps {
  sx?: SxProps<Theme>;
  iconColor?: string;
}

const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({ sx, iconColor = 'inherit' }) => {
  const { mode, toggleColorMode } = useColorMode();

  return (
    <Tooltip title={mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
      <IconButton onClick={toggleColorMode} aria-label="Cambiar tema" sx={sx}>
        {mode === 'dark' ? (
          <LightModeRoundedIcon sx={{ color: iconColor, fontSize: 18 }} />
        ) : (
          <DarkModeRoundedIcon sx={{ color: iconColor, fontSize: 18 }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggleButton;