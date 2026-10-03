import React from 'react';
import { Backdrop, Box, Button, Divider, Fade, Stack, Typography } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import type { TransactionTable } from '@/types/TransactionTable';
import { openWhatsApp, buildTransactionWhatsAppMessage } from '@/shared/utils/whatsappUtils';

export interface TransactionDetailTicketProps {
  open: boolean;
  transaction: TransactionTable | null;
  onClose: () => void;
  // Mismo criterio que CreditSuccessTicket: el mensaje se manda al WhatsApp
  // de la empresa (creditorCompanyInfo.phoneNumber), no al del cliente. Si no
  // se manda (o viene vacío), simplemente no aparece el botón de compartir.
  whatsappPhone?: string;
  // "Ver crédito" — solo tiene sentido para movimientos de payment/credit
  // (los únicos que están relacionados a un crédito). Ver UserRoleCatalogs.tsx
  // en el backend para cómo se resuelve creditId vs transactionId.
  onViewCredit?: (params: { creditId?: string; transactionId?: string }) => void;
}

// Solo estos dos tipos de movimiento están relacionados a un crédito — un
// transfer/deposit/withdrawal no tiene forma de llegar a un crédito.
const CREDIT_LINKED_TYPES = ['payment', 'credit'];

const NOTCH_COUNT = 13;

const TYPE_LABELS: Record<string, string> = {
  credit: 'Desembolso de crédito',
  payment: 'Pago',
  transfer: 'Transferencia',
  deposit: 'Depósito',
  withdrawal: 'Retiro',
};

// Mismo criterio de tono que TransactionStatusOverlay/statusColors: verde =
// aprobada, ámbar = pendiente, rojo = cancelada.
const STATUS_THEME: Record<string, { gradient: string; label: string; icon: React.ElementType; iconColor: string }> = {
  approved: {
    gradient: 'linear-gradient(135deg, #12b886 0%, #0f9d75 55%, #0b7a5c 100%)',
    label: 'Aprobada',
    icon: CheckRoundedIcon,
    iconColor: '#0f9d75',
  },
  pending: {
    gradient: 'linear-gradient(135deg, #f5b93d 0%, #e0a12a 55%, #b87f1c 100%)',
    label: 'Pendiente',
    icon: ScheduleRoundedIcon,
    iconColor: '#b87f1c',
  },
  cancelled: {
    gradient: 'linear-gradient(135deg, #e05c5c 0%, #c94444 55%, #9c3232 100%)',
    label: 'Cancelada',
    icon: CloseRoundedIcon,
    iconColor: '#c94444',
  },
};

const formatCurrency = (value: number | undefined, currency?: string): string =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: currency || 'MXN' }).format(value ?? 0);

const formatDateTime = (isoDate?: string): string =>
  isoDate
    ? new Date(isoDate).toLocaleString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const TicketRow: React.FC<{ label: string; value: string; emphasize?: boolean }> = ({ label, value, emphasize }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2 }}>
    <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 13.5, flexShrink: 0 }}>{label}</Typography>
    <Typography
      sx={{
        fontFamily: "'Roboto Mono', monospace",
        fontWeight: emphasize ? 800 : 600,
        fontSize: emphasize ? 17 : 14,
        color: emphasize ? '#34d399' : '#fff',
        textAlign: 'right',
        wordBreak: 'break-word',
      }}
    >
      {value}
    </Typography>
  </Box>
);

const TicketNotches: React.FC = () => (
  <Box sx={{ position: 'relative', height: 0 }}>
    <Box
      sx={{
        position: 'absolute',
        top: -8,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-evenly',
        px: 0.5,
      }}
    >
      {Array.from({ length: NOTCH_COUNT }).map((_, index) => (
        <Box key={index} sx={{ width: 15, height: 15, borderRadius: '50%', bgcolor: '#0b0f14' }} />
      ))}
    </Box>
  </Box>
);

