import React from 'react';
import { Checkbox, FormControlLabel, FormGroup, FormLabel } from '@mui/material';

export interface CheckBoxGroupProps {
  name: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: { optionId: string; label: string }[];
  required?: boolean;
  label?: string;
  sx?: {};
}

const CheckBoxGroup: React.FC<CheckBoxGroupProps> = ({
  value,
  onChange,
  options,
  required = false,
  label,
  sx = {},
}) => {
  const handleToggle = (optionId: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionId]);
    } else {
      onChange(value.filter((id) => id !== optionId));
    }
  };

  return (
    <FormGroup sx={{ ...sx }}>
      {label && (
        <FormLabel required={required} sx={{ fontSize: 13, mb: 0.5 }}>
          {label}
        </FormLabel>
      )}
      {options.map((option) => (
        <FormControlLabel
          key={option.optionId}
          label={option.label}
          control={
            <Checkbox
              checked={value.includes(option.optionId)}
              onChange={(e) => handleToggle(option.optionId, e.target.checked)}
              color="primary"
            />
          }
        />
      ))}
    </FormGroup>
  );
};

export default CheckBoxGroup;