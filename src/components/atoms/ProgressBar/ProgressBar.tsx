import { Box, LinearProgress, Typography } from '@mui/material';

export interface ProgressBarProps {
  value: number; 
  label?: string;
  showPercentage?: boolean;
}

function getColor(value: number): string {
  if (value >= 100) return 'success.main';
  if (value >= 60) return 'primary.main';
  if (value >= 30) return 'warning.main';
  return 'error.main';
}

export default function ProgressBar({ value, label, showPercentage = true }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const color = getColor(clamped);

  return (
    <Box sx={{ width: '100%' }}>
      {(label || showPercentage) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          {label && (
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              {label}
            </Typography>
          )}
          {showPercentage && (
            <Typography variant="caption" sx={{ fontWeight: 700, color }}>
              {Math.round(clamped)}%
            </Typography>
          )}
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={clamped}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            bgcolor: color,
            transition: 'transform 0.6s ease, background-color 0.3s ease',
          },
        }}
      />
    </Box>
  );
}