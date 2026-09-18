import React, { useEffect, useMemo, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useWatch, type Control, type FieldErrors, type FieldValues } from 'react-hook-form';
import { get } from 'lodash';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

import InputFormatField from '@/components/atoms/FormInputFileds/InputFormatField/InputFormatField';
import { CreditFormFieldsEnum } from '@/shared/constants/CreditFormFieldsEnum';
import type { Credits } from '@/types/Credits';
import ChargeRulesAutocompleteField, {
  type ChargeRuleOption,
} from '../../ChargeRulesAutocompleteField/ChargeRulesAutocompleteField';
import { useAuthStore } from '@/stores/auth.store';
import { useWalletLedgerStore } from '@/stores/walletLedger.store';
import { ChargeFrequencyEnum } from '@/shared/constants/ChargeFrequencyEnum';
import { UserRoleEnum } from '@/shared/constants/UserRoleEnum';

const formatMoney = (value: number) => `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

const FREQUENCY_LABELS: Record<string, string> = {
  [ChargeFrequencyEnum.DAILY]: 'Diario',
  [ChargeFrequencyEnum.WEEKLY]: 'Semanal',
};

export interface CreditFormProps {
  control: Control<FieldValues | any, object>;
  errors: FieldErrors<Credits>;
  setValue: any;
  // Renovación: ya se sabe si el crédito que se renueva es diario o semanal
  // (viene del crédito original), así que no tiene sentido pedirle al
  // cobrador que la vuelva a elegir a mano.
  initialChargeFrequency?: string;
}

export const CreditForm: React.FC<CreditFormProps> = ({ control, errors, setValue, initialChargeFrequency }) => {
  const ChargeRules = useAuthStore((state) => state.user?.creditorCompanyInfo?.chargeRules ?? []);
  const roles = useAuthStore((state) => state.user?.roles ?? []);
  // Solo admin puede editar a mano periodos/renovación/comisión — el cobrador
  // solo puede cambiar la regla completa (Frecuencia arriba), no sus valores.
  const isAdmin = roles.some((role) => role.toLowerCase() === UserRoleEnum.ADMIN);
  // Renovación: la regla ya viene fija del crédito original — nadie, ni
  // admin, la puede tocar aquí (a diferencia de readOnly, que solo bloquea
  // el detalle pero deja cambiar la Frecuencia).
  const isRenewalLocked = Boolean(initialChargeFrequency);

  
  // operación EXPENSES): egresos pendientes se restan, ingresos pendientes se suman.
  const firmBalance = useWalletLedgerStore((state) => state.firmBalance);
  const pendingIncomesBalance = useWalletLedgerStore((state) => state.pendingIncomesBalance);
  const pendingExpensesBalance = useWalletLedgerStore((state) => state.pendingExpensesBalance);
  const availableBalance = firmBalance - pendingExpensesBalance + pendingIncomesBalance;

  // Monto en vivo para calcular cuánto excede el saldo disponible — el
  // helperText del campo se queda corto ("Saldo insuficiente"), esta tarjeta
  // es la que muestra el detalle (disponible / cuánto falta).
  const creditAmountValue = useWatch({ control, name: CreditFormFieldsEnum.CREDIT_AMOUNT });
  const creditAmountError = get(errors, CreditFormFieldsEnum.CREDIT_AMOUNT);
  const montoIngresado = Number(creditAmountValue) || 0;
  const excedente = montoIngresado - availableBalance;
  const saldoInsuficiente = Boolean(creditAmountError) && excedente > 0;

  const chargeRulesOptions: ChargeRuleOption[] = useMemo(
    () =>
      ChargeRules.map((rule, index) => {
        const frequencyLabel = FREQUENCY_LABELS[rule.chargeFrequency ?? ''] ?? rule.chargeFrequency ?? '';
        return {
          optionId: rule.chargeFrequency ?? `charge-rule-${index}`,
          label: `${frequencyLabel} · ${rule.chargePeriods ?? 0} pagos`,
          chargeFrequency: rule.chargeFrequency,
          chargePeriods: rule.chargePeriods,
          chargeDay: rule.chargeDay,
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
    setValue('chargeRules.chargeDay', option.chargeDay);
    setValue('chargeRules.renovationPeriod', option.renovationPeriod);
    setValue('chargeRules.comissionRate', option.comissionRate);
  };

  // Preselecciona la regla al abrir el form en renovación — una sola vez, para
  // no pisar un cambio manual posterior. chargeRulesOptions tarda un tick en
  // llenarse (depende del user de useAuthStore), por eso va en un efecto y no
  // directo en defaultValues del form.
  const autoSelectedRenewalRef = useRef(false);
  useEffect(() => {
    if (autoSelectedRenewalRef.current || !initialChargeFrequency) return;
    const matchingOption = chargeRulesOptions.find((option) => option.optionId === initialChargeFrequency);
    if (!matchingOption) return;

    autoSelectedRenewalRef.current = true;
    setValue('selectedChargeRulesId', matchingOption.optionId);
    handleSelectChargeRules(matchingOption.optionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialChargeFrequency, chargeRulesOptions]);

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
        rules={{ required: 'Selecciona una regla de cobro' }}
        label="Selecciona reglas de cobro"
        readOnly={!isAdmin}
        disabled={isRenewalLocked}
      />

      <Typography sx={{ mt: 1, mb: -0.5, fontWeight: 700, fontSize: 16, color: 'primary.main' }}>
        Información del crédito
      </Typography>

      {/* Las fechas (admisión/expiración/inicio de cobro) se quitaron del
          formulario: el backend siempre las sobreescribe con new Date() al
          crear el crédito (ver createCreditsByEmployee en CreditService.ts),
          así que dejarlas editables aquí era engañoso — nunca se respetaban. */}
      <InputFormatField
        name={CreditFormFieldsEnum.CREDIT_AMOUNT}
        control={control}
        errors={errors}
        required
        type="number"
        label="Monto del crédito"
        placeholder="0.00"
        rules={{
          validate: (value: number) => {
            if (!value || Number(value) <= 0) return 'El monto debe ser mayor a $0';
            return Number(value) <= availableBalance || 'Saldo insuficiente';
          },
        }}
      />

      {saldoInsuficiente && (
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            alignItems: 'flex-start',
            borderRadius: 3,
            p: 1.75,
            mt: -1,
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
            border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
          }}
        >
          <ErrorOutlineRoundedIcon sx={{ color: 'error.main', fontSize: 22, mt: 0.1, flexShrink: 0 }} />
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: 'error.main' }}>
              Saldo insuficiente en tu wallet
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Disponible: {formatMoney(availableBalance)} · Te faltan {formatMoney(excedente)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic' }}>
               Consulta tu saldo para probar nuevamente
            </Typography>
          </Box>
        </Box>
      )}

      <Typography variant="caption" color="text.secondary">
        Cargo fijo: se calcula automáticamente por el sistema
      </Typography>
    </Box>
  );
};

export default CreditForm;