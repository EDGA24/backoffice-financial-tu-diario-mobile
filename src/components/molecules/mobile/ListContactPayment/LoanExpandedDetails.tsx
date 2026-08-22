import { Box, Divider, Stack, Typography } from '@mui/material';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import ProgressBar from '@/components/atoms/ProgressBar/ProgressBar';
import type { LoanSummary } from '../DashboardContacTable/DashboardContacTable';

export interface LoanExpandedDetailsProps {
  loan: LoanSummary;
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
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
        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function LoanExpandedDetails({ loan }: LoanExpandedDetailsProps) {
  const historial = loan.historialPagos ?? [];

  // Progreso y próximo pago siguen derivados del historial simulado
  const totalPagos = historial.length;
  const pagosRealizados = historial.filter((p) => p.status === 'pagado').length;
  const progresoPagos = totalPagos > 0 ? (pagosRealizados / totalPagos) * 100 : 0;

  // El próximo pago es el primer registro que no está pagado
  const proximoPago = historial.find((p) => p.status !== 'pagado')?.date;

  // Monto pagado / por pagar: campos reales del crédito (amountPaid/amountDue),
  // no derivados del historial simulado. El monto total ya se muestra arriba
  // (loan.amount) antes de expandir la tarjeta.
  const montoPagado = loan.amountPaid ?? 0;
  const montoPorPagar = loan.amountDue ?? 0;

  return (
    <Box sx={{ pt: 1.5, pb: 0.5 }}>
      <Divider sx={{ mb: 2 }} />

      <ProgressBar
        value={progresoPagos}
        label={`${pagosRealizados} de ${totalPagos} pagos`}
      />

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
      </Stack>
    </Box>
  );
}