import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import Avatar from '@/components/atoms/Avatar/Avatar';
import StatusChip from '@/components/atoms/StatusChip/StatusChip';
import type { LoanSummary } from '../DashboardContacTable/DashboardContacTable';


export interface ContactPaymentListProps {
  loans: LoanSummary[];
  onPagar?: (loan: LoanSummary, index: number) => Promise<void> | void;
 
  esPagado?: (loan: LoanSummary) => boolean;
  emptyMessage?: string;
}

export default function ContactPaymentList({
  loans,
  onPagar,
  esPagado,
  emptyMessage = 'No hay registros por mostrar',
}: ContactPaymentListProps) {

  const [pagandoIndex, setPagandoIndex] = useState<number | null>(null);

  const handlePagar = async (loan: LoanSummary, index: number) => {
    if (pagandoIndex !== null || !onPagar) return;
    try {
      setPagandoIndex(index);
      await onPagar(loan, index);
    } finally {
      setPagandoIndex(null);
    }
  };

  if (loans.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5} sx={{ width: '100%' }}>
      {loans.map((loan, i) => {
        const estaPagando = pagandoIndex === i;
        const yaPagado = esPagado ? esPagado(loan) : false;

        return (
          <Card
            key={loan.phone + i}
            variant="outlined"
            sx={{ borderRadius: 3, boxShadow: 'none' }}
          >
            <CardContent
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 2,
                '&:last-child': { pb: 2 },
              }}
            >
              <Avatar size="medium">{loan.initials}</Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                  {loan.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap component="div">
                  {loan.phone} · {loan.date}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.5, alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {loan.amount}
                  </Typography>
                  <StatusChip status={loan.status} />
                </Stack>
              </Box>

              <Button
                variant={yaPagado ? 'outlined' : 'contained'}
                color={yaPagado ? 'success' : 'primary'}
                size="small"
                disableElevation
                disabled={yaPagado || estaPagando}
                onClick={() => handlePagar(loan, i)}
                startIcon={
                  estaPagando ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : yaPagado ? (
                    <CheckCircleRoundedIcon fontSize="small" />
                  ) : (
                    <PaymentsRoundedIcon fontSize="small" />
                  )
                }
                sx={{
                  minWidth: 92,
                  whiteSpace: 'nowrap',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                {yaPagado ? 'Pagado' : estaPagando ? '...' : 'Pagar'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}