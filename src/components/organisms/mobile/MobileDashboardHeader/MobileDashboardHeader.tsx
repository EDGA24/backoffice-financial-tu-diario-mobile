import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import Avatar from '@/components/atoms/Avatar/Avatar';
import ThemeToggleButton from '@/components/atoms/ThemeToggleButton/ThemeToggleButton';

export interface MobileDashboardHeaderProps {
  userName: string;
  initials: string;
  onLogoutClick?: () => void;
}

const MobileDashboardHeader: React.FC<MobileDashboardHeaderProps> = ({
  userName,
  initials,
  onLogoutClick,
}) => {
  return (
    <Box
      sx={{
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        px: 2.5,
        pt: 3,
        pb: 2.5,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 500 }}>
            Bienvenido de nuevo
          </Typography>
          <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 19, mt: 0.25 }}>
            {userName}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ThemeToggleButton
            iconColor="#fff"
            sx={{ backgroundColor: 'rgba(255,255,255,0.15)', width: 36, height: 36 }}
          />
          <Avatar size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            {initials}
          </Avatar>

          <IconButton
            onClick={onLogoutClick}
            aria-label="Cerrar sesión"
            sx={{ backgroundColor: 'rgba(255,255,255,0.15)', width: 36, height: 36 }}
          >
            <LogoutRoundedIcon sx={{ color: '#fff', fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default MobileDashboardHeader;