const FakeBarcode: React.FC<{ folio: string }> = ({ folio }) => (
  <Box sx={{ mt: 2.5, textAlign: 'center' }}>
    <Box
      sx={{
        height: 34,
        borderRadius: 0.5,
        background:
          'repeating-linear-gradient(90deg, #fff 0px, #fff 2px, transparent 2px, transparent 4px, #fff 4px, #fff 5px, transparent 5px, transparent 9px, #fff 9px, #fff 12px, transparent 12px, transparent 15px)',
        opacity: 0.9,
      }}
    />
    <Typography sx={{ mt: 0.75, fontFamily: "'Roboto Mono', monospace", fontSize: 10.5, letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>
      FOLIO {folio}
    </Typography>
  </Box>
);

// Ticket de detalle de un movimiento ya existente — mismo lenguaje visual que
// CreditSuccessTicket (header con gradiente, muescas perforadas, filas tipo
// recibo, código de barras), pero sin la secuencia de "imprimiendo": aquí solo
// se está consultando algo que ya pasó, no celebrando algo recién creado.
const TransactionDetailTicket: React.FC<TransactionDetailTicketProps> = ({ open, transaction, onClose, whatsappPhone, onViewCredit }) => {
  if (!transaction) return null;

  const status = transaction.status ?? 'pending';
  const theme = STATUS_THEME[status] ?? STATUS_THEME.pending;
  const StatusIcon = theme.icon;
  const typeLabel = TYPE_LABELS[transaction.transactionType ?? ''] ?? transaction.transactionType ?? 'Movimiento';
  const folio = (transaction._id ?? '').slice(-8) || '--------';

  // payment -> creditIdSource (viene directo en el documento, sin join);
  // credit  -> el propio _id de la transacción (matchea credits.transactionId).
  const canViewCredit = CREDIT_LINKED_TYPES.includes(transaction.transactionType ?? '') && Boolean(onViewCredit);

  const handleViewCredit = () => {
    if (!onViewCredit) return;
    if (transaction.transactionType === 'payment' && transaction.creditIdSource) {
      onViewCredit({ creditId: transaction.creditIdSource });
    } else if (transaction.transactionType === 'credit' && transaction._id) {
      onViewCredit({ transactionId: transaction._id });
    }
  };

  const handleSendWhatsApp = () => {
    if (!whatsappPhone) return;
    openWhatsApp(whatsappPhone, buildTransactionWhatsAppMessage({
      typeLabel,
      description: transaction.description,
      total: transaction.total ?? 0,
      currency: transaction.currency,
      statusLabel: theme.label,
      createdAt: transaction.createdAt,
    }));
  };

  return (
    <Backdrop
      open={open}
      onClick={onClose}
      sx={{
        zIndex: (muiTheme) => muiTheme.zIndex.drawer + 10,
        p: 2.5,
        alignItems: 'flex-end',
        backdropFilter: 'blur(3px)',
        bgcolor: 'rgba(3,6,10,0.72)',
      }}
    >
      {open && (
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            width: '100%',
            maxWidth: 340,
            mx: 'auto',
            mb: 'env(safe-area-inset-bottom, 12px)',
            '@keyframes ticketPrintUp': {
              '0%': { transform: 'translateY(130%)', opacity: 0 },
              '65%': { transform: 'translateY(-5%)', opacity: 1 },
              '100%': { transform: 'translateY(0)', opacity: 1 },
            },
            animation: 'ticketPrintUp 500ms cubic-bezier(0.22, 1.1, 0.36, 1) both',
          }}
        >
          <Box
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 30px 60px -12px rgba(0,0,0,0.6)',
              bgcolor: '#0b0f14',
            }}
          >
            {/* Header con gradiente según status */}
            <Box
              sx={{
                background: theme.gradient,
                pt: 4,
                pb: 3.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.18)',
                  border: '2px solid rgba(255,255,255,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    bgcolor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  }}
                >
                  <StatusIcon sx={{ fontSize: 30, color: theme.iconColor }} />
                </Box>
              </Box>
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 18, mt: 0.5 }}>
                {typeLabel}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 12.5 }}>
                Transacción {theme.label.toLowerCase()}
              </Typography>
            </Box>

            <TicketNotches />

            {/* Cuerpo tipo recibo */}
            <Fade in={open} timeout={350}>
              <Box sx={{ px: 3, pt: 3, pb: 1 }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                  Descripción
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#fff', mb: 2 }}>
                  {transaction.description || '—'}
                </Typography>

                <Divider sx={{ borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.15)' }} />

                <Stack spacing={1.4} sx={{ my: 2 }}>
                  <TicketRow label="Monto" value={formatCurrency(transaction.total, transaction.currency)} emphasize />
                  {transaction.sourceAccount?.accountNumber && (
                    <TicketRow label="Cuenta origen" value={transaction.sourceAccount.accountNumber} />
                  )}
                  {transaction.destinationAccount?.accountNumber && (
                    <TicketRow label="Cuenta destino" value={transaction.destinationAccount.accountNumber} />
                  )}
                  <TicketRow label="Fecha" value={formatDateTime(transaction.createdAt)} />
                </Stack>

                <Divider sx={{ borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.15)' }} />

                <FakeBarcode folio={folio} />
              </Box>
            </Fade>

            <Box sx={{ px: 3, pt: 2, pb: 3, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {canViewCredit && (
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AccountBalanceRoundedIcon />}
                  onClick={handleViewCredit}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                    py: 1.3,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    '&:hover': { borderColor: 'rgba(255,255,255,0.5)', bgcolor: 'rgba(255,255,255,0.05)' },
                  }}
                >
                  Ver crédito
                </Button>
              )}
              {whatsappPhone && (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<WhatsAppIcon />}
                  onClick={handleSendWhatsApp}
                  sx={{
                    bgcolor: '#25D366',
                    color: '#06210f',
                    fontWeight: 700,
                    fontSize: 14,
                    py: 1.3,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    boxShadow: '0 10px 24px rgba(37,211,102,0.35)',
                    '&:hover': { bgcolor: '#1fb959' },
                  }}
                >
                  Compartir
                </Button>
              )}
              <Button
                fullWidth
                variant="text"
                onClick={onClose}
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 13.5,
                }}
              >
                Cerrar
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Backdrop>
  );
};

export default TransactionDetailTicket;
