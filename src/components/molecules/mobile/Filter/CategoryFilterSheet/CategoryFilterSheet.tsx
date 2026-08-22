import { useState, useEffect } from 'react';
import { Badge, Box, Button, Chip, Typography } from '@mui/material';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import { isEqual } from 'lodash';
import FilterBottomSheet from '../FilterBottomSheet/FilterBottomSheet';

export interface CategoryFilterItem {
  category: string;
  value: string;
}

export interface CategoryFilterSheetProps {
  options: Record<string, string[]>;
  currentFilters: CategoryFilterItem[];
  onApply: (filters: CategoryFilterItem[]) => void;
  categoryLabels?: Record<string, string>;
}

const CategoryFilterSheet: React.FC<CategoryFilterSheetProps> = ({
  options,
  currentFilters,
  onApply,
  categoryLabels = {},
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CategoryFilterItem[]>(currentFilters);

  useEffect(() => {
    setDraft(currentFilters);
  }, [currentFilters]);

  const hayFiltroActivo = currentFilters.length > 0;

  const handleOpen = () => {
    setDraft(currentFilters);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const toggle = (category: string, value: string) => {
    setDraft((prev) =>
      prev.some((f) => isEqual(f.category, category) && isEqual(f.value, value))
        ? prev.filter((f) => !(isEqual(f.category, category) && isEqual(f.value, value)))
        : [...prev, { category, value }]
    );
  };

  const isSelected = (category: string, value: string) =>
    draft.some((f) => isEqual(f.category, category) && isEqual(f.value, value));

  const handleAplicar = () => {
    onApply(draft);
    handleClose();
  };
  const handleLimpiar = () => {
    setDraft([]);
    onApply([]);
    handleClose();
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        startIcon={
          <Badge color="primary" variant="dot" invisible={!hayFiltroActivo}>
            <TuneRoundedIcon fontSize="small" />
          </Badge>
        }
        sx={{
          textTransform: 'none',
          fontWeight: 700,
          fontSize: 13.5,
          color: hayFiltroActivo ? 'primary.main' : 'text.primary',
          border: '1px solid',
          borderColor: hayFiltroActivo ? 'primary.main' : 'divider',
          borderRadius: 999,
          px: 2,
          py: 0.75,
          minHeight: 40,
          whiteSpace: 'nowrap',
          backgroundColor: hayFiltroActivo ? 'primary.50' : 'transparent',
        }}
      >
        Filtros
      </Button>

      <FilterBottomSheet open={open} onClose={handleClose} onClear={handleLimpiar} onApply={handleAplicar}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {Object.entries(options).map(([category, values]) => (
            <Box key={category}>
              <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1.25 }}>
                {categoryLabels[category] ?? category}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {values.map((value) => (
                  <Chip
                    key={value}
                    label={value}
                    clickable
                    onClick={() => toggle(category, value)}
                    color={isSelected(category, value) ? 'primary' : 'default'}
                    variant={isSelected(category, value) ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 600, borderRadius: 999 }}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </FilterBottomSheet>
    </>
  );
};

export default CategoryFilterSheet;