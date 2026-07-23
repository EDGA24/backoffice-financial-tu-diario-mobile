import React from 'react';
import { Controller } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import { Autocomplete, TextField } from '@mui/material';
import { get } from 'lodash';

export interface AutocompleteOption {
  optionId: string;
  label: string;
}

export interface AutocompleteFormatFieldProps {
  name: string;
  control?: any;
  errors?: FieldErrors<any>;
  rules?: {};
  // Modo directo (sin RHF)
  value?: string;
  onChange?: (optionId: string | undefined) => void;
  // Comunes
  options: AutocompleteOption[];
  required?: boolean;
  sx?: {};
  label?: string;
  onChangeExtra?: (optionId: string | undefined) => void;
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

const AutocompleteFormatField: React.FC<AutocompleteFormatFieldProps> = ({
  name,
  control,
  errors,
  rules = {},
  value,
  onChange,
  options,
  required = false,
  sx = {},
  label,
  onChangeExtra,
}) => {
  // Modo directo: no hay control, se usa value/onChange tal cual
  if (!control) {
    return (
      <Autocomplete
        disablePortal
        options={options}
        aria-required={required}
        value={options.find((option) => option.optionId === value) ?? null}
        getOptionLabel={(option) => option.label}
        onChange={(_, newValue) => {
          const optionId = newValue ? newValue.optionId : undefined;
          onChange?.(optionId);
          onChangeExtra?.(optionId);
        }}
        sx={{ ...mobileFieldSx, ...sx }}
        renderInput={(params) => (
          <TextField {...params} name={name} label={label} required={required} />
        )}
      />
    );
  }

  // Modo RHF: usa Controller
  const fieldError = get(errors, name);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <Autocomplete
          disablePortal
          options={options}
          aria-required={required}
          value={options.find((option) => option.optionId === field.value) ?? null}
          getOptionLabel={(option) => option.label}
          onChange={(_, newValue) => {
            const optionId = newValue ? newValue.optionId : undefined;
            field.onChange(optionId);
            onChangeExtra?.(optionId);
          }}
          sx={{ ...mobileFieldSx, ...sx }}
          renderInput={(params) => (
            <TextField
              {...params}
              name={name}
              label={label}
              error={!!fieldError}
              helperText={(fieldError?.message as string) ?? ' '}
            />
          )}
        />
      )}
    />
  );
};

export default AutocompleteFormatField;