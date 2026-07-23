import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';

export interface CustomerSummaryCardProps {
  name: string;
  lastName: string;
  status: string;
  phoneNumber: string;
  address: string;
  threeWordsUbication: string;
}

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'default'> = {
  ACTIVO: 'success',
  ATRASADO: 'warning',
};

const CustomerSummaryCard: React.FC<CustomerSummaryCardProps> = ({
  name,
  lastName,
  status,
  phoneNumber,
  address,
  threeWordsUbication,
}) => {
  const chipColor = STATUS_COLOR[status] ?? 'default';

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
        {name} {lastName}
      </Typography>

      <Chip label={status} color={chipColor} size="small" sx={{ width: 'fit-content', fontWeight: 500 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <PhoneRoundedIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
          {phoneNumber}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <PlaceRoundedIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
          {address}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <MyLocationRoundedIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
          {threeWordsUbication}
        </Typography>
      </Box>
    </Box>
  );
};

export default CustomerSummaryCard;