import React, { useEffect, useState } from 'react';
import { Backdrop, Box, Button, Divider, Fade, LinearProgress, Skeleton, Stack, Typography } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { formatTicketDateTime } from '@/shared/utils/whatsappUtils';
import { PENDING_APPROVAL_YELLOW } from '@/shared/constants/statusColors';

export interface CreditSuccessTicketProps {
  open: boolean;
  customerName: string;
  creditAmount: number;
  chargeAmount: number;
  chargeFrequencyLabel: string;
  chargePeriods: number;
  createdAt: number;
  status: string;
  // Solo si la regla trae primer cobro (firstCharge) y el pago se registró.
  firstChargeAmount?: number;
  canSendWhatsApp: boolean;
  onSendWhatsApp: () => void;
  onContinue: () => void;
}

// Cuánto se queda el ticket "imprimiéndose" (skeleton + barra) antes de
// revelar los datos reales — puramente cosmético, para que se sienta como un
// recibo que se está generando en vez de aparecer todo de golpe.
const PRINTING_DURATION_MS = 1000;
const NOTCH_COUNT = 13;

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

const TicketRow: React.FC<{ label: string; value: string; emphasize?: boolean }> = ({
  label,
  value,
  emphasize,
}) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
    <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 13.5 }}>{label}</Typography>
    <Typography
      sx={{
        fontFamily: "'Roboto Mono', monospace",
        fontWeight: emphasize ? 800 : 600,
        fontSize: emphasize ? 17 : 14,
        color: emphasize ? '#34d399' : '#fff',
      }}
    >
      {value}
    </Typography>
  </Box>
);

// Fila de "muescas" que simulan el borde perforado de un ticket real, justo
// donde el header verde se corta con el cuerpo oscuro.
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

// Franja tipo código de barras — puro adorno, refuerza la idea de "recibo
// impreso" al final del ticket.
const FakeBarcode: React.FC<{ folio: string; createdAt: number }> = ({ folio, createdAt }) => (
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
    <Typography sx={{ fontFamily: "'Roboto Mono', monospace", fontSize: 10.5, color: 'rgba(255,255,255,0.4)' }}>
      {formatTicketDateTime(createdAt)}
    </Typography>
  </Box>
);

const CreditSuccessTicket: React.FC<CreditSuccessTicketProps> = ({
  open,
  customerName,
  creditAmount,
  chargeAmount,
  chargeFrequencyLabel,
  chargePeriods,
  createdAt,
  status,
  firstChargeAmount,
  canSendWhatsApp,
  onSendWhatsApp,
  onContinue,
}) => {
  const [stage, setStage] = useState<'printing' | 'ready'>('printing');
  const [folio] = useState(() => String(Date.now()).slice(-8));

  useEffect(() => {
    if (!open) {
      setStage('printing');
      return;
    }
    const timer = setTimeout(() => setStage('ready'), PRINTING_DURATION_MS);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 10,
        p: 2.5,
        alignItems: 'flex-end',
        backdropFilter: 'blur(3px)',
        bgcolor: 'rgba(3,6,10,0.72)',
      }}
    >
      {open && (
        <Box
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
            animation: 'ticketPrintUp 620ms cubic-bezier(0.22, 1.1, 0.36, 1) both',
          }}
        >
          <Box
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 -8px 40px -4px rgba(18,184,134,0.25), 0 30px 60px -12px rgba(0,0,0,0.6)',
              bgcolor: '#0b0f14',
            }}
          >
            {/* Header con gradiente + sello de éxito */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #12b886 0%, #0f9d75 55%, #0b7a5c 100%)',
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
                  <CheckRoundedIcon sx={{ fontSize: 30, color: '#0f9d75' }} />
                </Box>
              </Box>
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 18, mt: 0.5 }}>
                ¡Crédito registrado!
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 12.5 }}>
                La operación se completó correctamente
              </Typography>
              <Box
                sx={{
                  mt: 0.75,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 5,
                  bgcolor: 'rgba(0,0,0,0.25)',
                  border: `1px solid ${PENDING_APPROVAL_YELLOW}66`,
                }}
              >
                <Typography sx={{ color: PENDING_APPROVAL_YELLOW, fontWeight: 700, fontSize: 11.5, letterSpacing: 0.3 }}>
                  ⏳ {status}
                </Typography>
              </Box>
            </Box>

            <TicketNotches />

            {/* Cuerpo tipo recibo */}
            <Box sx={{ px: 3, pt: 3, pb: 1, minHeight: 190 }}>
              {stage === 'printing' ? (
                <Box>
                  <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#34d399',
                        boxShadow: '0 0 0 0 rgba(52,211,153,0.6)',
                        '@keyframes pulseDot': {
                          '0%': { boxShadow: '0 0 0 0 rgba(52,211,153,0.55)' },
                          '70%': { boxShadow: '0 0 0 8px rgba(52,211,153,0)' },
                          '100%': { boxShadow: '0 0 0 0 rgba(52,211,153,0)' },
                        },
                        animation: 'pulseDot 1.1s ease-out infinite',
                      }}
                    />
                    <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: 12.5, fontStyle: 'italic' }}>
                      Imprimiendo ticket…
                    </Typography>
                  </Stack>

                  <Skeleton variant="text" width="55%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
                  <Skeleton variant="text" width="75%" height={26} sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 1.5 }} />

                  <Divider sx={{ borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.15)' }} />

                  <Stack spacing={1.6} sx={{ my: 2 }}>
                    {[0, 1, 2].map((row) => (
                      <Box key={row} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Skeleton variant="text" width="40%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
                        <Skeleton variant="text" width="25%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
                      </Box>
                    ))}
                  </Stack>

                  <LinearProgress
                    variant="indeterminate"
                    sx={{
                      height: 3,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.08)',
                      '& .MuiLinearProgress-bar': { bgcolor: '#12b886' },
                    }}
                  />
                </Box>
              ) : (
                <Fade in timeout={450}>
                  <Box>
                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                      Cliente
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: 17, color: '#fff', mb: 2 }}>
                      {customerName}
                    </Typography>

                    <Divider sx={{ borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.15)' }} />

                    <Stack spacing={1.4} sx={{ my: 2 }}>
                      <TicketRow label="Monto del crédito" value={formatCurrency(creditAmount)} emphasize />
                      <TicketRow label={`Pago ${chargeFrequencyLabel}`} value={formatCurrency(chargeAmount)} />
                      <TicketRow label="Número de pagos" value={String(chargePeriods)} />
                      {firstChargeAmount !== undefined && (
                        <TicketRow label="Primer pago registrado" value={formatCurrency(firstChargeAmount)} />
                      )}
                    </Stack>

                    <Divider sx={{ borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.15)' }} />

                    <FakeBarcode folio={folio} createdAt={createdAt} />
                  </Box>
                </Fade>
              )}
            </Box>

            {/* Acciones — no se montan hasta que el ticket "termina de
                imprimirse", así no se pueden picar mientras se ve el skeleton. */}
            {stage === 'ready' && (
              <Fade in timeout={400}>
                <Box sx={{ px: 3, pt: 2, pb: 3, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {canSendWhatsApp && (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<WhatsAppIcon />}
                      onClick={onSendWhatsApp}
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
                    onClick={onContinue}
                    sx={{
                      color: 'rgba(255,255,255,0.7)',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: 13.5,
                    }}
                  >
                    Continuar
                  </Button>
                </Box>
              </Fade>
            )}
          </Box>
        </Box>
      )}
    </Backdrop>
  );
};

export default CreditSuccessTicket;
