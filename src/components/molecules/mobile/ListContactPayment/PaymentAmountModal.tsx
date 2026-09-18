import { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    Drawer,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import type { LoanSummary } from '../DashboardContacTable/DashboardContacTable';

const formatMoney = (value: number) =>
    `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

export interface PaymentAmountModalProps {
    open: boolean;
    loan: LoanSummary | null;
    loading?: boolean;
    error?: string | null;
    onClose: () => void;
    onConfirm: (amount: number) => void;
    // 'liquidar': precarga lo que falta por pagar (amountDue - amountPaid) en
    // vez de la cuota fija — mismo modal/flujo de pago, mismo endpoint, solo
    // cambia el monto sugerido al abrir.
    mode?: 'pago' | 'liquidar';
}

export default function PaymentAmountModal({
    open,
    loan,
    loading = false,
    error = null,
    onClose,
    onConfirm,
    mode = 'pago',
}: PaymentAmountModalProps) {
    const [amount, setAmount] = useState('');
    const isLiquidar = mode === 'liquidar';
    // Mismo verde "success" del theme de la app (el que ya usa el botón
    // "Pagado" en la tarjeta) — no un color ad-hoc nuevo.
    const theme = useTheme();
    const successColor = theme.palette.success.main;

    // Al abrir el sheet para un crédito, precarga el monto sugerido: la cuota
    // fija en pago normal, o lo que falta por pagar del crédito en "liquidar"
    // (mismos amountDue/amountPaid que ya trae el crédito, sin llamar nada más).
    // El cobrador puede ajustarlo si el cliente paga distinto.
    useEffect(() => {
        if (open) {
            if (isLiquidar) {
                const restante = Math.max(0, (loan?.amountDue ?? 0) - (loan?.amountPaid ?? 0));
                setAmount(restante ? String(restante) : '');
            } else {
                setAmount(loan?.fixedCharge ? String(loan.fixedCharge) : '');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, loan?.creditId, isLiquidar]);

    const amountNumber = Number(amount);
    const isValid = amount.trim() !== '' && !Number.isNaN(amountNumber) && amountNumber > 0;

    const handleClose = () => {
        if (loading) return;
        onClose();
    };

    const handleConfirm = () => {
        if (!isValid) return;
        // No se limpia el campo aquí — si falla, el usuario necesita poder
        // reintentar sin volver a escribir el monto. Se limpia solo al volver
        // a abrir el modal (ver el useEffect de arriba).
        onConfirm(amountNumber);
    };

    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={handleClose}
            slotProps={{
                paper: {
                    sx: {
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        maxHeight: '85vh',
                        // Franja de acento arriba del todo en liquidación, para que se
                        // distinga incluso antes de leer el título (útil al abrirse
                        // desde abajo, la primera fracción de segundo que se ve).
                        ...(isLiquidar && {
                            borderTop: `4px solid ${successColor}`,
                        }),
                    },
                },
            }}
        >
            {loan && (
                <>
                    <Box sx={{ px: 3, pt: 3, pb: 2 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                mb: isLiquidar ? 2 : 3,
                            }}
                        >
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                                {isLiquidar && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            flexShrink: 0,
                                            bgcolor: alpha(successColor, 0.16),
                                            color: successColor,
                                        }}
                                    >
                                        <PaidRoundedIcon fontSize="small" />
                                    </Box>
                                )}
                                <Box>
                                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                        <Typography sx={{ fontWeight: 800, fontSize: 22 }}>
                                            {isLiquidar ? 'Liquidar crédito' : 'Registrar pago'}
                                        </Typography>
                                        {isLiquidar && (
                                            <Chip
                                                label="Pago final"
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(successColor, 0.16),
                                                    color: successColor,
                                                    fontWeight: 700,
                                                    height: 22,
                                                }}
                                            />
                                        )}
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary">
                                        {loan.name} · {loan.phone}
                                    </Typography>
                                </Box>
                            </Stack>
                            <IconButton onClick={handleClose} size="small" disabled={loading}>
                                <CloseRoundedIcon />
                            </IconButton>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {isLiquidar && (
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
                                    mb: 2,
                                }}
                            >
                                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Monto total del crédito
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {formatMoney(loan.amountDue ?? 0)}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Ya pagado
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {formatMoney(loan.amountPaid ?? 0)}
                                    </Typography>
                                </Stack>
                                <Divider sx={{ my: 0.5, borderColor: alpha(successColor, 0.35) }} />
                                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <Typography sx={{ fontWeight: 700 }}>A liquidar hoy</Typography>
                                    <Typography sx={{ fontWeight: 800, fontSize: 20, color: successColor }}>
                                        {formatMoney(amountNumber || 0)}
                                    </Typography>
                                </Stack>
                            </Box>
                        )}

                        <TextField
                            autoFocus={!isLiquidar}
                            fullWidth
                            type="number"
                            label={isLiquidar ? 'Monto a liquidar' : 'Cantidad'}
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => !isLiquidar && setAmount(e.target.value)}
                            disabled={loading}
                            helperText={
                                isLiquidar
                                    ? 'Monto fijo, calculado automáticamente — no editable'
                                    : loan.fixedCharge
                                        ? 'Monto fijo del crédito, puedes ajustarlo si el cliente paga distinto'
                                        : ' '
                            }
                            sx={
                                isLiquidar
                                    ? {
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: alpha(successColor, 0.06),
                                            '& fieldset': { borderColor: alpha(successColor, 0.5) },
                                            '&:hover fieldset': { borderColor: successColor },
                                        },
                                        '& .MuiInputBase-input': { fontWeight: 700, color: successColor },
                                    }
                                    : undefined
                            }
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                },
                                // Liquidar: monto fijo (lo que falta del crédito), no editable —
                                // a diferencia de "Pagar", que sí se puede ajustar.
                                htmlInput: { readOnly: isLiquidar },
                            }}
                        />
                    </Box>

                    <Divider />

                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, px: 3, py: 2.5 }}>
                        <Button
                            fullWidth
                            variant="text"
                            onClick={handleClose}
                            disabled={loading}
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
                            color={isLiquidar ? 'success' : 'primary'}
                            startIcon={isLiquidar && !loading ? <PaidRoundedIcon /> : null}
                            onClick={handleConfirm}
                            disabled={!isValid || loading}
                            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999, py: 1.25 }}
                        >
                            {loading ? 'Enviando...' : error ? 'Reintentar' : isLiquidar ? 'Liquidar crédito' : 'Confirmar pago'}
                        </Button>
                    </Box>
                </>
            )}
        </Drawer>
    );
}
