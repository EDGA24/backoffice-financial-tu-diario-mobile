import { Box, ButtonBase, Slider, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

const formatMoney = (value: number) =>
    `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatShort = (value: number) =>
    `$${value.toLocaleString('es-MX', { maximumFractionDigits: 2 })}`;

// Paso de la barra: fino en montos chicos, más grueso en grandes, para que se
// pueda manejar con el dedo.
const getStep = (max: number) => (max <= 100 ? 5 : max <= 1000 ? 10 : 50);

// Valores a los que se ajusta la barra: múltiplos del paso y siempre el total
// exacto (aunque no sea múltiplo), para poder abonar todo con la barra.
const buildMarks = (max: number) => {
    const step = getStep(max);
    const marks: { value: number }[] = [];
    for (let v = 0; v < max; v += step) marks.push({ value: v });
    marks.push({ value: max });
    return marks;
};

// Atajos: "Nada", un monto intermedio (por falta si se conoce el cargo, si no
// la mitad redondeada al paso) y "Todo".
const buildQuickAmounts = (max: number, chargePerFalta?: number): { label: string; value: number }[] => {
    const step = getStep(max);
    const intermedio = chargePerFalta && chargePerFalta > 0 && chargePerFalta < max
        ? chargePerFalta
        : Math.round(max / 2 / step) * step;
    return [
        { label: 'Nada', value: 0 },
        ...(intermedio > 0 && intermedio < max ? [{ label: formatShort(intermedio), value: intermedio }] : []),
        { label: 'Todo', value: max },
    ];
};

export interface MoratoryAbonoSectionProps {
    // Total pendiente del cargo por faltas (amountMoratory)
    total: number;
    // Cargo fijo por falta (chargeRules.latePaymentCharge), para el atajo intermedio
    chargePerFalta?: number;
    // Abono elegido; arranca en 0 (no se abona nada)
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
}

// Abono opcional al cargo por faltas dentro de un pago normal. Tarjeta neutra:
// el rojo solo marca la deuda (pendiente) y el abono cuando es mayor a 0.
export default function MoratoryAbonoSection({
    total,
    chargePerFalta,
    value,
    onChange,
    disabled = false,
}: MoratoryAbonoSectionProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const error = theme.palette.error.main;
    const restante = Math.max(0, total - value);
    const abona = value > 0;

    return (
        <Box
            sx={{
                mt: 1,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                p: 1.75,
            }}
        >
            {/* Encabezado: qué es y cuánto debe */}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <WarningAmberRoundedIcon sx={{ fontSize: 18, color: error, flexShrink: 0 }} />
                <Typography sx={{ fontWeight: 700, fontSize: 14, flex: 1, minWidth: 0 }} noWrap>
                    Abono a faltas{' '}
                    <Box component="span" sx={{ fontWeight: 500, color: 'text.secondary', fontSize: 12.5 }}>
                        (opcional)
                    </Box>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }} noWrap>
                    Debe{' '}
                    <Box component="span" sx={{ fontWeight: 800, color: error }}>{formatMoney(total)}</Box>
                </Typography>
            </Stack>

            {/* Monto elegido y lo que quedará */}
            <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mt: 1.25 }}>
                <Typography
                    sx={{
                        fontWeight: 800,
                        fontSize: 26,
                        lineHeight: 1.1,
                        color: abona ? error : 'text.disabled',
                        transition: 'color .15s ease',
                    }}
                >
                    {formatMoney(value)}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                    {restante > 0 ? (
                        <>Quedará <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>{formatMoney(restante)}</Box></>
                    ) : (
                        <Box component="span" sx={{ fontWeight: 700, color: 'success.main' }}>Faltas cubiertas</Box>
                    )}
                </Typography>
            </Stack>

            {/* Barra: arranca en $0 */}
            <Box sx={{ px: 1.25 }}>
                <Slider
                    value={value}
                    onChange={(_, v) => onChange(v as number)}
                    min={0}
                    max={total}
                    step={null}
                    marks={buildMarks(total)}
                    disabled={disabled}
                    aria-label="Abono a faltas"
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => formatShort(v)}
                    sx={{
                        color: error,
                        height: 6,
                        py: 2.25,
                        '& .MuiSlider-mark': { display: 'none' },
                        '& .MuiSlider-rail': { opacity: 1, bgcolor: isDark ? alpha('#fff', 0.14) : alpha('#000', 0.1) },
                        '& .MuiSlider-thumb': {
                            width: 26,
                            height: 26,
                            bgcolor: '#fff',
                            border: `2px solid ${abona ? error : theme.palette.text.disabled}`,
                            boxShadow: '0 2px 6px rgba(0,0,0,.25)',
                            // Área de toque más grande que el círculo visible
                            '&::after': { width: 48, height: 48 },
                            '&:hover, &.Mui-focusVisible, &.Mui-active': { boxShadow: `0 0 0 8px ${alpha(error, 0.14)}` },
                        },
                        '& .MuiSlider-valueLabel': { bgcolor: error, fontWeight: 700, borderRadius: 1.5, fontSize: 12 },
                    }}
                />
            </Box>

            {/* Atajos */}
            <Stack direction="row" spacing={1}>
                {buildQuickAmounts(total, chargePerFalta).map((opt) => {
                    const selected = value === opt.value;
                    return (
                        <ButtonBase
                            key={opt.label}
                            disabled={disabled}
                            onClick={() => onChange(opt.value)}
                            sx={{
                                flex: 1,
                                py: 0.9,
                                borderRadius: 2,
                                fontSize: 13,
                                fontWeight: 700,
                                border: '1px solid',
                                borderColor: selected ? 'transparent' : 'divider',
                                bgcolor: selected ? (opt.value > 0 ? alpha(error, isDark ? 0.25 : 0.12) : 'action.selected') : 'transparent',
                                color: selected && opt.value > 0 ? error : 'text.primary',
                                transition: 'all .15s ease',
                            }}
                        >
                            {opt.label}
                        </ButtonBase>
                    );
                })}
            </Stack>
        </Box>
    );
}
