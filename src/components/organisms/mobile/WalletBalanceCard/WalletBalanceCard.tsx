import React from 'react';
import { Box, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import WalletActionButton from '@/components/molecules/mobile/WalletActionButton/WalletActionButton';
import { PENDING_APPROVAL_YELLOW } from '@/shared/constants/statusColors';

export interface WalletAction {
  icon: SvgIconComponent;
  label: string;
  onClick?: () => void;
}

export interface WalletBalanceCardProps {
  balanceLabel?: string;
  balance: string;
  accountNumber?: string;
  pendingIncomes?: string;
  pendingExpenses?: string;
  changeAmount?: string;
  changePercent?: string;
  changePeriodLabel?: string;
  actions: WalletAction[];
}

const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
  balanceLabel = 'Disponible',
  balance,
  accountNumber,
  pendingIncomes,
  pendingExpenses,
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500 }}>
          {balanceLabel}
        </Typography>
        {accountNumber && (
          <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 500 }}>
            Cuenta {accountNumber}
          </Typography>
        )}
      </Box>

      <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 32, mt: 0.5, lineHeight: 1.1 }}>
        {balance}
      </Typography>

      {(pendingIncomes || pendingExpenses) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.25, flexWrap: 'wrap' }}>
          <ScheduleRoundedIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }} />
          <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 10.5, fontWeight: 600, mr: 0.25 }}>
            Pendiente
          </Typography>

          {pendingIncomes && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
                pl: 0.6,
                pr: 1,
                py: 0.4,
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.14)',
              }}
            >
              <ArrowUpwardRoundedIcon sx={{ fontSize: 13, color: PENDING_APPROVAL_YELLOW }} />
              <Typography sx={{ color: PENDING_APPROVAL_YELLOW, fontSize: 12, fontWeight: 700 }}>
                {pendingIncomes}
              </Typography>
            </Box>
          )}

          {pendingExpenses && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
                pl: 0.6,
                pr: 1,
                py: 0.4,
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.14)',
              }}
            >
              <ArrowDownwardRoundedIcon sx={{ fontSize: 13, color: PENDING_APPROVAL_YELLOW }} />
              <Typography sx={{ color: PENDING_APPROVAL_YELLOW, fontSize: 12, fontWeight: 700 }}>
                {pendingExpenses}
              </Typography>
            </Box>
          )}
        </Box>
      )}

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

      {actions.length > 0 && (
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
      )}
    </Box>
  );
};

export default WalletBalanceCard;