import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import type { Control, FieldErrors, FieldValues } from 'react-hook-form';

import InputFormatField from '@/components/atoms/FormInputFileds/InputFormatField/InputFormatField';
import { CreditFormFieldsEnum } from '@/shared/constants/CreditFormFieldsEnum';
import type { Credits } from '@/types/Credits';
import ChargeRulesAutocompleteField, {
  type ChargeRuleOption,
} from '../../ChargeRulesAutocompleteField/ChargeRulesAutocompleteField';
import { useAuthStore } from '@/stores/auth.store';
import { ChargeFrequencyEnum } from '@/shared/constants/ChargeFrequencyEnum';

const FREQUENCY_LABELS: Record<string, string> = {
  [ChargeFrequencyEnum.DAILY]: 'Diario',
  [ChargeFrequencyEnum.WEEKLY]: 'Semanal',
};

export interface CreditFormProps {
  control: Control<FieldValues | any, object>;
  errors: FieldErrors<Credits>;
  setValue: any;
}

export const CreditForm: React.FC<CreditFormProps> = ({ control, errors, setValue }) => {
  const ChargeRules = useAuthStore((state) => state.user?.creditorCompanyInfo?.chargeRules ?? []);

  const chargeRulesOptions: ChargeRuleOption[] = useMemo(
    () =>
      ChargeRules.map((rule, index) => {
        const frequencyLabel = FREQUENCY_LABELS[rule.chargeFrequency ?? ''] ?? rule.chargeFrequency ?? '';
        return {
          optionId: rule.chargeFrequency ?? `charge-rule-${index}`,
          label: `${frequencyLabel} · ${rule.chargePeriods ?? 0} pagos`,
          chargeFrequency: rule.chargeFrequency,
          chargePeriods: rule.chargePeriods,
          renovationPeriod: rule.renovationPeriod,
          comissionRate: rule.comissionRate,
        };
      }),
    [ChargeRules]
  );

  const handleSelectChargeRules = (optionId: string | undefined) => {
    const option = chargeRulesOptions.find((item) => item.optionId === optionId);
    if (!option) return;

    setValue('chargeRules.chargeFrequency', option.chargeFrequency);
    setValue('chargeRules.chargePeriods', option.chargePeriods);
    setValue('chargeRules.renovationPeriod', option.renovationPeriod);
    setValue('chargeRules.comissionRate', option.comissionRate);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography sx={{ mb: -0.5, fontWeight: 700, fontSize: 14, color: 'primary.main' }}>
        Reglas de cobro
      </Typography>

      <ChargeRulesAutocompleteField
        name="selectedChargeRulesId"
        control={control}
        errors={errors}
        options={chargeRulesOptions}
        chargeRulesNamePrefix="chargeRules"
        onSelectOption={handleSelectChargeRules}
        required
        label="Selecciona reglas de cobro"
      />

      <Typography sx={{ mt: 1, mb: -0.5, fontWeight: 700, fontSize: 16, color: 'primary.main' }}>
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

      <Typography variant="caption" color="text.secondary">
        Cargo fijo: se calcula automáticamente por el sistema
      </Typography>
    </Box>
  );
};

export default CreditForm;