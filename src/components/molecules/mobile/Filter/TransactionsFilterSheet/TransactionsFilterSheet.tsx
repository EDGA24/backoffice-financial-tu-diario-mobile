import { useState, useEffect } from 'react';
import { Badge, Box, Button, Chip } from '@mui/material';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import FilterBottomSheet from '../FilterBottomSheet/FilterBottomSheet';
import FilterAccordionSection from '../FilterAccordionSection/FilterAccordionSection';
import DateRangeSection, {
  type DateRangeValue,
  describeDateRangeValue,
} from '../DateRangeSection/DateRangeSection';

export interface TransactionsFilterValue {
  dateRange: DateRangeValue;
  movimientos: string[];
}

export interface TransactionsFilterSheetProps {
  value: TransactionsFilterValue;
  movimientoOptions: string[];
  movimientoLabels?: Record<string, string>;
  onApply: (value: TransactionsFilterValue) => void;
}

const TransactionsFilterSheet: React.FC<TransactionsFilterSheetProps> = ({
  value,
  movimientoOptions,
  movimientoLabels = {},
  onApply,
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TransactionsFilterValue>(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const hayFiltroActivo = value.dateRange.preset !== 'TODOS' || value.movimientos.length > 0;

  const handleOpen = () => {
    setDraft(value);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const toggleMovimiento = (v: string) => {
    setDraft((prev) => ({
      ...prev,
      movimientos: prev.movimientos.includes(v)
        ? prev.movimientos.filter((m) => m !== v)
        : [...prev.movimientos, v],
    }));
  };

  const handleAplicar = () => {
    onApply(draft);
    handleClose();
  };
  const handleLimpiar = () => {
    const cleared: TransactionsFilterValue = { dateRange: { preset: 'TODOS', range: null }, movimientos: [] };
    setDraft(cleared);
    onApply(cleared);
    handleClose();
  };

  const movimientosSummary =
    draft.movimientos.length === 0
      ? 'Todos los movimientos'
      : draft.movimientos.map((m) => movimientoLabels[m] ?? m).join(', ');

  return (
    <>
      <Button
        onClick={handleOpen}
        startIcon={
          <Badge color="primary" variant="dot" invisible={!hayFiltroActivo}>
            <TuneRoundedIcon fontSize="small" />
          </Badge>
        }
        sx={{
          textTransform: 'none',
          fontWeight: 700,
          fontSize: 13.5,
          color: hayFiltroActivo ? 'primary.main' : 'text.primary',
          border: '1px solid',
          borderColor: hayFiltroActivo ? 'primary.main' : 'divider',
          borderRadius: 999,
          px: 2,
          py: 0.75,
          minHeight: 40,
          whiteSpace: 'nowrap',
          backgroundColor: hayFiltroActivo ? 'primary.50' : 'transparent',
        }}
      >
        Filtros
      </Button>

      <FilterBottomSheet open={open} onClose={handleClose} onClear={handleLimpiar} onApply={handleAplicar}>
        <FilterAccordionSection title="Período" summary={describeDateRangeValue(draft.dateRange)}>
          <DateRangeSection
            value={draft.dateRange}
            onChange={(dateRange) => setDraft((prev) => ({ ...prev, dateRange }))}
          />
        </FilterAccordionSection>

        <FilterAccordionSection title="Movimientos" summary={movimientosSummary}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {movimientoOptions.map((opt) => (
              <Chip
                key={opt}
                label={movimientoLabels[opt] ?? opt}
                clickable
                onClick={() => toggleMovimiento(opt)}
                color={draft.movimientos.includes(opt) ? 'primary' : 'default'}
                variant={draft.movimientos.includes(opt) ? 'filled' : 'outlined'}
                sx={{ fontWeight: 600, borderRadius: 999 }}
              />
            ))}
          </Box>
        </FilterAccordionSection>
      </FilterBottomSheet>
    </>
  );
};

export default TransactionsFilterSheet;