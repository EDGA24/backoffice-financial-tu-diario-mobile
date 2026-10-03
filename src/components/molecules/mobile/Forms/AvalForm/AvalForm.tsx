import React from 'react';
import { Box, Typography } from '@mui/material';
import InputFormatField from '@/components/atoms/FormInputFileds/InputFormatField/InputFormatField';
import AutocompleteFormatField, {
  type AutocompleteOption,
} from '@/components/atoms/FormInputFileds/AutocompleteFormatField/AutocompleteFormatField';
import { CustomerFormContactEnum } from '@/shared/constants/CustomerFormFieldsEnum';
import type { Aval } from '@/types/Customers';
import type { IFormProps } from '@/shared/interfaces/IFormProps';

export interface AvalFormProps extends IFormProps<Aval> {
  // Buscador de "¿el aval ya es cliente?" — al elegir uno se rellenan los
  // datos de contacto de abajo (se pueden corregir a mano después).
  customerSelector: {
    value: string;
    onChange: (value: string | undefined) => void;
    onInputChange: (text: string) => void;
    loading: boolean;
    options: AutocompleteOption[];
  };
}

// Datos de contacto del aval — mismos campos (contact.*) que CustomerForm,
// porque el aval guarda su información con la misma estructura.
export const AvalForm: React.FC<AvalFormProps> = ({ control, errors, customerSelector }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <AutocompleteFormatField
        name="avalCustomerId"
        value={customerSelector.value}
        onChange={customerSelector.onChange}
        onInputChange={customerSelector.onInputChange}
        loading={customerSelector.loading}
        options={customerSelector.options}
        label="¿El aval ya es cliente? Selecciónalo aquí"
      />

      <Typography sx={{ mb: -0.5, fontWeight: 700, fontSize: 14, color: 'primary.main' }}>
        Información de contacto del aval
      </Typography>

      <InputFormatField
        name={CustomerFormContactEnum.NAME}
        control={control}
        errors={errors}
        required
        rules={{ required: 'El nombre es obligatorio' }}
        label="Nombre(s)"
        placeholder="Nombre(s) del aval"
      />

      <InputFormatField
        name={CustomerFormContactEnum.LAST_NAME}
        control={control}
        errors={errors}
        required
        rules={{ required: 'El apellido es obligatorio' }}
        label="Apellido(s)"
        placeholder="Apellido(s) del aval"
      />

      <InputFormatField
        name={CustomerFormContactEnum.ADRESS}
        control={control}
        errors={errors}
        required
        rules={{ required: 'La dirección es obligatoria' }}
        label="Dirección"
        placeholder="Dirección completa del aval"
      />

      <InputFormatField
        name={CustomerFormContactEnum.PHONE_NUMBER}
        control={control}
        errors={errors}
        required
        rules={{
          required: 'El teléfono es obligatorio',
          pattern: { value: /^\d+$/, message: 'Solo se permiten números' },
        }}
        type="tel"
        digitsOnly
        label="Teléfono"
        placeholder="10 dígitos sin espacios"
      />
    </Box>
  );
};

export default AvalForm;
