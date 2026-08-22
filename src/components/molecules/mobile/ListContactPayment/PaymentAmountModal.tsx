import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Divider,
    Drawer,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import type { LoanSummary } from '../DashboardContacTable/DashboardContacTable';

export interface PaymentAmountModalProps {
    open: boolean;
    loan: LoanSummary | null;
    loading?: boolean;
    onClose: () => void;
    onConfirm: (amount: number) => void;
}

export default function PaymentAmountModal({
    open,
    loan,
    loading = false,
    onClose,
    onConfirm,
}: PaymentAmountModalProps) {
    const [amount, setAmount] = useState('');

    // Al abrir el sheet para un crédito, precarga el monto fijo a pagar
    // (por ahora viene de fixedCharge; el backend lo definirá formalmente
    // más adelante). El cobrador puede ajustarlo si el cliente paga distinto.
    useEffect(() => {
        if (open) {
            setAmount(loan?.fixedCharge ? String(loan.fixedCharge) : '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, loan?.creditId]);

    const amountNumber = Number(amount);
    const isValid = amount.trim() !== '' && !Number.isNaN(amountNumber) && amountNumber > 0;

    const handleClose = () => {
        if (loading) return;
        onClose();
    };

    const handleConfirm = () => {
        if (!isValid) return;
        onConfirm(amountNumber);
        setAmount('');
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
                                mb: 3,
                            }}
                        >
                            <Box>
                                <Typography sx={{ fontWeight: 800, fontSize: 22 }}>Registrar pago</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {loan.name} · {loan.phone}
                                </Typography>
                            </Box>
                            <IconButton onClick={handleClose} size="small" disabled={loading}>
                                <CloseRoundedIcon />
                            </IconButton>
                        </Box>

                        <TextField
                            autoFocus
                            fullWidth
                            type="number"
                            label="Cantidad"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={loading}
                            helperText={loan.fixedCharge ? 'Monto fijo del crédito, puedes ajustarlo si el cliente paga distinto' : ' '}
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                },
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
                            onClick={handleConfirm}
                            disabled={!isValid || loading}
                            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999, py: 1.25 }}
                        >
                            {loading ? 'Enviando...' : 'Confirmar pago'}
                        </Button>
                    </Box>
                </>
            )}
        </Drawer>
    );
}
