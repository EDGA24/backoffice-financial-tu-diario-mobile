import React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import CalendarViewWeekRoundedIcon from '@mui/icons-material/CalendarViewWeekRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';

export interface ResumeTodayStats {
  creditosDiariosActivos: number;
  creditosSemanalesActivos: number;
  clientesTotal: number;
}

export interface ResumeTodayProps {
  stats: ResumeTodayStats;
  title?: string;
}

interface ResumeStatItem {
  icon: SvgIconComponent;
  value: number;
  label: string;
  color: string;
}

const ResumeToday: React.FC<ResumeTodayProps> = ({ stats, title = 'Resumen de hoy' }) => {
  const items: ResumeStatItem[] = [
    {
      icon: TodayRoundedIcon,
      value: stats.creditosDiariosActivos,
      label: 'Créditos diarios',
      color: 'primary.main',
    },
    {
      icon: CalendarViewWeekRoundedIcon,
      value: stats.creditosSemanalesActivos,
      label: 'Créditos semanales',
      color: 'secondary.main',
    },
    {
      icon: GroupsRoundedIcon,
      value: stats.clientesTotal,
      label: 'Clientes',
      color: 'success.main',
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
              <Typography sx={{ fontWeight: 800, fontSize: 20, lineHeight: 1 }}>{item.value}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                {item.label}
              </Typography>
            </Box>
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default ResumeToday;