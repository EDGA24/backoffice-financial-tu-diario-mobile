import {
    Avatar as MuiAvatar,
    Box,
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
import type { LoanSummary, PaymentRecord } from '../DashboardContacTable/DashboardContacTable';

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
                    <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
                        Historial de pagos
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {loan.name} · {loan.phone}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseRoundedIcon />
                </IconButton>
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
                                                bgcolor: 'action.hover',
                                                color: config.color,
                                            }}
                                        >
                                            {config.icon}
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