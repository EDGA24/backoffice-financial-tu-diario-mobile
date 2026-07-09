import React from 'react';
import { Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export type LoanStatus = 'paid' | 'restructured' | 'late';

export interface StatusChipProps {
  status: LoanStatus;
}

const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  const theme = useTheme();

  const map: Record<LoanStatus, { label: string; color: string; bg: string }> = {
    paid: {
      label: 'Pagado',
      color: theme.palette.success.dark,
      bg: theme.palette.success.light + '33',
    },
    restructured: {
      label: 'Reestructurado',
      color: theme.palette.warning.dark,
      bg: theme.palette.warning.light + '33',
    },
    late: {
      label: 'Vencido',
      color: theme.palette.error.dark,
      bg: theme.palette.error.light + '33',
    },
  };

  const s = map[status];

  return (
    <Chip
      label={s.label}
      size="small"
      sx={{
        color: s.color,
        backgroundColor: s.bg,
        fontWeight: 700,
        fontSize: 11,
        height: 22,
      }}
    />
  );
};

export default StatusChip;