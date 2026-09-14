import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
   Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import Avatar from '@/components/atoms/Avatar/Avatar';
import StatusChip from '@/components/atoms/StatusChip/StatusChip';
import LoanExpandedDetails from './LoanExpandedDetails';
import PaymentHistoryModal from './PaymentHistoryModal';
import PaymentAmountModal from './PaymentAmountModal';
import RenewalFlowModal from './RenewalFlowModal';
import type { LoanSummary, PaymentRecord } from '../DashboardContacTable/DashboardContacTable';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import { useNavigate } from 'react-router-dom';
import { useCreditStore } from '@/stores/credits.store';
import type { PaymentTable } from '@/types/PaymentTable';
import { PENDING_APPROVAL_YELLOW, ON_TIME_PAYMENT_GREEN, RENEWAL_AVAILABLE_CYAN } from '@/shared/constants/statusColors';

const PAYMENT_STATUS_MAP: Record<string, PaymentRecord['status']> = {
  approved: 'pagado',
  pending: 'pendiente',
  cancelled: 'cancelado',
};

const mapPaymentStatus = (status?: string): PaymentRecord['status'] =>
  PAYMENT_STATUS_MAP[(status ?? '').toLowerCase()] ?? 'pendiente';

const formatPaymentDate = (isoDate?: string) =>
  isoDate
    ? new Date(isoDate).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' })
    : '';

// El umbral real de renovación es fixedCharge * renovationPeriod, equivalente
// a (renovationPeriod / chargePeriods) del total a pagar — se calcula por
// crédito porque chargeRules varía entre empresas/créditos, no es un número fijo.
const buildRenovacionTooltip = (loan: LoanSummary): string => {
  const { renovationPeriod, chargePeriods } = loan;
  if (!renovationPeriod || !chargePeriods) {
    return 'Aún no alcanza el número de pagos requerido para renovar';
  }
  const porcentaje = ((renovationPeriod / chargePeriods) * 100).toFixed(1);
  return `Disponible al alcanzar el pago ${renovationPeriod} de ${chargePeriods} (${porcentaje}% del crédito liquidado)`;
};

const mapPaymentToRecord = (payment: PaymentTable, index: number): PaymentRecord => ({
  id: payment._id ?? `pago-${index}`,
  date: formatPaymentDate(payment.createdAt),
  amount: payment.total ?? 0,
  status: mapPaymentStatus(payment.transactionStatus),
  method: payment.paymentMethod,
});

