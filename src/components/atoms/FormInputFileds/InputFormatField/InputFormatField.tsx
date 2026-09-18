import React from 'react';
import { Controller } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import { TextField, InputAdornment } from '@mui/material';
import { get } from 'lodash';

export interface InputFormatFieldProps {
  name: string;
  control: any;
  errors?: FieldErrors<any>;
  required?: boolean;
  type?: string;
  sx?: {};
  label?: string;
  placeholder?: string;
  rules?: {};
  startIcon?: React.ReactNode;
  disabled?: boolean;
  // Filtra en cada tecleo cualquier caracter que no sea dígito — para campos
  // como teléfono, que deben quedar como string (no como number, se pierden
  // ceros a la izquierda) pero sin aceptar letras.
  digitsOnly?: boolean;
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
  '& .MuiFormHelperText-root': { minHeight: 18, mx: 0 },
};

const InputFormatField: React.FC<InputFormatFieldProps> = ({
  name,
  control,
  errors,
  required = false,
  type = 'text',
  sx = {},
  label,
  placeholder,
  rules = {},
  startIcon,
  disabled = false,
  digitsOnly = false,
}) => {
  const isDate = type === 'date';
  const isNumber = type === 'number';
  const fieldError = get(errors, name);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          onChange={(e) => {
            const raw = e.target.value;
            if (digitsOnly) {
              field.onChange(raw.replace(/\D/g, ''));
              return;
            }
            // type="number" en el <input> solo restringe qué se puede teclear
            // Number(...) — mejor convertir aquí una sola vez, de raíz.
            field.onChange(isNumber && raw !== '' ? Number(raw) : raw);
          }}
          autoComplete={name}
          fullWidth
          label={label}
          placeholder={placeholder}
          required={required}
          type={type}
          disabled={disabled}
          variant="outlined"
          error={!!fieldError}
          helperText={(fieldError?.message as string) ?? ' '}
          slotProps={{
            ...(isDate ? { inputLabel: { shrink: true } } : {}),
            input: startIcon
              ? {
                  startAdornment: (
                    <InputAdornment position="start">{startIcon}</InputAdornment>
                  ),
                }
              : undefined,
            ...(digitsOnly ? { htmlInput: { inputMode: 'numeric' } } : {}),
          }}
          sx={{ ...mobileFieldSx, ...sx }}
        />
      )}
    />
  );
};

export default InputFormatField;