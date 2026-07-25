import React from 'react';
import { Box, Typography } from '@mui/material';

export interface AuthScreenLayoutProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const NAVY = '#0B1E45';

const AuthScreenLayout: React.FC<AuthScreenLayoutProps> = ({ title, subtitle, icon, children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: NAVY,
        display: 'flex',
        flexDirection: 'column',
        px: 3.5,
        pt: 7,
        pb: 4,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>

      <Typography sx={{ fontSize: 24, fontWeight: 500, color: '#fff', textAlign: 'center', mb: 0.75 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', mb: 4 }}>
          {subtitle}
        </Typography>
      )}

      {children}
    </Box>
  );
};

export default AuthScreenLayout;