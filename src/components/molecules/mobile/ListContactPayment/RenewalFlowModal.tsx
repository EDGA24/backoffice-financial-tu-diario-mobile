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
    Zoom,
    useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import { useCreditStore } from '@/stores/credits.store';
import type { LoanSummary } from '../DashboardContacTable/DashboardContacTable';

type RenewalStep = 'intro' | 'confirm' | 'tracking';
type TrackRowState = 'pending' | 'active' | 'done' | 'error';

// "Información del cliente" ya la tenemos en memoria (viene en `loan`) y
// "Registro del nuevo crédito" pasa en la SIGUIENTE pantalla — el único paso
// que de verdad llama al backend aquí es el pago. Los delays son para que el
// stepper se sienta como un proceso real (~5s en total) en vez de un salto
// brusco — MIN_PAGO_DURATION_MS fuerza ese mínimo en el paso 1 aunque el
// backend responda al instante (en local casi no se alcanzaría a ver el spin).
const MIN_PAGO_DURATION_MS = 1800;
const STEP_INFO_DELAY_MS = 1400;
const STEP_CREDIT_PREP_DELAY_MS = 1600;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mensajes que rotan mientras un paso está "activo" — le dan textura al
// proceso (que se sienta como que de verdad está pasando algo) en vez de
// solo un spinner mudo y estático.
const PAGO_MESSAGES = ['Conectando con tu wallet…', 'Verificando saldo disponible…', 'Registrando el pago…'];
const INFO_MESSAGES = ['Sincronizando datos del cliente…'];
const CREDITO_MESSAGES = ['Preparando el nuevo crédito…'];

const useRotatingMessage = (active: boolean, messages: string[], intervalMs = 900): string | null => {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        if (!active) return;
        setIndex(0);
        if (messages.length <= 1) return;
        const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), intervalMs);
        return () => clearInterval(id);
    }, [active, messages, intervalMs]);
    return active ? messages[index] : null;
};

export interface RenewalFlowModalProps {
    open: boolean;
    loan: LoanSummary | null;
    onClose: () => void;
    onReadyToCreateCredit: (loan: LoanSummary) => void;
}

// Cuenta el número hacia arriba en vez de aparecer de golpe — el mismo
// truco que usan Revolut/Cash App en sus tarjetas de monto.
const CountUpAmount = ({ value, durationMs = 700 }: { value: number; durationMs?: number }) => {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        let start: number | null = null;
        let raf: number;
        const step = (ts: number) => {
            if (start === null) start = ts;
            const progress = Math.min((ts - start) / durationMs, 1);
            setDisplay(value * progress);
            if (progress < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [value, durationMs]);

    return <>${display.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>;
};

// Check que se "dibuja" con el trazo (stroke-dashoffset) en vez de solo
// aparecer — el remate típico de las pantallas de éxito de apps bancarias.
const DrawnCheck = ({ size = 34 }: { size?: number }) => {
    const [drawn, setDrawn] = useState(false);
    useEffect(() => {
        const id = requestAnimationFrame(() => setDrawn(true));
        return () => cancelAnimationFrame(id);
    }, []);
    const pathLength = 36;
    return (
        <Box sx={{ color: 'success.main' }}>
            <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
                <path
                    d="M14 27l7 7 17-17"
                    stroke="currentColor"
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        strokeDasharray: pathLength,
                        strokeDashoffset: drawn ? 0 : pathLength,
                        transition: 'stroke-dashoffset 0.5s ease 0.05s',
                    }}
                />
            </svg>
        </Box>
    );
};

