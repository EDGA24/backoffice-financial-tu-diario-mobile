import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import Avatar from '@/components/atoms/Avatar/Avatar';
import StatusChip, { type LoanStatus } from '@/components/atoms/StatusChip/StatusChip';
import { CustomButton } from '@/components/atoms/Button/Button';

export interface LoanListItemProps {
  initials: string;
  name: string;
  phone: string;
  date: string;
  amount: string;
  status: LoanStatus;
  pagado?: boolean;
  procesandoPago?: boolean;
  onPagar?: () => void;
}

const LoanListItem: React.FC<LoanListItemProps> = ({
  initials,
  name,
  phone,
  date,
  amount,
  status,
  pagado = false,
  procesandoPago = false,
  onPagar,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1.5,
        px: 0.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Avatar size="medium">{initials}</Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 13.5 }} noWrap>
          {name}
        </Typography>

        <Stack direction="row" spacing={1.5} sx={{ mt: 0.25 }}>
          <Stack direction="row" spacing={0.5} sx={{
            alignItems: "center"
          }}>
            <PhoneRoundedIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{
              color: "text.secondary"
            }}>
              {phone}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} sx={{
            alignItems: "center"
          }}>
            <CalendarTodayRoundedIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{
              color: "text.secondary"
            }}>
              {date}
            </Typography>
          </Stack>
        </Stack>

        <Box sx={{ mt: 0.75 }}>
          <StatusChip status={status} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <CustomButton
            size='small'
            isLoading={procesandoPago}
            disabled={pagado || procesandoPago}
            onClick={onPagar}
            sx={{ borderRadius: '8px' }}
          >
            {pagado ? 'Pagado' : 'Pagar'}
          </CustomButton>
        </Box>

      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: 14, color: 'primary.main', flexShrink: 0 }}>
        {amount}
      </Typography>
    </Box>
  );
};

export default LoanListItem;