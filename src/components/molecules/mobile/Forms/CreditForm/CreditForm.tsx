import React from 'react';
import { Box, Typography } from '@mui/material';
import type { Control, FieldErrors, FieldValues } from 'react-hook-form';

import InputFormatField from '@/components/atoms/FormInputFileds/InputFormatField/InputFormatField';
import AutocompleteFormatField from '@/components/atoms/FormInputFileds/AutocompleteFormatField/AutocompleteFormatField';
import { CreditFormFieldsEnum } from '@/shared/constants/CreditFormFieldsEnum';
import type { Credits } from '@/types/Credits';
import ChargeRulesAutocompleteField, {
  type ChargeRuleOption,
} from '../../ChargeRulesAutocompleteField/ChargeRulesAutocompleteField';

const STATUS_OPTIONS = [
  { optionId: 'CHARGE-PROCESS', label: 'En proceso de cobro' },
  { optionId: 'SLOW-PAY', label: 'Pago lento' },
  { optionId: 'PAID', label: 'Pagado' },
  { optionId: 'RESTRUCTURED', label: 'Reestructurado' },
];

const CHARGE_RULES_OPTIONS: ChargeRuleOption[] = [
  {
    optionId: 'daily-standard',
    label: 'Diario · 12 pagos ',
    chargeFrequency: 'DAILY',
    chargePeriods: 12,
    renovationPeriod: 0,
    comissionRate: 5,
  },
  {
    optionId: 'weekly-standard',
    label: 'Semanal · 12 pagos ',
    chargeFrequency: 'WEEKLY',
    chargePeriods: 12,
    renovationPeriod: 0,
    comissionRate: 5,
  },
];

export interface CreditFormProps {
  control: Control<FieldValues | any, object>;
  errors: FieldErrors<Credits>;
  setValue: any;
}

export const CreditForm: React.FC<CreditFormProps> = ({ control, errors, setValue }) => {
  const handleSelectChargeRules = (optionId: string | undefined) => {
    const option = CHARGE_RULES_OPTIONS.find((item) => item.optionId === optionId);
    if (!option) return;

    setValue('chargeRules.chargeFrequency', option.chargeFrequency);
    setValue('chargeRules.chargePeriods', option.chargePeriods);
    setValue('chargeRules.renovationPeriod', option.renovationPeriod);
    setValue('chargeRules.comissionRate', option.comissionRate);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography sx={{ mb: -0.5, fontWeight: 700, fontSize: 16, color: 'primary.main' }}>
        Información del crédito
      </Typography>

      <InputFormatField
        name={CreditFormFieldsEnum.ADMISSION_DATE}
        control={control}
        errors={errors}
        required
        type="date"
        label="Fecha de admisión"
      />

      <InputFormatField
        name={CreditFormFieldsEnum.EXPIRATION_DATE}
        control={control}
        errors={errors}
        required
        type="date"
        label="Fecha de expiración"
      />

      <InputFormatField
        name={CreditFormFieldsEnum.START_DATE_CHARGE_CONFIG}
        control={control}
        errors={errors}
        required
        type="date"
        label="Fecha de inicio de cobro"
      />

      <InputFormatField
        name={CreditFormFieldsEnum.CREDIT_AMOUNT}
        control={control}
        errors={errors}
        required
        type="number"
        label="Monto del crédito"
        placeholder="0.00"
      />

      <InputFormatField
        name={CreditFormFieldsEnum.CREDIT_AMOUNT_WITH_MORATORY}
        control={control}
        errors={errors}
        required
        type="number"
        label="Monto con moratorios"
        placeholder="0.00"
      />

      <InputFormatField
        name={CreditFormFieldsEnum.FIXED_CHARGE}
        control={control}
        errors={errors}
        required
        type="number"
        label="Cargo fijo"
        placeholder="0.00"
      />

      <AutocompleteFormatField
        name={CreditFormFieldsEnum.STATUS}
        control={control}
        errors={errors}
        options={STATUS_OPTIONS}
        required
        label="Estatus"
      />

      <Typography sx={{ mt: 1, mb: -0.5, fontWeight: 700, fontSize: 14, color: 'primary.main' }}>
        Reglas de cobro
      </Typography>

      <ChargeRulesAutocompleteField
        name="selectedChargeRulesId"
        control={control}
        errors={errors}
        options={CHARGE_RULES_OPTIONS}
        chargeRulesNamePrefix="chargeRules"
        onSelectOption={handleSelectChargeRules}
        required
        label="Selecciona reglas de cobro"
      />
    </Box>
  );
};

export default CreditForm;