import React from 'react';
import { FormControlLabel, Switch } from '@mui/material';

export interface SwitchFormatFieldProps {
  name: string;
  value: 'Active' | 'Inactive' | string;
  onChange: (value: 'Active' | 'Inactive') => void;
  required?: boolean;
  label?: string;
  sx?: {};
}

const SwitchFormatField: React.FC<SwitchFormatFieldProps> = ({
  name,
  value,
  onChange,
  required = false,
  label,
  sx = {},
}) => {
  return (
    <FormControlLabel
      label={label}
      required={required}
      sx={{ ...sx }}
      control={
        <Switch
          name={name}
          checked={value === 'Active'}
          onChange={(event) => onChange(event.target.checked ? 'Active' : 'Inactive')}
          color="primary"
        />
      }
    />
  );
};

export default SwitchFormatField;