import React from 'react';
import { ButtonBase, Typography, Box } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

export interface QuickActionTileProps {
  icon: SvgIconComponent;
  label: string;
  color: string;
  filled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
}

const QuickActionTile: React.FC<QuickActionTileProps> = ({
  icon: Icon,
  label,
  color,
  filled = false,
  fullWidth = false,
  onClick,
}) => {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: fullWidth ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: fullWidth ? 'flex-start' : 'center',
        gap: fullWidth ? 1.5 : 0.75,
        py: fullWidth ? 2 : 2.25,
        px: fullWidth ? 2.5 : 0,
        width: '100%',
        borderRadius: 3,
        backgroundColor: filled ? color : 'background.paper',
        border: filled ? 'none' : '1px solid',
        borderColor: 'divider',
        transition: 'transform 0.1s ease',
        '&:active': { transform: 'scale(0.97)' },
      }}
    >
      <Icon sx={{ color: filled ? '#fff' : color, fontSize: fullWidth ? 24 : 22 }} />
      <Box sx={{ px: fullWidth ? 0 : 0.5 }}>
        <Typography
          variant={fullWidth ? 'body2' : 'caption'}
          sx={{
            color: filled ? '#fff' : 'text.primary',
            fontWeight: 700,
            textAlign: fullWidth ? 'left' : 'center',
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