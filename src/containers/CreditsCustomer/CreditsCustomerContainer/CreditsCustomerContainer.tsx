import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Snackbar, Typography } from '@mui/material';
import FormScreenHeader from '@/components/organisms/mobile/FormscreenHeader/FormscreenHeader';
import CustomerForm from '@/components/molecules/mobile/Forms/CustomerForm/CustomerForm';
import CreditForm from '@/components/molecules/mobile/Forms/CreditForm/CreditForm';
import FormActionBar, { BOTTOM_NAV_HEIGHT } from '@/components/molecules/mobile/FormActionBar/FormActionBar';
import AutocompleteFormatField from '@/components/atoms/FormInputFileds/AutocompleteFormatField/AutocompleteFormatField';
import CustomerSummaryCard from '@/components/molecules/mobile/CustomerSummaryCard/CustomerSummaryCard';
import TransactionStatusOverlay from '@/components/molecules/mobile/TransactionStatusOverlay/TransactionStatusOverlay';
import CreditSuccessTicket from '@/components/molecules/mobile/CreditSuccessTicket/CreditSuccessTicket';
import FirstChargeFlowModal from '@/components/molecules/mobile/FirstChargeFlowModal/FirstChargeFlowModal';
import AvalField from '@/components/molecules/mobile/AvalField/AvalField';

import { useCreditsCustomerContainerState } from './state/useCreditsCustomerContainerState';

const CreditsCustomerContainer = () => {
  const {
    customerSelector,
    customer,
    credit,
    loadingSave,
    creditOverlayStatus,
    creditError,
    clearCreditError,
    isExistingCustomer,
    isRenewal,
    handleOnSaveCredit,
    creditSuccessTicket,
    showCreditTicket,
    canSendCreditWhatsApp,
    handleSendCreditWhatsApp,
    handleContinueAfterCredit,
    firstChargeFlow,
    avalField,
  } = useCreditsCustomerContainerState();
  console.log("CreditsCustomerContainer-credit: ", credit)

  
  const navigate = useNavigate();
  return (
    <React.Fragment>
      <FormScreenHeader title={isRenewal ? 'Renovar Crédito' : 'Nuevo Crédito'} onBack={() => navigate(-1)} />

      <Box sx={{ px: 2.5, pt: 2.5, pb: 16, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="caption" color="text.secondary">
          {isRenewal
            ? 'Este crédito se creará para el cliente que está renovando.'
            : 'Todos los campos marcados son obligatorios'}
        </Typography>

        {!isRenewal && (
          <AutocompleteFormatField
            name="selectedCustomerId"
            value={customerSelector.value}
            onChange={customerSelector.onChange}
            onInputChange={customerSelector.onInputChange}
            loading={customerSelector.loading}
            options={customerSelector.options}
            label="¿Ya existe el cliente? Selecciónalo aquí"
          />
        )}

        {customerSelector.summary && (
          <Box sx={{ mt: -3 }}>
            <CustomerSummaryCard {...customerSelector.summary} />
          </Box>
        )}

        {!isExistingCustomer && <CustomerForm {...customer} />}

        {/* El aval se guarda junto con el cliente nuevo (el backend lo
            registra al crear el cliente), por eso solo aparece aquí. */}
        {!isExistingCustomer && <AvalField {...avalField} />}

        <CreditForm {...credit} />
      </Box>

      <FormActionBar label="Guardar crédito" isLoading={loadingSave} onClick={handleOnSaveCredit} />

      {/* Secuencia: "loading" (spinner) -> breve "¡Operación exitosa!" del
          overlay genérico -> recién ahí aparece el ticket con el desglose
          (showCreditTicket, activado con un pequeño delay desde el estado). */}
      <TransactionStatusOverlay
        status={creditOverlayStatus}
        loadingLabel="Procesando crédito…"
        successLabel="¡Operación exitosa!"
      />

      {/* Renovación con primer cobro (firstCharge): en vez del overlay
          genérico, un proceso de 2 pasos (crédito + primer pago) con el mismo
          diseño que RenewalFlowModal; al terminar se muestra el ticket. */}
      <FirstChargeFlowModal {...firstChargeFlow} />

      {creditSuccessTicket && (
        <CreditSuccessTicket
          open={showCreditTicket}
          customerName={creditSuccessTicket.customerName}
          creditAmount={creditSuccessTicket.creditAmount}
          chargeAmount={creditSuccessTicket.chargeAmount}
          chargeFrequencyLabel={creditSuccessTicket.chargeFrequencyLabel}
          chargePeriods={creditSuccessTicket.chargePeriods}
          createdAt={creditSuccessTicket.createdAt}
          status={creditSuccessTicket.status}
          firstChargeAmount={creditSuccessTicket.firstChargeAmount}
          canSendWhatsApp={canSendCreditWhatsApp}
          onSendWhatsApp={handleSendCreditWhatsApp}
          onContinue={handleContinueAfterCredit}
        />
      )}

      {/* Flotante junto al botón de guardar — así no depende de que el
          usuario esté hasta arriba del formulario para verlo. */}
      <Snackbar
        open={Boolean(creditError)}
        onClose={clearCreditError}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: `${BOTTOM_NAV_HEIGHT + 88}px !important`, px: 2 }}
      >
        <Alert
          severity="error"
          onClose={clearCreditError}
          sx={{ borderRadius: 3, boxShadow: 4, width: '100%' }}
        >
          {creditError}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
};

export default CreditsCustomerContainer;