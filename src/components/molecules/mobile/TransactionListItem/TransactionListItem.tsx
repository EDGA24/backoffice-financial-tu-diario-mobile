import React from 'react';
import { Box, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

export type TransactionKind = 'income' | 'expense' | 'transfer';

export interface TransactionListItemProps {
  icon: SvgIconComponent;
  title: string;
  subtitle: string;
  amount: string;
  kind: TransactionKind;
}

const toneMap: Record<TransactionKind, { color: string; bg: string; sign: string }> = {
  income: { color: '#2e7d32', bg: 'rgba(46,125,50,0.12)', sign: '+' },
  expense: { color: '#d32f2f', bg: 'rgba(211,47,47,0.1)', sign: '-' },
  transfer: { color: '#2a5298', bg: 'rgba(42,82,152,0.1)', sign: '' },
};

const TransactionListItem: React.FC<TransactionListItemProps> = ({
  icon: Icon,
  title,
  subtitle,
  amount,
  kind,
}) => {
  const tone = toneMap[kind];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1.5,
        px: 0.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: tone.bg,
          flexShrink: 0,
        }}
      >
        <Icon sx={{ color: tone.color, fontSize: 19 }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 13.5 }} noWrap>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
          {subtitle}
        </Typography>
      </Box>

      <Typography sx={{ fontWeight: 800, fontSize: 14, color: tone.color, flexShrink: 0 }}>
        {tone.sign}
        {amount}
      </Typography>
    </Box>
  );
};

export default TransactionListItem;