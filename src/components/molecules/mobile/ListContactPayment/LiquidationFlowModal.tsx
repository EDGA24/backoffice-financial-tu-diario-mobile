import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Divider,
    Drawer,
    Fade,
    IconButton,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import { PaymentCategoryEnum } from '@/shared/constants/PaymentCategoryEnum';
import FaltasWarningBanner from './FaltasWarningBanner';
import { getFaltasPendientes } from '@/shared/utils/moratoryUtils';
import type { LoanSummary } from '../DashboardContacTable/DashboardContacTable';
import { DrawnCheck, ProgressRing, TrackRow, type TrackRowState } from '../ProcessTracking/ProcessTracking';
import { useRotatingMessage } from '../ProcessTracking/useRotatingMessage';

type LiquidationStep = 'intro' | 'confirm' | 'tracking';

// Igual que RenewalFlowModal: mínimos por paso para que el seguimiento se
// sienta como un proceso real aunque el backend responda al instante.
const MIN_PAGO_DURATION_MS = 1800;
const STEP_CLOSE_DELAY_MS = 1400;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const FALTA_MESSAGES = ['Conectando con tu wallet…', 'Registrando el pago del cargo por faltas…'];
const LIQUIDACION_MESSAGES = ['Verificando saldo disponible…', 'Registrando el pago de liquidación…'];
const CIERRE_MESSAGES = ['Cerrando el crédito…'];