const RING_SIZE = 108;
const RING_STROKE = 7;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Anillo circular de progreso con el ícono del paso actual al centro — el
// mismo patrón que usa Revolut mientras procesa una transferencia.
const ProgressRing = ({ progress, hasError, children }: { progress: number; hasError: boolean; children: React.ReactNode }) => {
    const theme = useTheme();
    const strokeColor = hasError ? theme.palette.error.main : theme.palette.primary.main;
    const offset = RING_CIRCUMFERENCE * (1 - progress);

    return (
        <Box sx={{ position: 'relative', width: RING_SIZE, height: RING_SIZE, mx: 'auto' }}>
            {/* Resplandor suave detrás del anillo, con pulso mientras hay algo en curso */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 8,
                    borderRadius: '50%',
                    bgcolor: hasError ? alpha(theme.palette.error.main, 0.14) : alpha(theme.palette.primary.main, 0.12),
                    filter: 'blur(10px)',
                    transition: 'background-color 0.4s ease',
                    animation: !hasError && progress < 1 ? 'renewalPulse 1.6s ease-in-out infinite' : 'none',
                    '@keyframes renewalPulse': {
                        '0%, 100%': { opacity: 0.55, transform: 'scale(1)' },
                        '50%': { opacity: 1, transform: 'scale(1.1)' },
                    },
                }}
            />
            <svg width={RING_SIZE} height={RING_SIZE} style={{ position: 'relative', transform: 'rotate(-90deg)' }}>
                <circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RING_RADIUS}
                    fill="none"
                    stroke={alpha(theme.palette.text.primary, 0.08)}
                    strokeWidth={RING_STROKE}
                />
                <circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RING_RADIUS}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={RING_STROKE}
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
                />
            </svg>
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {children}
            </Box>
        </Box>
    );
};

const TrackRow = ({ label, state }: { label: string; state: TrackRowState }) => (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box sx={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {state === 'done' && (
                <Zoom in appear>
                    <CheckCircleRoundedIcon sx={{ fontSize: 22, color: 'success.main' }} />
                </Zoom>
            )}
            {state === 'active' && <CircularProgress size={18} thickness={5} />}
            {state === 'error' && <ErrorRoundedIcon sx={{ fontSize: 22, color: 'error.main' }} />}
            {state === 'pending' && <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 20, color: 'text.disabled' }} />}
        </Box>
        <Typography
            variant="body2"
            sx={{
                fontWeight: state === 'active' ? 700 : 500,
                color: state === 'pending' ? 'text.disabled' : 'text.primary',
                transition: 'color 0.25s ease',
            }}
        >
            {label}
        </Typography>
    </Stack>
);

