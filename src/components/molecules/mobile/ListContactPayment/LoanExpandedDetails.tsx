import { Box, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ProgressBar from '@/components/atoms/ProgressBar/ProgressBar';
import type { LoanSummary } from '../DashboardContacTable/DashboardContacTable';
import type { PaymentTable } from '@/types/PaymentTable';

const formatDate = (date: Date) =>
  date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' });

export interface LoanExpandedDetailsProps {
  loan: LoanSummary;
  // Pagos reales del crédito (getPaymentByCredit) — undefined mientras cargan,
  // [] si ya se confirmó que no tiene ninguno todavía.
  realPayments?: PaymentTable[];
  loadingRealPayments?: boolean;
}

function InfoRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  // Color opcional del valor (ej. 'error.main' para el cargo por faltas)
  valueColor?: string;
}) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flex: 1, minWidth: 120 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" component="div" noWrap>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, ...(valueColor && { color: valueColor }) }} noWrap>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function LoanExpandedDetails({ loan, realPayments, loadingRealPayments }: LoanExpandedDetailsProps) {
  // Monto pagado / por pagar campos  del crédito (amountPaid/amountDue).
  // amountPaid solo se actualiza cuando se APRUEBA un pago, así que el progreso ya
  // refleja solo dinero confirmado, no pagos todavía pendientes de aprobar.
  const montoPagado = loan.amountPaid ?? 0;
  const montoPorPagar = loan.amountDue ?? 0;
  // Total de cargos por faltas (amountMoratory); los créditos anteriores al
  // campo no lo traen y se muestran en $0.
  const cargoPorFaltas = loan.amountMoratory ?? 0;
  // Lo abonado a faltas (amountPaidMoratory), para su propia barra de avance
  const pagadoFaltas = loan.amountPaidMoratory ?? 0;

  const progresoPagos = montoPorPagar > 0 ? Math.min(100, (montoPagado / montoPorPagar) * 100) : 0;
  const progresoFaltas = cargoPorFaltas > 0 ? Math.min(100, (pagadoFaltas / cargoPorFaltas) * 100) : 0;
  const formatMoney = (value: number) => `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

  // Próximo pago = un periodo después del último REGISTRO de cobro (aunque
  // haya sido en $0) — el cobrador sigue visitando cada semana según el
  // calendario, pague o no el cliente; si todavía no hay ningún registro, un
  // periodo después del inicio del cobro (startDateChargeConfig).
  const periodDays = loan.chargeFrequency === 'daily' ? 1 : 7;
  const ultimoRegistro = realPayments && realPayments.length > 0
    ? [...realPayments].sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()).at(-1)
    : undefined;
  const fechaBase = ultimoRegistro?.createdAt ?? loan.startDateChargeConfig;
  const fechaProximoPago = fechaBase
    ? new Date(new Date(fechaBase).getTime() + periodDays * 24 * 60 * 60 * 1000)
    : undefined;
  // En los diarios el domingo no es día de cobro: si cae en domingo, pasa al lunes.
  if (fechaProximoPago && loan.chargeFrequency === 'daily' && fechaProximoPago.getDay() === 0) {
    fechaProximoPago.setDate(fechaProximoPago.getDate() + 1);
  }
  const proximoPago = fechaProximoPago ? formatDate(fechaProximoPago) : undefined;

  return (
    <Box sx={{ pt: 1.5, pb: 0.5 }}>
      <Divider sx={{ mb: 2 }} />

      {loadingRealPayments ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
          <CircularProgress size={20} />
        </Box>
      ) : (
        <Stack spacing={1.5}>
          <ProgressBar
            value={progresoPagos}
            label={`$${montoPagado.toLocaleString('es-MX', { minimumFractionDigits: 2 })} de $${montoPorPagar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          />
          {/* Avance del pago de faltas: solo si el crédito tiene cargo por faltas.
              Rojo mientras falte, verde al cubrirlas. */}
          {cargoPorFaltas > 0 && (
            <ProgressBar
              value={progresoFaltas}
              label={`Faltas: ${formatMoney(pagadoFaltas)} de ${formatMoney(cargoPorFaltas)}`}
              color={progresoFaltas >= 100 ? 'success.main' : 'error.main'}
            />
          )}
        </Stack>
      )}

      <Stack
        direction="row"
        sx={{
          mt: 2.5,
          flexWrap: 'wrap',
          rowGap: 2,
          columnGap: 2,
        }}
      >
        <InfoRow
          icon={<AccountBalanceWalletRoundedIcon sx={{ fontSize: 15, color: 'primary.main' }} />}
          label="Monto pagado"
          value={`$${montoPagado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
        />
        <InfoRow
          icon={<PaymentsRoundedIcon sx={{ fontSize: 15, color: 'primary.main' }} />}
          label="Monto por pagar"
          value={`$${montoPorPagar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
        />
        {proximoPago && (
          <InfoRow
            icon={<EventRoundedIcon sx={{ fontSize: 15, color: 'primary.main' }} />}
            label="Próximo pago"
            value={proximoPago}
          />
        )}
        <InfoRow
          icon={<WarningAmberRoundedIcon sx={{ fontSize: 15, color: 'error.main' }} />}
          label="Cargo por faltas"
          value={`$${cargoPorFaltas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          valueColor="error.main"
        />
      </Stack>
    </Box>
  );
}