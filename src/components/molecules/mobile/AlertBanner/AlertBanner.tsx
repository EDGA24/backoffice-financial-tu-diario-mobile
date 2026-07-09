import React from 'react';
import { Box, Typography } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useTheme } from '@mui/material/styles';

export interface AlertBannerProps {
  text: string;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ text }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        mx: 2,
        mt: 2,
        p: 1.5,
        borderRadius: 3,
        backgroundColor: theme.palette.warning.light + '26', 
        border: `1px solid ${theme.palette.warning.light}`,
      }}
    >
      <WarningAmberRoundedIcon
        fontSize="small"
        sx={{ color: theme.palette.warning.dark, mt: '2px' }}
      />
      <Typography
        variant="caption"
        sx={{ color: theme.palette.warning.dark, fontWeight: 600, lineHeight: 1.35 }}
      >
        {text}
      </Typography>
    </Box>
  );
};

export default AlertBanner;