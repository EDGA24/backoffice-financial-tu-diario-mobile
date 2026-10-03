import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Divider,
    Drawer,
    Fade,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import AddCardRoundedIcon from '@mui/icons-material/AddCardRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import { DrawnCheck, ProgressRing, TrackRow, type TrackRowState } from '../ProcessTracking/ProcessTracking';
import { useRotatingMessage } from '../ProcessTracking/useRotatingMessage';

// Qué paso falló — define qué acciones se ofrecen:
// - 'credit': no se creó nada, se regresa al formulario para corregir.
// - 'payment': el crédito YA quedó creado; se puede reintentar solo el pago
//   (sin volver a crear el crédito) o continuar sin el primer pago.
export type FirstChargeErrorStage = 'credit' | 'payment' | null;

// Mensajes que rotan mientras cada paso está activo (mismo patrón que
// RenewalFlowModal).
const CREDITO_MESSAGES = ['Verificando saldo disponible…', 'Registrando el nuevo crédito…'];
const PAGO_MESSAGES = ['Aplicando el primer pago…', 'Registrando el pago…'];

const formatCurrency = (value: number): string =>
    `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export interface FirstChargeFlowModalProps {
    open: boolean;
    customerName: string;
    // Solo cambia el título e ícono: "Renovando crédito" vs "Creando crédito".
    isRenewal: boolean;
    firstChargeAmount: number;
    rowCredito: TrackRowState;
    rowPago: TrackRowState;
    error: string | null;
    errorStage: FirstChargeErrorStage;
    onClose: () => void;
    onRetryPayment: () => void;
    onContinue: () => void;
}

// Proceso de un crédito cuya regla trae primer cobro (firstCharge):
// 1) registra el nuevo crédito y 2) registra su primer pago. Solo muestra el
// avance — toda la lógica (llamadas al backend, reintentos) vive en
// useCreditsCustomerContainerState.
export default function FirstChargeFlowModal({
    open,
    customerName,
    isRenewal,
    firstChargeAmount,
    rowCredito,
    rowPago,
    error,
    errorStage,
    onClose,
    onRetryPayment,
    onContinue,
}: FirstChargeFlowModalProps) {
    const theme = useTheme();

    const creditoMsg = useRotatingMessage(rowCredito === 'active', CREDITO_MESSAGES);
    const pagoMsg = useRotatingMessage(rowPago === 'active', PAGO_MESSAGES);
    const activeMessage = creditoMsg ?? pagoMsg;

    const hasError = rowCredito === 'error' || rowPago === 'error';
    const stepValue = (s: TrackRowState) => (s === 'done' ? 1 : s === 'active' ? 0.5 : 0);
    const ringProgress = (stepValue(rowCredito) + stepValue(rowPago)) / 2;

    return (
        <Drawer
            anchor="bottom"
            open={open}
            // Mientras el proceso sigue en curso no se puede cerrar — cerrar no
            // cancela la petición, solo la escondería. Con error, se cierra
            // desde los botones de abajo (cada caso tiene su propia acción).
            onClose={() => undefined}
            slotProps={{
                paper: {
                    sx: {
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        maxHeight: '90vh',
                    },
                },
            }}
        >
            <Box sx={{ px: 3, pt: 3, pb: 1 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            color: 'primary.main',
                        }}
                    >
                        {isRenewal ? <AutorenewRoundedIcon /> : <AddCardRoundedIcon />}
                    </Avatar>
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: 19 }}>
                            {isRenewal ? 'Renovando crédito' : 'Creando crédito'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {customerName}
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            <Divider />

            <Box sx={{ px: 3, py: 3, minHeight: 220 }}>
                <Stack spacing={3}>
                    <ProgressRing progress={ringProgress} hasError={hasError}>
                        {hasError ? (
                            <ErrorRoundedIcon sx={{ fontSize: 36, color: 'error.main' }} />
                        ) : ringProgress >= 1 ? (
                            <DrawnCheck size={36} />
                        ) : (
                            <CircularProgress size={30} thickness={4} />
                        )}
                    </ProgressRing>

                    <Stack spacing={1.75}>
                        <TrackRow label="Registrar nuevo crédito" state={rowCredito} />
                        <TrackRow label={`Registrar primer pago · ${formatCurrency(firstChargeAmount)}`} state={rowPago} />
                    </Stack>

                    {error && (
                        <Alert severity={errorStage === 'payment' ? 'warning' : 'error'}>
                            {error}
                        </Alert>
                    )}

                    {!error && (
                        <Box sx={{ textAlign: 'center' }}>
                            <Fade in appear key={activeMessage ?? 'idle'} timeout={250}>
                                <Typography sx={{ fontWeight: 700, fontSize: 15, color: 'primary.main', display: 'block', mb: 0.5 }}>
                                    {activeMessage ?? ' '}
                                </Typography>
                            </Fade>
                            <Typography variant="caption" color="text.secondary">
                                No cierres esta ventana.
                            </Typography>
                        </Box>
                    )}
                </Stack>
            </Box>

            {/* Solo hay acciones cuando algo falló — mientras avanza, el proceso
                no se puede interrumpir (mismo criterio que RenewalFlowModal). */}
            {error && (
                <>
                    <Divider />
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, px: 3, py: 2.5 }}>
                        {errorStage === 'payment' ? (
                            <>
                                <Button
                                    fullWidth
                                    variant="text"
                                    onClick={onContinue}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        borderRadius: 999,
                                        py: 1.25,
                                        backgroundColor: 'action.hover',
                                        color: 'text.primary',
                                    }}
                                >
                                    Continuar
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={onRetryPayment}
                                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999, py: 1.25 }}
                                >
                                    Reintentar pago
                                </Button>
                            </>
                        ) : (
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={onClose}
                                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999, py: 1.25 }}
                            >
                                Volver al formulario
                            </Button>
                        )}
                    </Box>
                </>
            )}
        </Drawer>
    );
}
