import React from 'react';
import { Box, Typography } from '@mui/material';
import type { Control, FieldErrors, FieldValues } from 'react-hook-form';

import AutocompleteFormatField from '@/components/atoms/FormInputFileds/AutocompleteFormatField/AutocompleteFormatField';
import InputFormatField from '@/components/atoms/FormInputFileds/InputFormatField/InputFormatField';
import { CustomerFormContactEnum, CustomerFormFieldsEnum } from '@/shared/constants/CustomerFormFieldsEnum';
import type { Customers } from '@/types/Customers';

export interface CustomerFormProps {
  control: Control<FieldValues | any, object>;
  errors: FieldErrors<Customers>;
  catalogEmployeeOptions: { optionId: string; label: string }[];
  catalogCustomerOptions: { optionId: string; label: string }[];
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  control,
  errors,
  catalogEmployeeOptions,
  catalogCustomerOptions,
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

      <AutocompleteFormatField
        name={CustomerFormFieldsEnum.EMPLOYEE_ID_RECORDER}
        control={control}
        errors={errors}
        options={catalogEmployeeOptions}
        required
        label="Selecciona a un cobrador"
      />

      <AutocompleteFormatField
        name={CustomerFormFieldsEnum.CUSTOMER_ID_AVAL}
        control={control}
        errors={errors}
        options={catalogCustomerOptions}
        required
        label="Selecciona a un cliente como aval"
      />
    </Box>
  );
};

export default CustomerForm;