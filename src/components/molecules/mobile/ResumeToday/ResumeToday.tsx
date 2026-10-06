import React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import AddCardRoundedIcon from '@mui/icons-material/AddCardRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';

// Conteo de una métrica separado por frecuencia de cobro
export interface ResumeFrequencyCount {
  daily: number;
  weekly: number;
}

// Resumen de la semana (getCreditSummary) — solo conteos, sin montos
export interface ResumeTodayStats {
  collected: ResumeFrequencyCount; // pagos registrados
  new: ResumeFrequencyCount;       // créditos nuevos
  renewed: ResumeFrequencyCount;   // renovaciones
}

export interface ResumeTodayProps {
  stats: ResumeTodayStats;
  title?: string;
}

interface ResumeStatItem {
  icon: SvgIconComponent;
  value: ResumeFrequencyCount;
  label: string;
  color: string;
}

// Renglones del desglose — mismos colores que las acciones rápidas
// "Créditos Diario" / "Créditos Semanal" del home.
const FREQUENCY_ROWS: { key: keyof ResumeFrequencyCount; label: string; color: string }[] = [
  { key: 'daily', label: 'Diario', color: '#ef6c00' },
  { key: 'weekly', label: 'Semanal', color: '#00838f' },
];

const ResumeToday: React.FC<ResumeTodayProps> = ({ stats, title = 'Resumen de la semana' }) => {
  const items: ResumeStatItem[] = [
    {
      icon: PaymentsRoundedIcon,
      value: stats.collected,
      label: 'Cobrados',
      color: 'success.main',
    },
    {
      icon: AddCardRoundedIcon,
      value: stats.new,
      label: 'Nuevos',
      color: 'primary.main',
    },
    {
      icon: AutorenewRoundedIcon,
      value: stats.renewed,
      label: 'Renovaciones',
      color: 'secondary.main',
    },
  ];

  return (
    <Box sx={{ mt: 3, mx: 2.5 }}>
      <Typography sx={{ mb: 1, fontWeight: 700, fontSize: 15 }}>{title}</Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          borderRadius: 3,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          py: 2,
        }}
      >
        {items.map((item, index) => (
          <React.Fragment key={item.label}>
            {index > 0 && <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                textAlign: 'center',
              }}
            >
              <item.icon sx={{ color: item.color, fontSize: 22 }} />
              <Typography sx={{ fontWeight: 800, fontSize: 20, lineHeight: 1 }}>
                {item.value.daily + item.value.weekly}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                {item.label}
              </Typography>
              {/* Desglose por frecuencia de cobro */}
              <Box
                sx={{
                  mt: 0.75,
                  pt: 0.75,
                  width: '100%',
                  borderTop: '1px dashed',
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.25,
                }}
              >
                {FREQUENCY_ROWS.map((row) => (
                  <Box key={row.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 0.5 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: row.color, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 10.5, color: 'text.secondary', flex: 1, textAlign: 'left' }}>
                      {row.label}
                    </Typography>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.primary' }}>
                      {item.value[row.key]}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default ResumeToday;