export default function RenewalFlowModal({ open, loan, onClose, onReadyToCreateCredit }: RenewalFlowModalProps) {
    const theme = useTheme();
    const { createPayment } = useCreditStore();

    const [step, setStep] = useState<RenewalStep>('intro');
    const [error, setError] = useState<string | null>(null);
    const [rowPago, setRowPago] = useState<TrackRowState>('pending');
    const [rowInfo, setRowInfo] = useState<TrackRowState>('pending');
    const [rowCredito, setRowCredito] = useState<TrackRowState>('pending');
    const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => () => timeouts.current.forEach(clearTimeout), []);

    const resetAndClose = () => {
        // No cerrar durante todo el tracking (no solo mientras el pago está
        // activo) — cerrar el modal no cancela la petición en curso, solo la
        // esconde, y el pago ya habría quedado creado en el backend. Solo se
        // puede cerrar si algo falló (ahí ya no hay nada en curso).
        if (step === 'tracking' && !error) return;
        onClose();
        setTimeout(() => {
            setStep('intro');
            setError(null);
            setRowPago('pending');
            setRowInfo('pending');
            setRowCredito('pending');
        }, 300);
    };

    const runTracking = async () => {
        if (!loan?.creditId) return;
        setStep('tracking');
        setError(null);
        setRowPago('active');

        try {
            const [ok] = await Promise.all([
                createPayment({
                    creditId: loan.creditId,
                    customerId: loan.customerId ?? '',
                    total: loan.fixedCharge ?? 0,
                }),
                wait(MIN_PAGO_DURATION_MS),
            ]);

            if (!ok) {
                setRowPago('error');
                setError('No se pudo registrar el pago de renovación. Verifica el saldo disponible.');
                return;
            }

            setRowPago('done');
            setRowInfo('active');

            timeouts.current.push(
                setTimeout(() => {
                    setRowInfo('done');
                    setRowCredito('active');

                    timeouts.current.push(
                        setTimeout(() => onReadyToCreateCredit(loan), STEP_CREDIT_PREP_DELAY_MS)
                    );
                }, STEP_INFO_DELAY_MS)
            );
        } catch (err) {
            console.error('Error al registrar el pago de renovación:', err);
            setRowPago('error');
            setError('No se pudo registrar el pago. Intenta de nuevo.');
        }
    };

    const handleReintentar = () => {
        setRowPago('pending');
        setRowInfo('pending');
        setRowCredito('pending');
        setStep('confirm');
    };

    const pagoMsg = useRotatingMessage(rowPago === 'active', PAGO_MESSAGES);
    const infoMsg = useRotatingMessage(rowInfo === 'active', INFO_MESSAGES);
    const creditoMsg = useRotatingMessage(rowCredito === 'active', CREDITO_MESSAGES);
    const activeMessage = pagoMsg ?? infoMsg ?? creditoMsg;

    if (!loan) return null;

    const cuotaNumber = loan.fixedCharge ?? 0;
    // Genérico a propósito: hoy solo el pago puede fallar de verdad (es el
    // único paso con llamada real al backend), pero el diseño reacciona a
    // CUALQUIER paso que termine en error, no solo al del pago.
    const hasError = rowPago === 'error' || rowInfo === 'error' || rowCredito === 'error';
    // No cerrable durante TODO el tracking (no solo mientras el pago está
    // activo) — solo se puede cerrar si ya terminó con error.
    const closable = !(step === 'tracking' && !hasError);
    const stepValue = (s: TrackRowState) => (s === 'done' ? 1 : s === 'active' ? 0.5 : 0);
    const ringProgress = (stepValue(rowPago) + stepValue(rowInfo) + stepValue(rowCredito)) / 3;

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
                    },
                },
            }}
        >
            <Box sx={{ px: 3, pt: 3, pb: 1 }}>
                <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar
                            sx={{
                                width: 40,
                                height: 40,
                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                                color: 'primary.main',
                            }}
                        >
                            <AutorenewRoundedIcon />
                        </Avatar>
                        <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: 19 }}>
                                {step === 'tracking' ? 'Renovando crédito' : 'Renovación de crédito'}
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
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Para renovar este crédito se realizará el pago correspondiente a la cuota
                                    pendiente y posteriormente se cargará la información del cliente para
                                    registrar el nuevo crédito.
                                </Typography>
                                <Stack spacing={1.5}>
                                    <TrackRow label="Registrar pago de renovación" state="pending" />
                                    <TrackRow label="Cargar información del cliente" state="pending" />
                                    <TrackRow label="Registrar nuevo crédito" state="pending" />
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
                                {/* Tarjeta con degradado, estilo "bank card" */}
                                <Box
                                    sx={{
                                        borderRadius: 4,
                                        p: 3,
                                        mb: 2.5,
                                        textAlign: 'center',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        color: theme.palette.primary.contrastText,
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                        boxShadow: `0 10px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
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
                                        Pago a registrar
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800, fontSize: 36, lineHeight: 1.25, position: 'relative' }}>
                                        <CountUpAmount value={cuotaNumber} />
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.85, position: 'relative' }}>
                                        Cuota del crédito actual
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    Una vez registrado correctamente, se cargará automáticamente la información
                                    del cliente para que puedas registrar el nuevo crédito.
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
                                    <TrackRow label="Registrar pago de renovación" state={rowPago} />
                                    <TrackRow label="Cargar información del cliente" state={rowInfo} />
                                    <TrackRow label="Registrar nuevo crédito" state={rowCredito} />
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

                                {!error && (
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Fade in appear key={activeMessage ?? 'idle'} timeout={250}>
                                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', display: 'block' }}>
                                                {activeMessage ?? ' '}
                                            </Typography>
                                        </Fade>
                                        <Typography variant="caption" color="text.secondary">
                                            No cierres esta ventana.
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        )}
                    </Box>
                </Fade>
            </Box>

            {step !== 'tracking' && (
                <>
                    <Divider />
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, px: 3, py: 2.5 }}>
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
                            onClick={() => (step === 'intro' ? setStep('confirm') : runTracking())}
                            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999, py: 1.25 }}
                        >
                            {step === 'intro' ? 'Continuar' : 'Confirmar renovación'}
                        </Button>
                    </Box>
                </>
            )}
        </Drawer>
    );
}
