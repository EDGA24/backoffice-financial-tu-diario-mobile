import React from 'react';
import { Box, Divider, Typography } from '@mui/material';

export interface CreditsSummaryCardProps {
  totalPorCobrar: string;
  totalCobrado: string;
  pendientePorCobrar: string;
}

interface SummaryItem {
  label: string;
  value: string;
  color: string;
}

const CreditsSummaryCard: React.FC<CreditsSummaryCardProps> = ({
  totalPorCobrar,
  totalCobrado,
  pendientePorCobrar,
}) => {
  const items: SummaryItem[] = [
    { label: 'Por cobrar', value: totalPorCobrar, color: 'text.primary' },
    { label: 'Cobrado', value: totalCobrado, color: 'success.main' },
    { label: 'Pendiente', value: pendientePorCobrar, color: 'warning.main' },
  ];

  return (
    <Box sx={{ mx: 2.5, mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          borderRadius: 3,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          py: 1.25,
        }}
      >
        {items.map((item, index) => (
          <React.Fragment key={item.label}>
            {index > 0 && <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />}
            <Box sx={{ flex: 1, textAlign: 'center', px: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 15, color: item.color, lineHeight: 1.2 }}>
                {item.value}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10.5 }}>
                {item.label}
              </Typography>
            </Box>
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default CreditsSummaryCard;
