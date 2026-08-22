import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import type { FieldErrors } from 'react-hook-form';

import InputFormatField from '@/components/atoms/FormInputFileds/InputFormatField/InputFormatField';
import AutocompleteFormatField from '@/components/atoms/FormInputFileds/AutocompleteFormatField/AutocompleteFormatField';
import { TransactionFormFieldsEnum } from '@/shared/constants/TransactionFormFieldsEnum';
import type { Transactions } from '@/types/Transactions';
import type { EmployeeOption } from '@/shared/constants/catalogs/employees.catalog';
import type { DestinationAccountMode } from '@/containers/wallet/WalletDashboardContainer/state/useWalletDashboardState';

export interface TransactionFormProps {
  control: any;
  errors: FieldErrors<Transactions>;
  transactionTypeLabel: string;
  destinationAccountMode: DestinationAccountMode;
  requiresSourceAccount: boolean;
  sourceAccountNumber?: string;
  sourceWalletId?: string;
  employeeOptions: EmployeeOption[];
  destinationAccountNumber?: string;
  destinationWalletId?: string;
  loadingDestinationWallet?: boolean;
  onSelectDestinationEmployee: (employeeId: string | undefined) => void;
}

function AccountSummary({ accountNumber, caption }: { accountNumber?: string; caption: string }) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'action.hover',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <AccountBalanceWalletRoundedIcon sx={{ color: 'text.secondary' }} />
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {accountNumber || 'Sin cuenta asignada'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {caption}
        </Typography>
      </Box>
    </Box>
  );
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  control,
  errors,
  transactionTypeLabel,
  destinationAccountMode,
  requiresSourceAccount,
  sourceAccountNumber,
  sourceWalletId,
  employeeOptions,
  destinationAccountNumber,
  destinationWalletId,
  loadingDestinationWallet = false,
  onSelectDestinationEmployee,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="caption" color="text.secondary">
        Tipo de movimiento
      </Typography>
      <Typography sx={{ mt: -1.5, fontWeight: 700, fontSize: 16 }}>{transactionTypeLabel}</Typography>

      <InputFormatField
        name={TransactionFormFieldsEnum.TOTAL}
        control={control}
        errors={errors}
        required
        type="number"
        label="Cantidad"
        placeholder="0.00"
        rules={{
          required: 'Captura una cantidad',
          min: { value: 0.01, message: 'Debe ser mayor a 0' },
        }}
      />

      <InputFormatField
        name={TransactionFormFieldsEnum.CURRENCY}
        control={control}
        errors={errors}
        label="Moneda"
        placeholder="MXN"
      />

      {requiresSourceAccount && (
        <>
          <Typography sx={{ mt: 1, mb: -0.5, fontWeight: 700, fontSize: 14, color: 'primary.main' }}>
            Cuenta origen
          </Typography>

          <AccountSummary accountNumber={sourceAccountNumber} caption={`Tu wallet · ${sourceWalletId || 'sin wallet'}`} />
        </>
      )}

      {destinationAccountMode !== 'none' && (
        <>
          <Typography sx={{ mt: 1, mb: -0.5, fontWeight: 700, fontSize: 14, color: 'primary.main' }}>
            Cuenta destino
          </Typography>

          {destinationAccountMode === 'self' ? (
            <AccountSummary
              accountNumber={destinationAccountNumber}
              caption={`Tu wallet · ${destinationWalletId || 'sin wallet'}`}
            />
          ) : (
            <>
              <AutocompleteFormatField
                name="destinationEmployeeId"
                control={control}
                errors={errors}
                options={employeeOptions.map((employee) => ({ optionId: employee.optionId, label: employee.label }))}
                required
                rules={{ required: 'Selecciona a quién va dirigido el movimiento' }}
                label="Selecciona un trabajador"
                onChangeExtra={onSelectDestinationEmployee}
              />

              {loadingDestinationWallet ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption" color="text.secondary">
                    Buscando wallet del trabajador…
                  </Typography>
                </Box>
              ) : (
                destinationWalletId && (
                  <AccountSummary accountNumber={destinationAccountNumber} caption={`Wallet · ${destinationWalletId}`} />
                )
              )}
            </>
          )}
        </>
      )}

      <InputFormatField
        name={TransactionFormFieldsEnum.DESCRIPTION}
        control={control}
        errors={errors}
        label="Descripción"
        disabled
      />
    </Box>
  );
};

export default TransactionForm;
