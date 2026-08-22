import React, { useState } from 'react';
import { Box, Popover, Typography } from '@mui/material';

export interface ColorLegendItem {
  color: string;
  label: string;
  description: string;
}

export interface ColorLegendProps {
  items: ColorLegendItem[];
}

const ColorLegend: React.FC<ColorLegendProps> = ({ items }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activeItem, setActiveItem] = useState<ColorLegendItem | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>, item: ColorLegendItem) => {
    setAnchorEl(event.currentTarget);
    setActiveItem(item);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setActiveItem(null);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {items.map((item) => (
        <Box
          key={item.label}
          component="button"
          type="button"
          onClick={(e) => handleOpen(e, item)}
          aria-label={`Significado del color: ${item.label}`}
          sx={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            backgroundColor: item.color,
            border: '1px solid rgba(0,0,0,0.15)',
            p: 0,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        />
      ))}

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {activeItem && (
          <Box sx={{ p: 1.5, maxWidth: 220, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                mt: 0.25,
                borderRadius: '50%',
                backgroundColor: activeItem.color,
                flexShrink: 0,
              }}
            />
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 0.25 }}>{activeItem.label}</Typography>
              <Typography variant="caption" color="text.secondary">
                {activeItem.description}
              </Typography>
            </Box>
          </Box>
        )}
      </Popover>
    </Box>
  );
};

export default ColorLegend;
