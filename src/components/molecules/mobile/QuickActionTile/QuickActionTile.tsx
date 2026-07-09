import React from 'react';
import { ButtonBase, Typography, Box } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

export interface QuickActionTileProps {
  icon: SvgIconComponent;
  label: string;
  color: string; 
  filled?: boolean;
  onClick?: () => void;
}

const QuickActionTile: React.FC<QuickActionTileProps> = ({
  icon: Icon,
  label,
  color,
  filled = false,
  onClick,
}) => {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.75,
        py: 2.25,
        borderRadius: 3,
        backgroundColor: filled ? color : 'background.paper',
        border: filled ? 'none' : '1px solid',
        borderColor: 'divider',
        transition: 'transform 0.1s ease',
        '&:active': { transform: 'scale(0.97)' },
      }}
    >
      <Icon sx={{ color: filled ? '#fff' : color, fontSize: 22 }} />
      <Box sx={{ px: 0.5 }}>
        <Typography
          variant="caption"
          sx={{
            color: filled ? '#fff' : 'text.primary',
            fontWeight: 700,
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography>
      </Box>
    </ButtonBase>
  );
};

export default QuickActionTile;