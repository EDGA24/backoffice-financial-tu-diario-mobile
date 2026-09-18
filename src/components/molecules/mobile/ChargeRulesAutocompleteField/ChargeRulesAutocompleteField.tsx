import React from 'react';
import { Controller } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import { get } from 'lodash';
import InputFormatField from '@/components/atoms/FormInputFileds/InputFormatField/InputFormatField';
import AutocompleteFormatField from '@/components/atoms/FormInputFileds/AutocompleteFormatField/AutocompleteFormatField';
import type { ChargeRules } from '@/types/Credits';
import { ChargeFrequencyEnum } from '@/shared/constants/ChargeFrequencyEnum';

export type ChargeRuleOption = { optionId: string; label: string } & ChargeRules;


const FREQUENCY_OPTIONS = [
  { optionId: ChargeFrequencyEnum.DAILY, label: 'Diario' },
  { optionId: ChargeFrequencyEnum.WEEKLY, label: 'Semanal' },
];

export interface ChargeRulesAutocompleteFieldProps {
  name: string;
  control: any;
  errors?: FieldErrors<any>;
  options: ChargeRuleOption[];
  chargeRulesNamePrefix: string;
  onSelectOption?: (optionId: string | undefined) => void;
  required?: boolean;
  label?: string;
  rules?: {};
  sx?: {};
  // Cobrador: no puede tocar periodos/renovación/comisión a mano, solo elegir
  // otra regla completa arriba (Frecuencia). Admin sí puede editar cada valor.
  readOnly?: boolean;
  // Renovación: la regla completa (incluida la Frecuencia de arriba) viene
  // fija del crédito que se está renovando — nadie, ni admin, la puede
  // cambiar aquí. Distinto de readOnly, que solo bloquea el detalle.
  disabled?: boolean;
}

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" component="div">
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600 }}>{value}</Typography>
    </Box>
  );
}

const mobileFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    backgroundColor: 'background.paper',
    fontSize: 14.5,
    '& fieldset': { borderColor: 'divider' },
    '&:hover fieldset': { borderColor: 'secondary.main' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 },
  },
  '& .MuiInputLabel-root': { fontSize: 14 },
  '& .MuiInputLabel-root.Mui-focused': { color: 'primary.main' },
};

const ChargeRulesAutocompleteField: React.FC<ChargeRulesAutocompleteFieldProps> = ({
  name,
  control,
  errors,
  options,
  chargeRulesNamePrefix,
  onSelectOption,
  required = false,
  label = 'Selecciona reglas de cobro',
  rules = {},
  sx = {},
  readOnly = false,
  disabled = false,
}) => {
  const fieldError = get(errors, name);
  // En renovación el detalle también se ve fijo, sin importar el rol — la
  // regla ya viene del crédito original, no hay nada que editar.
  const effectiveReadOnly = readOnly || disabled;

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => {
        const selectedOption = options.find((option) => option.optionId === field.value) ?? null;

        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Autocomplete
              disablePortal
              disabled={disabled}
              options={options}
              value={selectedOption}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, val) => option.optionId === val.optionId}
              onChange={(_, newValue) => {
                const optionId = newValue ? newValue.optionId : undefined;
                field.onChange(optionId);
                onSelectOption?.(optionId);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  name={name}
                  label={label}
                  required={required}
                  error={!!fieldError}
                  helperText={
                    disabled
                      ? 'Viene fija del crédito que se está renovando'
                      : (fieldError?.message as string) ?? ' '
                  }
                />
              )}
              sx={{ ...mobileFieldSx, ...sx }}
            />

            {selectedOption && (
              <Box
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {disabled
                    ? 'Estos valores vienen fijos del crédito que se está renovando'
                    : effectiveReadOnly
                      ? 'Estos valores vienen fijos con la regla seleccionada  para cambiarlos, elige otra opción arriba'
                      : 'Puedes ajustar estos valores si lo necesitas'}
                </Typography>

                {effectiveReadOnly ? (
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    <ReadOnlyRow
                      label="Frecuencia"
                      value={FREQUENCY_OPTIONS.find((opt) => opt.optionId === selectedOption.chargeFrequency)?.label ?? '—'}
                    />
                    <ReadOnlyRow label="Periodos" value={String(selectedOption.chargePeriods ?? '—')} />
                    <ReadOnlyRow label="Periodo de renovación" value={String(selectedOption.renovationPeriod ?? '—')} />
                    <ReadOnlyRow label="Tasa de comisión" value={`${selectedOption.comissionRate ?? '—'}%`} />
                  </Box>
                ) : (
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    <AutocompleteFormatField
                      name={`${chargeRulesNamePrefix}.chargeFrequency`}
                      control={control}
                      errors={errors}
                      options={FREQUENCY_OPTIONS}
                      required
                      label="Frecuencia"
                    />

                    <InputFormatField
                      name={`${chargeRulesNamePrefix}.chargePeriods`}
                      control={control}
                      errors={errors}
                      required
                      type="number"
                      label="Periodos"
                    />

                    <InputFormatField
                      name={`${chargeRulesNamePrefix}.renovationPeriod`}
                      control={control}
                      errors={errors}
                      required
                      type="number"
                      label="Periodo de renovación"
                    />

                    <InputFormatField
                      name={`${chargeRulesNamePrefix}.comissionRate`}
                      control={control}
                      errors={errors}
                      required
                      type="number"
                      label="Tasa de comisión"
                      placeholder="%"
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        );
      }}
    />
  );
};

export default ChargeRulesAutocompleteField;