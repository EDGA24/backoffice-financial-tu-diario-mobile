import React from 'react';
import { Box, Typography } from '@mui/material';
import type { Control, FieldErrors, FieldValues } from 'react-hook-form';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import InputFormatField from '@/components/atoms/FormInputFileds/InputFormatField/InputFormatField';
import { ChangePasswordFormFieldsEnum } from '@/shared/constants/ChangePasswordFormFieldsEnum';

export interface ChangePasswordFormProps {
  control: Control<FieldValues | any, object>;
  errors: FieldErrors<any>;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  control,
  errors,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography sx={{ mb: -0.5, fontWeight: 700, fontSize: 16, color: 'primary.main' }}>
        Seguridad de la cuenta
      </Typography>

      <InputFormatField
        name={ChangePasswordFormFieldsEnum.CURRENT_PASSWORD}
        control={control}
        errors={errors}
        required
        type="password"
        rules={{ required: 'Ingresa tu contraseña actual' }}
        label="Contraseña actual"
        placeholder="Tu contraseña actual"
        startIcon={<LockOutlinedIcon fontSize="small" />}
      />

      <InputFormatField
        name={ChangePasswordFormFieldsEnum.NEW_PASSWORD}
        control={control}
        errors={errors}
        required
        type="password"
        rules={{
          required: 'Ingresa tu nueva contraseña',
          minLength: { value: 6, message: 'Debe tener al menos 6 caracteres' },
        }}
        label="Nueva contraseña"
        placeholder="Mínimo 6 caracteres"
        startIcon={<LockOutlinedIcon fontSize="small" />}
      />

      <InputFormatField
        name={ChangePasswordFormFieldsEnum.CONFIRM_NEW_PASSWORD}
        control={control}
        errors={errors}
        required
        type="password"
        rules={{
          required: 'Confirma tu nueva contraseña',
          validate: (value: string, formValues: any) =>
            value === formValues?.newPassword || 'Las contraseñas no coinciden',
        }}
        label="Confirmar nueva contraseña"
        placeholder="Repite tu nueva contraseña"
        startIcon={<LockOutlinedIcon fontSize="small" />}
      />
    </Box>
  );
};

export default ChangePasswordForm;
