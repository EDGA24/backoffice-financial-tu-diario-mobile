import { Box, Chip, Divider, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';

const formatMoney = (value: number) =>
    `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export interface FaltasWarningBannerProps {
    // Total del cargo por faltas (amountMoratory)
    amount: number;
    // Qué no se puede hacer sin pagar las faltas
    action: 'liquidar' | 'renovar';
    // Cargo fijo por falta (chargeRules.latePaymentCharge) — si viene, se
    // muestra cuántas faltas son y de cuánto cada una.
    chargePerFalta?: number;
}

const COPY: Record<FaltasWarningBannerProps['action'], { subtitle: string; rule: string }> = {
    liquidar: {
        subtitle: 'Se cobran antes de liquidar el crédito',
        rule: 'Sin este pago el crédito no se puede cerrar.',
    },
    renovar: {
        subtitle: 'Se cobran antes de renovar el crédito',
        rule: 'Sin este pago el crédito no se puede renovar.',
    },
};

// Aviso de faltas sin pagar para los flujos de liquidación y renovación.
// Jerarquía: qué pasa (título) → cuánto es (monto destacado) → qué implica
// (regla con candado). Los pasos no se repiten aquí: ya los muestra el modal.
// Colores del theme con transparencia, para tema claro y oscuro.
export default function FaltasWarningBanner({ amount, action, chargePerFalta }: FaltasWarningBannerProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const warning = theme.palette.warning.main;
    const error = theme.palette.error.main;

    // Número de faltas: solo si el total es múltiplo exacto del cargo por falta
    const totalFaltas = chargePerFalta && chargePerFalta > 0 && Number.isInteger(amount / chargePerFalta)
        ? amount / chargePerFalta
        : null;
    const copy = COPY[action];

    return (
        <Box
            sx={{
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: alpha(warning, isDark ? 0.35 : 0.3),
                background: `linear-gradient(180deg, ${alpha(warning, isDark ? 0.16 : 0.12)} 0%, ${alpha(warning, isDark ? 0.05 : 0.03)} 100%)`,
            }}
        >
            {/* Encabezado: qué pasa */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', p: 2, pb: 1.5 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: 2.5,
                        flexShrink: 0,
                        color: '#fff',
                        background: `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.dark} 100%)`,
                        boxShadow: `0 6px 14px ${alpha(warning, 0.35)}`,
                    }}
                >
                    <WarningAmberRoundedIcon sx={{ fontSize: 22 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 800, fontSize: 15, color: 'text.primary' }} noWrap>
                            Faltas pendientes
                        </Typography>
                        {totalFaltas !== null && (
                            <Chip
                                label={`${totalFaltas} ${totalFaltas === 1 ? 'falta' : 'faltas'}`}
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    bgcolor: alpha(error, isDark ? 0.25 : 0.12),
                                    color: error,
                                    '& .MuiChip-label': { px: 1 },
                                }}
                            />
                        )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary" component="div">
                        {copy.subtitle}
                    </Typography>
                </Box>
            </Stack>

            {/* Dato clave: cuánto es */}
            <Box
                sx={{
                    mx: 2,
                    px: 2,
                    py: 1.5,
                    borderRadius: 3,
                    bgcolor: isDark ? alpha(theme.palette.background.default, 0.45) : alpha('#fff', 0.75),
                    border: '1px solid',
                    borderColor: alpha(error, 0.18),
                }}
            >
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" component="div">
                            Cargo por faltas
                        </Typography>
                        {totalFaltas !== null && chargePerFalta && (
                            <Typography variant="caption" color="text.secondary" component="div" sx={{ opacity: 0.8 }}>
                                {totalFaltas} × {formatMoney(chargePerFalta)} por falta
                            </Typography>
                        )}
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: 24, color: error, lineHeight: 1.1 }}>
                        {formatMoney(amount)}
                    </Typography>
                </Stack>
            </Box>

            {/* Consecuencia: la regla */}
            <Divider sx={{ mt: 1.5, borderColor: alpha(warning, 0.2) }} />
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', px: 2, py: 1.25 }}>
                <LockRoundedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {copy.rule}
                </Typography>
            </Stack>
        </Box>
    );
}