export interface ContactPaymentListProps {
  loans: LoanSummary[];
  onPagar?: (loan: LoanSummary, index: number, amount: number) => Promise<void> | void;
  esPagado?: (loan: LoanSummary) => boolean;
  esElegibleParaRenovar?: (loan: LoanSummary) => boolean;
  emptyMessage?: string;
}
export default function ContactPaymentList({
  loans,
  onPagar,
  esPagado,
  esElegibleParaRenovar,
  emptyMessage = 'No hay registros por mostrar',
}: ContactPaymentListProps) {
  const navigate = useNavigate();
  const { getPaymentByCredit } = useCreditStore();
  const [pagandoIndex, setPagandoIndex] = useState<number | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [loanEnModal, setLoanEnModal] = useState<LoanSummary | null>(null);
  const [loanEnPagoModal, setLoanEnPagoModal] = useState<{ loan: LoanSummary; index: number } | null>(null);
  const [loanEnRenovacionModal, setLoanEnRenovacionModal] = useState<LoanSummary | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [loadingHistorialIndex, setLoadingHistorialIndex] = useState<number | null>(null);
  // Pagos reales por crédito para la tarjeta expandida (progreso/próximo pago),
  // separado del historial del modal del ojo — se cachea por creditId para no
  // volver a pedirlo si ya se expandió antes.
  const [realPaymentsByCreditId, setRealPaymentsByCreditId] = useState<Record<string, PaymentTable[]>>({});
  const [loadingExpandIndex, setLoadingExpandIndex] = useState<number | null>(null);

  const handleAbrirMenuAcciones = (
    e: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setMenuIndex(index);
  };

  const handleCerrarMenuAcciones = () => {
    setAnchorEl(null);
    setMenuIndex(null);
  };

  const handleAbrirModalPago = (
    e: React.MouseEvent,
    loan: LoanSummary,
    index: number
  ) => {
    e.stopPropagation();
    handleCerrarMenuAcciones();
    setLoanEnPagoModal({ loan, index });
  };

  const handleConfirmarPago = async (amount: number) => {
    if (!loanEnPagoModal || pagandoIndex !== null || !onPagar) return;
    const { loan, index } = loanEnPagoModal;
    try {
      setPagandoIndex(index);
      await onPagar(loan, index, amount);
      setLoanEnPagoModal(null);
    } finally {
      setPagandoIndex(null);
    }
  };

  const handleRenovar = (e: React.MouseEvent, loan: LoanSummary) => {
    e.stopPropagation();

    // Guard: nunca navegamos si el crédito no es elegible,
    // sin importar el estado visual del botón.
    const puedeRenovar = esElegibleParaRenovar ? esElegibleParaRenovar(loan) : true;
    if (!puedeRenovar) {
      handleCerrarMenuAcciones();
      return;
    }

    handleCerrarMenuAcciones();
    setLoanEnRenovacionModal(loan);
  };

  // Se llama cuando RenewalFlowModal ya registró el pago de la cuota —
  // aquí sí se navega, con el mismo state que antes usaba handleRenovar.
  const handleRenovacionLista = (loan: LoanSummary) => {
    setLoanEnRenovacionModal(null);
    navigate('/customer-create', {
      state: {
        modo: 'renovacion',
        loan,
      },
    });
  };

  const toggleExpand = async (key: string, loan: LoanSummary, index: number) => {
    const seVaAExpandir = expandedKey !== key;
    setExpandedKey(seVaAExpandir ? key : null);

    if (!seVaAExpandir || !loan.creditId || realPaymentsByCreditId[loan.creditId]) return;

    try {
      setLoadingExpandIndex(index);
      const { records } = await getPaymentByCredit({ creditId: loan.creditId });
      setRealPaymentsByCreditId((prev) => ({ ...prev, [loan.creditId as string]: records }));
    } catch (error) {
      console.error('Error al obtener pagos reales del crédito:', error);
      setRealPaymentsByCreditId((prev) => ({ ...prev, [loan.creditId as string]: [] }));
    } finally {
      setLoadingExpandIndex(null);
    }
  };

  const handleVerHistorial = async (e: React.MouseEvent, loan: LoanSummary, index: number) => {
    e.stopPropagation();

    if (!loan.creditId) {
      setLoanEnModal(loan);
      return;
    }

    try {
      setLoadingHistorialIndex(index);
      const { records } = await getPaymentByCredit({ creditId: loan.creditId });
      setLoanEnModal({ ...loan, historialPagos: records.map(mapPaymentToRecord) });
    } catch (error) {
      console.error('Error al obtener el historial de pagos:', error);
      setLoanEnModal({ ...loan, historialPagos: [] });
    } finally {
      setLoadingHistorialIndex(null);
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
    <>
      <Stack spacing={1.5} sx={{ width: '100%' }}>
        {loans.map((loan, i) => {
          const estaPagando = pagandoIndex === i;
          const yaPagado = esPagado ? esPagado(loan) : false;
          const puedeRenovar = esElegibleParaRenovar ? esElegibleParaRenovar(loan) : true;
          const pagoPendiente = loan.transactionPaymentStatusTemp === 'pending';
          const pagoATiempo = loan.transactionPaymentStatusTemp === 'onTime';
          const key = `${loan.phone}-${loan.date}-${i}`;
          const estaExpandido = expandedKey === key;
          // pagoPendiente bloquea "Pagar"/"Renovar" mientras el último pago
          // siga sin aprobar — si no, se puede seguir registrando pagos
          // encima de uno que ya está esperando aprobación.
          const disabledAcciones = yaPagado || estaPagando || pagoPendiente;

          return (
            <Card
              key={key}
              variant="outlined"
              sx={{
                borderRadius: 3,
                boxShadow: 'none',
                ...(pagoATiempo && {
                  backgroundColor: alpha(ON_TIME_PAYMENT_GREEN, 0.28),
                  borderColor: alpha(ON_TIME_PAYMENT_GREEN, 0.85),
                  borderWidth: 1.5,
                }),
                // Disponible para renovar: se pinta encima de "a tiempo" (verde) si
                // aplica, pero "pendiente de aprobación" (amarillo) sigue siendo lo
                // más urgente y gana al final si coinciden.
                ...(puedeRenovar && {
                  backgroundColor: alpha(RENEWAL_AVAILABLE_CYAN, 0.28),
                  borderColor: alpha(RENEWAL_AVAILABLE_CYAN, 0.85),
                  borderWidth: 1.5,
                }),
                ...(pagoPendiente && {
                  backgroundColor: alpha(PENDING_APPROVAL_YELLOW, 0.28),
                  borderColor: alpha(PENDING_APPROVAL_YELLOW, 0.85),
                  borderWidth: 1.5,
                }),
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.25,
                  p: 2,
                  '&:last-child': { pb: 2 },
                }}
              >
                {/* Fila 1: única zona que expande la tarjeta — así el botón/menú
                    de "Pagar" (Fila 2) nunca queda dentro de la zona clicable
                    y no hay forma de que un clic ahí también expanda el card. */}
                <Box
                  onClick={() => toggleExpand(key, loan, i)}
                  sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, cursor: 'pointer' }}
                >
                  <Avatar size="medium">{loan.initials}</Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                      {loan.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap component="div">
                      {loan.phone} · {loan.date}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleVerHistorial(e, loan, i)}
                    sx={{ flexShrink: 0, mt: -0.25 }}
                    aria-label="Ver historial de pagos"
                    disabled={loadingHistorialIndex === i}
                  >
                    {loadingHistorialIndex === i ? (
                      <CircularProgress size={18} />
                    ) : (
                      <VisibilityRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    )}
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

                {/* Fila 2 */}
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
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
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
                    disabled={disabledAcciones}
                    onClick={(e) => handleAbrirMenuAcciones(e, i)}
                    startIcon={
                      estaPagando ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : yaPagado ? (
                        <CheckCircleRoundedIcon fontSize="small" />
                      ) : (
                        <PaymentsRoundedIcon fontSize="small" />
                      )
                    }
                    endIcon={
                      !yaPagado && !estaPagando ? <ArrowDropDownRoundedIcon /> : null
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

                  <Menu
                    anchorEl={anchorEl}
                    open={menuIndex === i && Boolean(anchorEl)}
                    onClose={handleCerrarMenuAcciones}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <MenuItem onClick={(e) => handleAbrirModalPago(e, loan, i)}>
                      <ListItemIcon>
                        <PaymentsRoundedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Pagar</ListItemText>
                    </MenuItem>

                    <Tooltip
                      title={puedeRenovar ? '' : buildRenovacionTooltip(loan)}
                      placement="left"
                    >
                      <span>
                        <MenuItem
                          onClick={(e) => handleRenovar(e, loan)}
                          disabled={!puedeRenovar}
                        >
                          <ListItemIcon>
                            <AutorenewRoundedIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Renovar</ListItemText>
                        </MenuItem>
                      </span>
                    </Tooltip>
                  </Menu>
                </Box>
              </CardContent>

              <Collapse in={estaExpandido} timeout={250} unmountOnExit>
                <Box sx={{ px: 2, pb: 2, pt: 0 }}>
                  <LoanExpandedDetails
                    loan={loan}
                    realPayments={loan.creditId ? realPaymentsByCreditId[loan.creditId] : undefined}
                    loadingRealPayments={loadingExpandIndex === i}
                  />
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

      <PaymentAmountModal
        open={loanEnPagoModal !== null}
        loan={loanEnPagoModal?.loan ?? null}
        loading={pagandoIndex !== null}
        onClose={() => setLoanEnPagoModal(null)}
        onConfirm={handleConfirmarPago}
      />

      <RenewalFlowModal
        open={loanEnRenovacionModal !== null}
        loan={loanEnRenovacionModal}
        onClose={() => setLoanEnRenovacionModal(null)}
        onReadyToCreateCredit={handleRenovacionLista}
      />
    </>
  );
}