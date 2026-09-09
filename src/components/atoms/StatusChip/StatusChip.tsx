import React from 'react';
import { Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Coincide con el enum real del backend (CreditStatusEnum.ts / TransactionStatusEnum.ts):
// minúsculas, guion bajo, y "reestructured" con doble "e" (no "restructured").
export type LoanStatus = 'charge_process' | 'slow_pay' | 'paid' | 'reestructured';

export interface StatusChipProps {
  status: LoanStatus;
}

const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  const theme = useTheme();

  const map: Record<LoanStatus, { label: string; color: string; bg: string }> = {
    charge_process: {
      label: 'En proceso',
      color: theme.palette.info.dark,
      bg: theme.palette.info.light + '33',
    },
    slow_pay: {
      label: 'Pago lento',
      color: theme.palette.warning.dark,
      bg: theme.palette.warning.light + '33',
    },
    paid: {
      label: 'Pagado',
      color: theme.palette.success.dark,
      bg: theme.palette.success.light + '33',
    },
    reestructured: {
      label: 'Reestructurado',
      color: theme.palette.error.dark,
      bg: theme.palette.error.light + '33',
    },
  };

  // Fallback defensivo: si llega un status que no está en el mapa
  // (dato inconsistente, campo vacío, etc.) no truena la app.
  const s = map[status] ?? {
    label: status ?? 'Sin estatus',
    color: theme.palette.text.secondary,
    bg: theme.palette.grey[300] + '55',
  };

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