const formatMoney = (value: number) =>
    `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export interface LiquidationFlowModalProps {
    open: boolean;
    loan: LoanSummary | null;
    onClose: () => void;
    // Registra un pago del crédito (mismo onPagar que "Pagar" / "Liquidar").
    onPagar: (amount: number, paymentCategory: PaymentCategoryEnum) => Promise<boolean> | boolean;
}

// Liquidación de un crédito con cargo por faltas: primero se paga el cargo
// (moratory) y después lo que falta del crédito (liquidation). Si el pago del
// cargo falla, no se registra la liquidación — el crédito no se cierra sin
// pagar las faltas.
export default function LiquidationFlowModal({ open, loan, onClose, onPagar }: LiquidationFlowModalProps) {
    const theme = useTheme();
    const successColor = theme.palette.success.main;

    const [step, setStep] = useState<LiquidationStep>('intro');
    const [error, setError] = useState<string | null>(null);
    const [rowFalta, setRowFalta] = useState<TrackRowState>('pending');
    const [rowLiquidacion, setRowLiquidacion] = useState<TrackRowState>('pending');
    const [rowCierre, setRowCierre] = useState<TrackRowState>('pending');
    const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => () => timeouts.current.forEach(clearTimeout), []);

    const cargoPorFaltas = getFaltasPendientes(loan);
    const restante = Math.max(0, (loan?.amountDue ?? 0) - (loan?.amountPaid ?? 0));
    const totalACobrar = cargoPorFaltas + restante;

    const resetAndClose = () => {
        // No se puede cerrar a mitad del proceso (el pago ya se habría enviado);
        // solo antes de empezar, al terminar o si algo falló.
        if (step === 'tracking' && !error && rowCierre !== 'done') return;
        onClose();
        setTimeout(() => {
            setStep('intro');
            setError(null);
            setRowFalta('pending');
            setRowLiquidacion('pending');
            setRowCierre('pending');
        }, 300);
    };

    const registrarPago = async (amount: number, category: PaymentCategoryEnum): Promise<boolean> => {
        const [ok] = await Promise.all([Promise.resolve(onPagar(amount, category)), wait(MIN_PAGO_DURATION_MS)]);
        return ok;
    };

    const runTracking = async () => {
        if (!loan?.creditId) return;
        setStep('tracking');
        setError(null);

        try {
            // 1. Cargo por faltas — si ya se pagó en un intento anterior, no se repite
            if (rowFalta !== 'done') {
                setRowFalta('active');
                const okFalta = await registrarPago(cargoPorFaltas, PaymentCategoryEnum.MORATORY);
                if (!okFalta) {
                    setRowFalta('error');
                    setError('No se pudo registrar el pago del cargo por faltas. Verifica el saldo disponible.');
                    return;
                }
                setRowFalta('done');
            }

            // 2. Liquidación de lo que falta del crédito
            setRowLiquidacion('active');
            const okLiquidacion = await registrarPago(restante, PaymentCategoryEnum.LIQUIDATION);
            if (!okLiquidacion) {
                setRowLiquidacion('error');
                setError('No se pudo registrar el pago de liquidación. Verifica el saldo disponible.');
                return;
            }
            setRowLiquidacion('done');

            // 3. Cierre (visual): los pagos ya quedaron registrados
            setRowCierre('active');
            timeouts.current.push(setTimeout(() => setRowCierre('done'), STEP_CLOSE_DELAY_MS));
        } catch (err) {
            console.error('Error en la liquidación con cargo por faltas:', err);
            setRowFalta((prev) => (prev === 'active' ? 'error' : prev));
            setRowLiquidacion((prev) => (prev === 'active' ? 'error' : prev));
            setError('No se pudo registrar el pago. Intenta de nuevo.');
        }
    };

    const handleReintentar = () => {
        // El cargo por faltas que ya quedó pagado se conserva como 'done'
        setRowFalta((prev) => (prev === 'done' ? 'done' : 'pending'));
        setRowLiquidacion('pending');
        setRowCierre('pending');
        setStep('confirm');
    };

    const faltaMsg = useRotatingMessage(rowFalta === 'active', FALTA_MESSAGES);
    const liquidacionMsg = useRotatingMessage(rowLiquidacion === 'active', LIQUIDACION_MESSAGES);
    const cierreMsg = useRotatingMessage(rowCierre === 'active', CIERRE_MESSAGES);
    const activeMessage = faltaMsg ?? liquidacionMsg ?? cierreMsg;

    if (!loan) return null;

    const hasError = rowFalta === 'error' || rowLiquidacion === 'error' || rowCierre === 'error';
    const terminado = rowCierre === 'done';
    const closable = !(step === 'tracking' && !hasError && !terminado);
    const stepValue = (s: TrackRowState) => (s === 'done' ? 1 : s === 'active' ? 0.5 : 0);
    const ringProgress = (stepValue(rowFalta) + stepValue(rowLiquidacion) + stepValue(rowCierre)) / 3;

    const desglose = (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
                borderRadius: 3,
                border: '1px solid',
                borderColor: alpha(successColor, 0.35),
                bgcolor: alpha(successColor, 0.08),
                p: 2,
            }}
        >
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Liquidación del crédito</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatMoney(restante)}</Typography>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'error.main' }}>Cargo por faltas</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>{formatMoney(cargoPorFaltas)}</Typography>
            </Stack>
            <Divider sx={{ my: 0.5, borderColor: alpha(successColor, 0.35) }} />
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography sx={{ fontWeight: 700 }}>Total a cobrar</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: 20, color: successColor }}>{formatMoney(totalACobrar)}</Typography>
            </Stack>
        </Box>
    );

    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={resetAndClose}
            slotProps={{
                paper: {
                    sx: {
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        maxHeight: '90vh',
                        borderTop: `4px solid ${successColor}`,
                    },
                },
            }}
        >
            <Box sx={{ px: 3, pt: 3, pb: 1 }}>
                <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(successColor, 0.16), color: successColor }}>
                            <PaidRoundedIcon />
                        </Avatar>
                        <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: 19 }}>
                                {step === 'tracking' ? (terminado ? 'Crédito liquidado' : 'Liquidando crédito') : 'Liquidar crédito'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {loan.name}
                            </Typography>
                        </Box>
                    </Stack>
                    <IconButton onClick={resetAndClose} size="small" disabled={!closable}>
                        <CloseRoundedIcon />
                    </IconButton>
                </Stack>
            </Box>

            <Divider />

            <Box sx={{ px: 3, py: 3, minHeight: 220 }}>
                <Fade in appear key={step} timeout={280}>
                    <Box>
                        {step === 'intro' && (
                            <>
                                <Box sx={{ mb: 2 }}>
                                    <FaltasWarningBanner
                                        amount={cargoPorFaltas}
                                        action="liquidar"
                                        chargePerFalta={loan.chargeRules?.latePaymentCharge}
                                    />
                                </Box>
                                {desglose}
                                <Stack spacing={1.5} sx={{ mt: 3 }}>
                                    <TrackRow label="Registrar pago del cargo por faltas" state="pending" />
                                    <TrackRow label="Registrar pago de liquidación" state="pending" />
                                    <TrackRow label="Cerrar el crédito" state="pending" />
                                </Stack>
                            </>
                        )}

                        {step === 'confirm' && (
                            <>
                                {error && (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        {error}
                                    </Alert>
                                )}
                                <Box
                                    sx={{
                                        borderRadius: 4,
                                        p: 3,
                                        mb: 2.5,
                                        textAlign: 'center',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        color: theme.palette.success.contrastText,
                                        background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                                        boxShadow: `0 10px 24px ${alpha(successColor, 0.35)}`,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            width: 160,
                                            height: 160,
                                            borderRadius: '50%',
                                            bgcolor: alpha('#fff', 0.08),
                                            top: -60,
                                            right: -50,
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ opacity: 0.85, position: 'relative' }}>
                                        Total a cobrar
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800, fontSize: 36, lineHeight: 1.25, position: 'relative' }}>
                                        {formatMoney(totalACobrar)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.85, position: 'relative' }}>
                                        {formatMoney(cargoPorFaltas)} de faltas + {formatMoney(restante)} de liquidación
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    Se registrará primero el pago del cargo por faltas y después el de liquidación.
                                    Los dos quedan pendientes de aprobación, como cualquier pago.
                                </Typography>
                            </>
                        )}

                        {step === 'tracking' && (
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
                                    <TrackRow label="Registrar pago del cargo por faltas" state={rowFalta} />
                                    <TrackRow label="Registrar pago de liquidación" state={rowLiquidacion} />
                                    <TrackRow label="Cerrar el crédito" state={rowCierre} />
                                </Stack>

                                {error && (
                                    <Alert severity="error" action={
                                        <Button color="inherit" size="small" onClick={handleReintentar} sx={{ fontWeight: 700 }}>
                                            Reintentar
                                        </Button>
                                    }>
                                        {error}
                                    </Alert>
                                )}

                                {!error && !terminado && (
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Fade in appear key={activeMessage ?? 'idle'} timeout={250}>
                                            <Typography sx={{ fontWeight: 700, fontSize: 15, color: successColor, display: 'block', mb: 0.5 }}>
                                                {activeMessage ?? ' '}
                                            </Typography>
                                        </Fade>
                                        <Typography variant="caption" color="text.secondary">
                                            No cierres esta ventana.
                                        </Typography>
                                    </Box>
                                )}

                                {terminado && (
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: 15, color: successColor, mb: 0.5 }}>
                                            ¡Pagos registrados!
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            El crédito quedará liquidado cuando se aprueben los pagos.
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        )}
                    </Box>
                </Fade>
            </Box>

            {(step !== 'tracking' || terminado) && (
                <>
                    <Divider />
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, px: 3, py: 2.5 }}>
                        {terminado ? (
                            <Button
                                fullWidth
                                variant="contained"
                                color="success"
                                onClick={resetAndClose}
                                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999, py: 1.25 }}
                            >
                                Listo
                            </Button>
                        ) : (
                            <>
                                <Button
                                    fullWidth
                                    variant="text"
                                    onClick={resetAndClose}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        borderRadius: 999,
                                        py: 1.25,
                                        backgroundColor: 'action.hover',
                                        color: 'text.primary',
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="success"
                                    onClick={() => (step === 'intro' ? setStep('confirm') : runTracking())}
                                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999, py: 1.25 }}
                                >
                                    {step === 'intro' ? 'Continuar' : 'Confirmar liquidación'}
                                </Button>
                            </>
                        )}
                    </Box>
                </>
            )}
        </Drawer>
    );
}
