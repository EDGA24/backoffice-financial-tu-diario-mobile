import { useState } from 'react';
import { Box, FormControlLabel, IconButton, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

export interface DateRange {
    startDate: string; // "YYYY-MM-DD"
    endDate: string;   // "YYYY-MM-DD"
}

export type PeriodPreset =
    | 'TODOS'
    | 'HOY'
    | 'AYER'
    | 'ULTIMOS_7_DIAS'
    | 'ULTIMOS_15_DIAS'
    | 'ULTIMOS_30_DIAS'
    | 'ULTIMOS_6_MESES'
    | 'ULTIMO_ANIO'
    | 'PERSONALIZADO';

export interface DateRangeValue {
    preset: PeriodPreset;
    range: DateRange | null;
}

export interface DateRangeSectionProps {
    value: DateRangeValue;
    onChange: (value: DateRangeValue) => void;
}

const PRESET_OPTIONS: { key: PeriodPreset; label: string }[] = [
    { key: 'TODOS', label: 'Todos los períodos' },
    { key: 'HOY', label: 'Hoy' },
    { key: 'AYER', label: 'Ayer' },
    { key: 'ULTIMOS_7_DIAS', label: 'Últimos 7 días' },
    { key: 'ULTIMOS_15_DIAS', label: 'Últimos 15 días' },
    { key: 'ULTIMOS_30_DIAS', label: 'Últimos 30 días' },
    { key: 'ULTIMOS_6_MESES', label: 'Últimos 6 meses' },
    { key: 'ULTIMO_ANIO', label: 'Último año' },
];

const toIso = (d: Date) => d.toISOString().slice(0, 10);

// Traduce un preset a fechas concretas — reutilizable donde se necesite.
export const presetToRange = (preset: PeriodPreset): DateRange | null => {
    const today = new Date();
    const endDate = toIso(today);
    const daysAgo = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return toIso(d);
    };

    switch (preset) {
        case 'TODOS':
            return null;
        case 'HOY':
            return { startDate: endDate, endDate };
        case 'AYER': {
            const y = new Date();
            y.setDate(y.getDate() - 1);
            return { startDate: toIso(y), endDate: toIso(y) };
        }
        case 'ULTIMOS_7_DIAS':
            return { startDate: daysAgo(7), endDate };
        case 'ULTIMOS_15_DIAS':
            return { startDate: daysAgo(15), endDate };
        case 'ULTIMOS_30_DIAS':
            return { startDate: daysAgo(30), endDate };
        case 'ULTIMOS_6_MESES': {
            const d = new Date();
            d.setMonth(d.getMonth() - 6);
            return { startDate: toIso(d), endDate };
        }
        case 'ULTIMO_ANIO': {
            const d = new Date();
            d.setFullYear(d.getFullYear() - 1);
            return { startDate: toIso(d), endDate };
        }
        default:
            return null;
    }
};

// Texto de resumen para mostrar colapsado, ej: "Últimos 7 días" o "2026-08-01 — 2026-08-05"
export const describeDateRangeValue = (value: DateRangeValue): string => {
    if (value.preset === 'PERSONALIZADO' && value.range) {
        return `${value.range.startDate} — ${value.range.endDate}`;
    }
    return PRESET_OPTIONS.find((o) => o.key === value.preset)?.label ?? 'Todos los períodos';
};

const DateRangeSection: React.FC<DateRangeSectionProps> = ({ value, onChange }) => {
    const [view, setView] = useState<'list' | 'custom'>('list');

    const handleSelectPreset = (preset: PeriodPreset) => {
        if (preset === 'PERSONALIZADO') {
            setView('custom');
            onChange({ preset, range: value.range });
            return;
        }
        onChange({ preset, range: presetToRange(preset) });
    };

    if (view === 'custom') {
        return (
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <IconButton size="small" onClick={() => setView('list')}>
                        <ArrowBackRoundedIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>Selecciona un rango</Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Desde"
                        type="date"
                        fullWidth
                        slotProps={{ inputLabel: { shrink: true } }}
                        value={value.range?.startDate ?? ''}
                        onChange={(e) =>
                            onChange({
                                preset: 'PERSONALIZADO',
                                range: { startDate: e.target.value, endDate: value.range?.endDate ?? '' },
                            })
                        }
                    />
                    <TextField
                        label="Hasta"
                        type="date"
                        fullWidth
                        slotProps={{ inputLabel: { shrink: true } }}
                        value={value.range?.endDate ?? ''}
                        onChange={(e) =>
                            onChange({
                                preset: 'PERSONALIZADO',
                                range: { startDate: value.range?.startDate ?? '', endDate: e.target.value },
                            })
                        }
                    />
                </Box>
            </Box>
        );
    }

    return (
        <Box>
            <RadioGroup value={value.preset} onChange={(_, val) => handleSelectPreset(val as PeriodPreset)}>
                {PRESET_OPTIONS.map((opt) => (
                    <FormControlLabel key={opt.key} value={opt.key} control={<Radio />} label={opt.label} sx={{ py: 0.5 }} />
                ))}
            </RadioGroup>

            <Box
                onClick={() => handleSelectPreset('PERSONALIZADO')}
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.5,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    mt: 1,
                    cursor: 'pointer',
                }}
            >
                <Typography>Otro período</Typography>
                <Typography color="text.secondary">›</Typography>
            </Box>
        </Box>
    );
};

export default DateRangeSection;