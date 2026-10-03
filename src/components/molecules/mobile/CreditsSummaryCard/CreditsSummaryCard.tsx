import React, { useState } from 'react';
import { Box, Divider, Typography, IconButton, Dialog, DialogContent, DialogActions, Button, Stack } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';

export interface CreditsSummaryCardProps {
  totalPorCobrar: number;
  totalCobrado: number;
  pendientePorCobrar: number;
  totalOtros: number;
}

interface SummaryBarItem {
  label: string;
  amount: number;
  color: string;
}

interface SummaryDetailItem extends SummaryBarItem {
  description: string;
  icon: React.ReactNode;
}

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

const CreditsSummaryCard: React.FC<CreditsSummaryCardProps> = ({
  totalPorCobrar,
  totalCobrado,
  pendientePorCobrar,
  totalOtros,
}) => {
  const [detailOpen, setDetailOpen] = useState(false);

  // Los primeros 3 son los que se muestran en la barra; "Otros" solo vive en
  // el modal de detalle para no agregar una columna más al diseño.
  const items: SummaryBarItem[] = [
    { label: 'Por cobrar', amount: totalPorCobrar, color: 'text.primary' },
    { label: 'Cobrado', amount: totalCobrado, color: 'success.main' },
    { label: 'Pendiente', amount: pendientePorCobrar, color: 'warning.main' },
  ];

  const detailItems: SummaryDetailItem[] = [
    {
      label: 'Por cobrar',
      amount: totalPorCobrar,
      color: 'text.primary',
      description: 'Monto total que corresponde cobrar en el periodo, según la cuota fija de cada crédito.',
      icon: <ReceiptLongRoundedIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: 'Cobrado',
      amount: totalCobrado,
      color: 'success.main',
      description: 'Pagos aprobados en el periodo que corresponden a la cuota regular del crédito.',
      icon: <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: 'Pendiente',
      amount: pendientePorCobrar,
      color: 'warning.main',
      description: 'Diferencia entre lo que corresponde cobrar y lo ya cobrado.',
      icon: <HourglassBottomRoundedIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: 'Otros',
      amount: totalOtros,
      color: 'info.main',
      description: 'Pagos aprobados en el periodo que no son cuota regular (ej. abonos a capital, moratorios) o que no tienen categoría asignada. No se incluyen en "Cobrado" ni en "Pendiente".',
      icon: <SwapHorizRoundedIcon sx={{ fontSize: 18 }} />,
    },
  ];

  return (
    <Box sx={{ mx: 2.5, mt: 2 }}>
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'stretch',
          borderRadius: 3,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          py: 1.25,
        }}
      >
        <IconButton
          size="small"
          onClick={() => setDetailOpen(true)}
          aria-label="Ver detalle de totales"
          sx={{ position: 'absolute', top: 2, right: 2, p: 0.25 }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
        </IconButton>

        {items.map((item, index) => (
          <React.Fragment key={item.label}>
            {index > 0 && <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />}
            <Box sx={{ flex: 1, textAlign: 'center', px: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 15, color: item.color, lineHeight: 1.2 }}>
                {formatAmount(item.amount)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10.5 }}>
                {item.label}
              </Typography>
            </Box>
          </React.Fragment>
        ))}
      </Box>

      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
      >
        <Box sx={{ px: 3, pt: 2.5, pb: 2, bgcolor: 'action.hover' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  flexShrink: 0,
                }}
              >
                <InsightsRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 17, lineHeight: 1.2 }}>
                  Detalle de totales
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Resumen del periodo vigente
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setDetailOpen(false)} sx={{ mt: -0.5, mr: -0.5 }}>
              <CloseRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Stack divider={<Divider />} spacing={2}>
            {detailItems.map((item) => (
              <Box key={item.label} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'action.hover',
                    color: item.color,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{item.label}</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: 14, color: item.color, whiteSpace: 'nowrap' }}>
                      {formatAmount(item.amount)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 0 }}>
          <Button fullWidth variant="outlined" onClick={() => setDetailOpen(false)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreditsSummaryCard;
