// components/molecules/mobile/FormActionBar/FormActionBar.tsx
import React from 'react';
import { Box } from '@mui/material';

import { CustomButton } from '@/components/atoms/Button/Button';

export const BOTTOM_NAV_HEIGHT = 56;

export interface FormActionBarProps {
  label: string;
  loadingLabel?: string;
  isLoading?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const FormActionBar: React.FC<FormActionBarProps> = ({
  label,
  loadingLabel = 'Guardando...',
  isLoading = false,
  onClick,
  disabled,
}) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: BOTTOM_NAV_HEIGHT,
        left: 0,
        right: 0,
        px: 2.5,
        py: 2,
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.appBar - 1,
      }}
    >
      <CustomButton isLoading={isLoading} onClick={onClick} disabled={disabled} fullWidth>
        {isLoading ? loadingLabel : label}
      </CustomButton>
    </Box>
  );
};

export default FormActionBar;