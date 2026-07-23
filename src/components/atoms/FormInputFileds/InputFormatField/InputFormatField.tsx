import React from 'react';
import { Controller } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import { TextField } from '@mui/material';
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
}) => {
  const isDate = type === 'date';
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
          autoComplete={name}
          fullWidth
          label={label}
          placeholder={placeholder}
          required={required}
          type={type}
          variant="outlined"
          error={!!fieldError}
          helperText={(fieldError?.message as string) ?? ' '}
          slotProps={isDate ? { inputLabel: { shrink: true } } : undefined}
          sx={{ ...mobileFieldSx, ...sx }}
        />
      )}
    />
  );
};

export default InputFormatField;