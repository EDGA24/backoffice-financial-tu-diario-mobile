import React from 'react';
import { Backdrop, Box, CircularProgress, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

export type TransactionOverlayStatus = 'loading' | 'success' | null;

export interface TransactionStatusOverlayProps {
  status: TransactionOverlayStatus;
  loadingLabel?: string;
  loadingSubLabel?: string;
  successLabel?: string;
}

// Bloquea toda la pantalla mientras se procesa la operación (para que no le
// piquen "Aceptar" varias veces) y luego avisa que se completó correctamente.
const TransactionStatusOverlay: React.FC<TransactionStatusOverlayProps> = ({
  status,
  loadingLabel = 'Procesando movimiento…',
  loadingSubLabel = 'No cierres ni presiones de nuevo',
  successLabel = '¡Movimiento exitoso!',
}) => {
  return (
    <Backdrop
      open={status !== null}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 10,
        color: '#fff',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {status === 'loading' && (
        <>
          <CircularProgress color="inherit" size={44} />
          <Box sx={{ textAlign: 'center', px: 3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{loadingLabel}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              {loadingSubLabel}
            </Typography>
          </Box>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircleRoundedIcon sx={{ fontSize: 56, color: 'success.light' }} />
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{successLabel}</Typography>
        </>
      )}
    </Backdrop>
  );
};

export default TransactionStatusOverlay;
