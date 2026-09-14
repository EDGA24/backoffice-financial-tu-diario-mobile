import {
    Avatar as MuiAvatar,
    Box,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { alpha } from '@mui/material/styles';
import type { LoanSummary, PaymentRecord } from '../DashboardContacTable/DashboardContacTable';
import { PARTIAL_PAYMENT_YELLOW } from '@/shared/constants/statusColors';
import ColorLegend from '../ColorLegend/ColorLegend';

const HISTORY_LEGEND_ITEMS = [
    {
        color: PARTIAL_PAYMENT_YELLOW,
        label: 'Pago incompleto',
        description: 'El monto pagado fue menor a la cuota del crédito.',
    },
];

export interface PaymentHistoryModalProps {
    open: boolean;
    onClose: () => void;
    loan: LoanSummary | null;
}

interface StatusConfigEntry {
    color: string;
    icon: React.ReactNode;
    label: string;
}

const STATUS_CONFIG: Record<PaymentRecord['status'], StatusConfigEntry> = {
    pagado: {
        color: 'success.main',
        icon: <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />,
        label: 'Pagado',
    },
    atrasado: {
        color: 'error.main',
        icon: <ErrorRoundedIcon sx={{ fontSize: 18 }} />,
        label: 'Atrasado',
    },
    pendiente: {
        color: 'text.disabled',
        icon: <ScheduleRoundedIcon sx={{ fontSize: 18 }} />,
        label: 'Pendiente',
    },
    cancelado: {
        color: 'text.disabled',
        icon: <CancelRoundedIcon sx={{ fontSize: 18 }} />,
        label: 'Cancelado',
    },
};

export default function PaymentHistoryModal({ open, onClose, loan }: PaymentHistoryModalProps) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    if (!loan) return null;

    const historial = loan.historialPagos ?? [];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={fullScreen}
            fullWidth
            maxWidth="xs"
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: fullScreen ? 0 : 3,
                        ...(fullScreen && { m: 0, height: '100%' }),
                    },
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pb: 1,
                }}
            >
                <Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
                            Historial de pagos
                        </Typography>
                        {historial.length > 0 && (
                            <Chip
                                label={`${historial.length} ${historial.length === 1 ? 'pago' : 'pagos'}`}
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    '& .MuiChip-label': { px: 1 },
                                }}
                            />
                        )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                        {loan.name} · {loan.phone}
                    </Typography>
                </Box>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
                    <ColorLegend items={HISTORY_LEGEND_ITEMS} />
                    <IconButton onClick={onClose} size="small">
                        <CloseRoundedIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ px: 2, pb: 2 }}>
                {historial.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                            Aún no hay pagos registrados
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {historial.map((pago, idx) => {
                            const config = STATUS_CONFIG[pago.status];
                            // Pago ya registrado pero por debajo de la cuota (fixedCharge)
                            // del crédito — se marca en amarillo, no cuenta como incumplido
                            // (eso es "atrasado"), solo como incompleto.
                            const pagoIncompleto =
                                pago.status === 'pagado' &&
                                typeof loan.fixedCharge === 'number' &&
                                loan.fixedCharge > 0 &&
                                pago.amount < loan.fixedCharge;
                            return (
                                <ListItem
                                    key={pago.id}
                                    disableGutters
                                    sx={{
                                        py: 1.5,
                                        borderBottom: idx < historial.length - 1 ? '1px solid' : 'none',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', width: '100%' }}>
                                        <MuiAvatar
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                bgcolor: pagoIncompleto ? alpha(PARTIAL_PAYMENT_YELLOW, 0.22) : 'action.hover',
                                                color: pagoIncompleto ? '#8a6d00' : config.color,
                                                ...(pagoIncompleto && {
                                                    border: `2px solid ${alpha(PARTIAL_PAYMENT_YELLOW, 0.9)}`,
                                                    boxShadow: `0 0 0 3px ${alpha(PARTIAL_PAYMENT_YELLOW, 0.15)}`,
                                                }),
                                            }}
                                        >
                                            {pagoIncompleto ? <WarningAmberRoundedIcon sx={{ fontSize: 18 }} /> : config.icon}
                                        </MuiAvatar>

                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                                                {pago.date}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" noWrap component="div">
                                                {config.label}
                                                {pago.method ? ` · ${pago.method}` : ''}
                                            </Typography>
                                        </Box>

                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 800, color: config.color, flexShrink: 0 }}
                                        >
                                            ${pago.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </Typography>
                                    </Stack>
                                </ListItem>
                            );
                        })}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    );
}