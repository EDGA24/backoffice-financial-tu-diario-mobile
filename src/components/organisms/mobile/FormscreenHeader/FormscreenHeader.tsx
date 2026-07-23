import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

export interface FormScreenHeaderProps {
  title: string;
  onBack?: () => void;
}

const FormScreenHeader: React.FC<FormScreenHeaderProps> = ({ title, onBack }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1.5,
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <IconButton onClick={onBack} sx={{ color: 'text.primary' }}>
        <ArrowBackRoundedIcon />
      </IconButton>
      <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: 17 }}>{title}</Typography>
    </Box>
  );
};

export default FormScreenHeader;