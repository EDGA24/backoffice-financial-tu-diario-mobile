import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import Avatar from '@/components/atoms/Avatar/Avatar';
import StatusChip from '@/components/atoms/StatusChip/StatusChip';
import LoanExpandedDetails from './LoanExpandedDetails';
import PaymentHistoryModal from './PaymentHistoryModal';
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
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [loanEnModal, setLoanEnModal] = useState<LoanSummary | null>(null);

  const handlePagar = async (
    e: React.MouseEvent,
    loan: LoanSummary,
    index: number
  ) => {
    e.stopPropagation();
    if (pagandoIndex !== null || !onPagar) return;
    try {
      setPagandoIndex(index);
      await onPagar(loan, index);
    } finally {
      setPagandoIndex(null);
    }
  };

  const toggleExpand = (key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  const handleVerHistorial = (e: React.MouseEvent, loan: LoanSummary) => {
    e.stopPropagation();
    setLoanEnModal(loan);
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
    <>
      <Stack spacing={1.5} sx={{ width: '100%' }}>
        {loans.map((loan, i) => {
          const estaPagando = pagandoIndex === i;
          const yaPagado = esPagado ? esPagado(loan) : false;
          const key = `${loan.phone}-${loan.date}-${i}`;
          const estaExpandido = expandedKey === key;

          return (
            <Card
              key={key}
              variant="outlined"
              sx={{ borderRadius: 3, boxShadow: 'none' }}
            >
              <CardContent
                onClick={() => toggleExpand(key)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.25,
                  p: 2,
                  cursor: 'pointer',
                  '&:last-child': { pb: 2 },
                }}
              >
                {/* Fila 1: avatar + nombre/teléfono + ojito + flecha */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Avatar size="medium">{loan.initials}</Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                      {loan.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      component="div"
                    >
                      {loan.phone} · {loan.date}
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={(e) => handleVerHistorial(e, loan)}
                    sx={{ flexShrink: 0, mt: -0.25 }}
                    aria-label="Ver historial de pagos"
                  >
                    <VisibilityRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </IconButton>

                  <ExpandMoreRoundedIcon
                    sx={{
                      color: 'text.secondary',
                      flexShrink: 0,
                      mt: 0.5,
                      transform: estaExpandido ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.25s ease',
                    }}
                  />
                </Box>

                {/* Fila 2: monto/status a la izquierda, botón a la derecha */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    rowGap: 1,
                    columnGap: 1,
                    pl: '52px',
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', flexShrink: 0 }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {loan.amount}
                    </Typography>
                    <StatusChip status={loan.status} />
                  </Stack>

                  <Button
                    variant={yaPagado ? 'outlined' : 'contained'}
                    color={yaPagado ? 'success' : 'primary'}
                    size="small"
                    disableElevation
                    disabled={yaPagado || estaPagando}
                    onClick={(e) => handlePagar(e, loan, i)}
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
                      flexShrink: 0,
                      ml: 'auto',
                    }}
                  >
                    {yaPagado ? 'Pagado' : estaPagando ? '...' : 'Pagar'}
                  </Button>
                </Box>
              </CardContent>

              <Collapse in={estaExpandido} timeout={250} unmountOnExit>
                <Box sx={{ px: 2, pb: 2, pt: 0 }}>
                  <LoanExpandedDetails loan={loan} />
                </Box>
              </Collapse>
            </Card>
          );
        })}
      </Stack>

      <PaymentHistoryModal
        open={loanEnModal !== null}
        onClose={() => setLoanEnModal(null)}
        loan={loanEnModal}
      />
    </>
  );
}