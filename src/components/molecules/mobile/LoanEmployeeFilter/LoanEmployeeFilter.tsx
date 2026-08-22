import { useState } from 'react';
import { Autocomplete, Badge, Button, TextField, Typography, createFilterOptions } from '@mui/material';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import type { EmployeeOption } from '@/shared/constants/catalogs/employees.catalog';
import FilterBottomSheet from '@/components/molecules/mobile/Filter/FilterBottomSheet/FilterBottomSheet';

export interface LoanEmployeeFilterProps {
  options: EmployeeOption[];
  selectedEmployeeId: string | null;
  onApply: (employeeId: string | null) => void;
}

const filterOptions = createFilterOptions<EmployeeOption>({
  stringify: (option) => `${option.label} ${option.phoneNumber ?? ''}`,
});

export default function LoanEmployeeFilter({
  options,
  selectedEmployeeId,
  onApply,
}: LoanEmployeeFilterProps) {
  const [open, setOpen] = useState(false);
  const [draftEmployeeId, setDraftEmployeeId] = useState<string | null>(selectedEmployeeId);

  const hayFiltroActivo = Boolean(selectedEmployeeId);

  const handleOpen = () => {
    setDraftEmployeeId(selectedEmployeeId);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleAplicar = () => {
    onApply(draftEmployeeId);
    handleClose();
  };
  const handleLimpiar = () => {
    setDraftEmployeeId(null);
    onApply(null);
    handleClose();
  };

  const selectedOption = options.find((o) => o.optionId === draftEmployeeId) ?? null;

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

      <FilterBottomSheet
        open={open}
        onClose={handleClose}
        onClear={handleLimpiar}
        onApply={handleAplicar}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1.5 }}>Trabajador</Typography>
        <Autocomplete
          options={options}
          value={selectedOption}
          onChange={(_, newValue) => setDraftEmployeeId(newValue?.optionId ?? null)}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.optionId === value.optionId}
          filterOptions={filterOptions}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Buscar por nombre..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
          )}
        />
      </FilterBottomSheet>
    </>
  );
}