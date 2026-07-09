import React from 'react';
import { Box, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

export interface MobileStatCardProps {
  icon: SvgIconComponent;
  value: string | number;
  label: string;
  color: string;
  bg: string; 
}

const MobileStatCard: React.FC<MobileStatCardProps> = ({ icon: Icon, value, label, color, bg }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        borderRadius: 3,
        p: 1.75,
        width: 132,
        flexShrink: 0,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg,
        }}
      >
        <Icon sx={{ color, fontSize: 20 }} />
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: 19, lineHeight: 1 }}>{value}</Typography>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            display: 'block',
            mt: 0.5
          }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

export default MobileStatCard;