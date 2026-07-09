import React from 'react';
import { ButtonBase, Typography, Box } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

export interface WalletActionButtonProps {
  icon: SvgIconComponent;
  label: string;
  onClick?: () => void;
}

const WalletActionButton: React.FC<WalletActionButtonProps> = ({ icon: Icon, label, onClick }) => {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.75,
        '&:active': { transform: 'scale(0.95)' },
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.18)',
        }}
      >
        <Icon sx={{ color: '#fff', fontSize: 22 }} />
      </Box>
      <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600, fontSize: 11.5 }}>
        {label}
      </Typography>
    </ButtonBase>
  );
};

export default WalletActionButton;