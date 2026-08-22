import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';

export interface FilterAccordionSectionProps {
  title: string;
  summary: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const FilterAccordionSection: React.FC<FilterAccordionSectionProps> = ({
  title,
  summary,
  defaultOpen = false,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 2 }}>
      <Box
        onClick={() => setOpen((o) => !o)}
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{title}</Typography>
          {!open && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {summary}
            </Typography>
          )}
        </Box>
        <ExpandMoreRoundedIcon
          sx={{
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
            color: 'text.secondary',
          }}
        />
      </Box>
      {open && <Box sx={{ mt: 2 }}>{children}</Box>}
    </Box>
  );
};

export default FilterAccordionSection;