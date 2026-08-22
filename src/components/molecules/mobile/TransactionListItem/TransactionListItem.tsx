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
  isPending?: boolean;
}

const toneMap: Record<TransactionKind, { color: string; bg: string; sign: string }> = {
  income: { color: '#1B8A5A', bg: 'rgba(27,138,90,0.12)', sign: '+' },
  expense: { color: '#D64545', bg: 'rgba(214,69,69,0.12)', sign: '-' },
  transfer: { color: '#2A5298', bg: 'rgba(42,82,152,0.12)', sign: '' },
};

const TransactionListItem: React.FC<TransactionListItemProps> = ({
  icon: Icon,
  title,
  subtitle,
  amount,
  kind,
  isPending = false,
}) => {
  const tone = toneMap[kind];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 2,
        px: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        transition: 'background-color 0.15s ease',
        '&:last-of-type': { borderBottom: 'none' },
        '&:active': { backgroundColor: 'action.hover' },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: tone.bg,
          flexShrink: 0,
        }}
      >
        <Icon sx={{ color: tone.color, fontSize: 22 }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.35 }} noWrap>
          {title}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{ display: 'block', fontSize: 12.5, mt: 0.25 }}
        >
          {subtitle}
        </Typography>
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 0.5,
        }}
      >
        {isPending && (
          <Box
            sx={{
              px: 0.75,
              py: 0.1,
              borderRadius: 999,
              backgroundColor: 'warning.light',
            }}
          >
            <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: 'warning.dark', whiteSpace: 'nowrap' }}>
              Pendiente
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            px: 1.25,
            py: 0.5,
            borderRadius: 999,
            backgroundColor: tone.bg,
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: 14, color: tone.color, whiteSpace: 'nowrap' }}>
            {tone.sign}
            {amount}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default TransactionListItem;