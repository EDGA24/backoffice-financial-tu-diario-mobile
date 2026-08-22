import { Box, Button, CircularProgress, Divider, Drawer, IconButton, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export interface FilterBottomSheetProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  onClear: () => void;
  onApply: () => void;
  applyLabel?: string;
  clearLabel?: string;
  applyLoading?: boolean;
  children: React.ReactNode;
}

const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  open,
  title = 'Filtrar',
  onClose,
  onClear,
  onApply,
  applyLabel = 'Mostrar resultados',
  clearLabel = 'Limpiar',
  applyLoading = false,
  children,
}) => {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '85vh',
          },
        },
      }}
    >
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: 22 }}>{title}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        {children}
      </Box>

      <Divider />

      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, px: 3, py: 2.5 }}>
        <Button
          fullWidth
          variant="text"
          onClick={onClear}
          disabled={applyLoading}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 999,
            py: 1.25,
            backgroundColor: 'action.hover',
            color: 'text.primary',
          }}
        >
          {clearLabel}
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={onApply}
          disabled={applyLoading}
          startIcon={applyLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 999, py: 1.25 }}
        >
          {applyLabel}
        </Button>
      </Box>
    </Drawer>
  );
};

export default FilterBottomSheet;