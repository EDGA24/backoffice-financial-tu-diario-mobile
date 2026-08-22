import React from 'react';
import { Box, Typography } from '@mui/material';
import type { Control, FieldErrors, FieldValues } from 'react-hook-form';

import InputFormatField from '@/components/atoms/FormInputFileds/InputFormatField/InputFormatField';
import { CustomerFormContactEnum, CustomerFormFieldsEnum } from '@/shared/constants/CustomerFormFieldsEnum';
import type { Customers } from '@/types/Customers';

export interface CustomerFormProps {
  control: Control<FieldValues | any, object>;
  errors: FieldErrors<Customers>;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  control,
  errors,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography sx={{ mb: -0.5, fontWeight: 700, fontSize: 16, color: 'primary.main' }}>
        Información del cliente
      </Typography>

      <InputFormatField
        name={CustomerFormContactEnum.NAME}
        control={control}
        errors={errors}
        required
        label="Nombre(s)"
        placeholder="Nombre(s) del cliente"
      />

      <InputFormatField
        name={CustomerFormContactEnum.LAST_NAME}
        control={control}
        errors={errors}
        required
        label="Apellido(s)"
        placeholder="Apellido(s) del cliente"
      />

      <InputFormatField
        name={CustomerFormContactEnum.ADRESS}
        control={control}
        errors={errors}
        required
        label="Dirección"
        placeholder="Dirección completa del cliente"
      />

      <InputFormatField
        name={CustomerFormContactEnum.PHONE_NUMBER}
        control={control}
        errors={errors}
        required
        label="Teléfono"
        placeholder="10 dígitos sin espacios"
      />

      <InputFormatField
        name={CustomerFormFieldsEnum.THREE_WORDS_UBICATION}
        control={control}
        errors={errors}
        required
        label="Ubicación 3WORDS"
        placeholder="Adjunta aquí la ubicación de 3WORDS"
      />
    </Box>
  );
};

export default CustomerForm;