import React from 'react';
import { Box, Typography } from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import MobileStatCard from '@/components/molecules/mobile/MobileStatCard/MobileStatCard';

export interface ResumeTodayStats {
  totalClientes: number;
  prestamosActivos: number;
  cartera: number;
  alertas: number;
}

export interface ResumeTodayProps {
  stats: ResumeTodayStats;
  title?: string;
}

const ResumeToday: React.FC<ResumeTodayProps> = ({ stats, title = 'Resumen de hoy' }) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography sx={{ px: 2.5, mb: 1, fontWeight: 700, fontSize: 15 }}>{title}</Typography>

      <Box sx={{ display: 'flex', gap: 1.5, px: 2.5, pb: 0.5, overflowX: 'auto' }}>
        <MobileStatCard
          icon={PeopleAltRoundedIcon}
          value={stats.totalClientes}
          label="Total Clientes"
          color="primary.main"
          bg="rgba(30,60,114,0.1)"
        />
        <MobileStatCard
          icon={AccountBalanceRoundedIcon}
          value={stats.prestamosActivos}
          label="Préstamos Activos"
          color="secondary.main"
          bg="rgba(42,82,152,0.1)"
        />
        <MobileStatCard
          icon={CreditCardRoundedIcon}
          value={stats.cartera}
          label="Cartera"
          color="success.main"
          bg="rgba(46,125,50,0.12)"
        />
        <MobileStatCard
          icon={WarningAmberRoundedIcon}
          value={stats.alertas}
          label="Alertas"
          color="error.main"
          bg="rgba(211,47,47,0.1)"
        />
      </Box>
    </Box>
  );
};

export default ResumeToday;