import React from 'react';
import { Alert, Box, Snackbar, Typography } from '@mui/material';
import FormScreenHeader from '@/components/organisms/mobile/FormscreenHeader/FormscreenHeader';
import ChangePasswordForm from '@/components/molecules/mobile/Forms/ChangePasswordForm/ChangePasswordForm';
import FormActionBar, { BOTTOM_NAV_HEIGHT } from '@/components/molecules/mobile/FormActionBar/FormActionBar';
import TransactionStatusOverlay from '@/components/molecules/mobile/TransactionStatusOverlay/TransactionStatusOverlay';

import { useChangePasswordContainerState } from './state/useChangePasswordContainerState';

const ChangePasswordContainer = () => {
  const {
    control,
    errors,
    loadingSave,
    overlayStatus,
    serverError,
    clearServerError,
    handleOnSave,
    handleBack,
  } = useChangePasswordContainerState();

  return (
    <React.Fragment>
      <FormScreenHeader title="Cambiar contraseña" onBack={handleBack} />

      <Box sx={{ px: 2.5, pt: 2.5, pb: 16, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="caption" color="text.secondary">
          Todos los campos son obligatorios
        </Typography>

        <ChangePasswordForm control={control} errors={errors} />
      </Box>

      <FormActionBar
        label="Guardar cambios"
        loadingLabel="Guardando..."
        isLoading={loadingSave}
        onClick={handleOnSave}
      />

      <TransactionStatusOverlay
        status={overlayStatus}
        loadingLabel="Actualizando contraseña…"
        successLabel="¡Contraseña actualizada!"
      />

      {/* Flotante junto al botón de guardar — mismo criterio que
          CreditsCustomerContainer para errores del servidor. */}
      <Snackbar
        open={Boolean(serverError)}
        onClose={clearServerError}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: `${BOTTOM_NAV_HEIGHT + 88}px !important`, px: 2 }}
      >
        <Alert
          severity="error"
          onClose={clearServerError}
          sx={{ borderRadius: 3, boxShadow: 4, width: '100%' }}
        >
          {serverError}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
};

export default ChangePasswordContainer;
