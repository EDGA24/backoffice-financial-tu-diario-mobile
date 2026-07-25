import { Box, IconButton,Typography } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

function getVisiblePages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) pages.push(p);
  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        mt: 2,
        mb: 1,
      }}
    >
      <IconButton
        onClick={onPrevious}
        disabled={!canGoPrevious}
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          '&.Mui-disabled': { opacity: 0.4 },
        }}
      >
        <ChevronLeftRoundedIcon />
      </IconButton>

      {visiblePages.map((p, idx) =>
        p === 'ellipsis' ? (
          <Typography key={`ellipsis-${idx}`} sx={{ px: 0.5, color: 'text.secondary' }}>
            …
          </Typography>
        ) : (
          <Box
            key={p}
            component="button"
            onClick={() => onPageChange(p)}
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
              bgcolor: p === currentPage ? 'primary.main' : 'background.paper',
              color: p === currentPage ? 'primary.contrastText' : 'text.primary',
              boxShadow: p === currentPage ? 'none' : 'inset 0 0 0 1px rgba(0,0,0,0.08)',
            }}
          >
            {p}
          </Box>
        )
      )}

      <IconButton
        onClick={onNext}
        disabled={!canGoNext}
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          '&.Mui-disabled': { opacity: 0.4 },
        }}
      >
        <ChevronRightRoundedIcon />
      </IconButton>
    </Box>
  );
}