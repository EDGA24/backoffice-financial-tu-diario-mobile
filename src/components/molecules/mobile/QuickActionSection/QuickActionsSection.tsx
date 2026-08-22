import React from 'react';
import { Box, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import QuickActionTile from '@/components/molecules/mobile/QuickActionTile/QuickActionTile';

export interface QuickActionItem {
  icon: SvgIconComponent;
  label: string;
  color: string;
  filled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
}

export interface QuickActionsSectionProps {
  actions: QuickActionItem[];
  title?: string;
}

const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  actions,
  title = 'Acciones rápidas',
}) => {
  return (
    <Box sx={{ mt: 3, px: 2.5 }}>
      <Typography sx={{ mb: 1, fontWeight: 700, fontSize: 15 }}>{title}</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        {actions.map((action) => (
          <Box key={action.label} sx={{ gridColumn: action.fullWidth ? '1 / -1' : 'auto' }}>
            <QuickActionTile {...action} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default QuickActionsSection;