import React from 'react';
import { Box, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import WalletActionButton from '@/components/molecules/mobile/WalletActionButton/WalletActionButton';

export interface WalletAction {
  icon: SvgIconComponent;
  label: string;
  onClick?: () => void;
}

export interface WalletBalanceCardProps {
  balanceLabel?: string;
  balance: string; 
  changeAmount?: string; 
  changePercent?: string; 
  changePeriodLabel?: string;
  actions: WalletAction[];
}

const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
  balanceLabel = 'Disponible',
  balance,
  changeAmount,
  changePercent,
  changePeriodLabel = 'este mes',
  actions,
}) => {
  return (
    <Box
      sx={{
        mx: 2,
        mt: 2,
        p: 2.5,
        borderRadius: 4,
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
      }}
    >
      <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500 }}>
        {balanceLabel}
      </Typography>

      <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 32, mt: 0.5, lineHeight: 1.1 }}>
        {balance}
      </Typography>

      {(changeAmount || changePercent) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          {changeAmount && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <ArrowUpwardRoundedIcon sx={{ color: '#8ff0a4', fontSize: 14 }} />
              <Typography sx={{ color: '#8ff0a4', fontWeight: 700, fontSize: 12.5 }}>
                {changeAmount}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12.5, ml: 0.25 }}>
                {changePeriodLabel}
              </Typography>
            </Box>
          )}
          {changePercent && (
            <Box
              sx={{
                ml: 'auto',
                px: 1,
                py: 0.25,
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.15)',
              }}
            >
              <Typography sx={{ color: '#fff', fontSize: 11.5, fontWeight: 700 }}>
                {changePercent} anual
              </Typography>
            </Box>
          )}
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 3,
          px: 1,
        }}
      >
        {actions.map((action) => (
          <WalletActionButton key={action.label} {...action} />
        ))}
      </Box>
    </Box>
  );
};

export default WalletBalanceCard;