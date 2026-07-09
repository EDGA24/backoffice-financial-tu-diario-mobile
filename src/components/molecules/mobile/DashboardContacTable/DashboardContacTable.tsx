import { Box, Typography, ButtonBase } from '@mui/material';

import type { LoanStatus } from '@/components/atoms/StatusChip/StatusChip';
import ContactPaymentList from '../ListContactPayment/ContactPaymentList';

export interface LoanSummary {
  initials: string;
  name: string;
  phone: string;
  date: string;
  amount: string;
  status: LoanStatus;
}

export interface DashboardContactTableProps {
  loans: LoanSummary[];
  title?: string;
  actionLabel?: string;
  onActionClick?: () => void;

  onPagar?: (loan: LoanSummary, index: number) => Promise<void> | void;

  esPagado?: (loan: LoanSummary) => boolean;
}

const DashboardContactTable: React.FC<DashboardContactTableProps> = ({
  loans,
  title = 'Últimos préstamos',
  actionLabel = 'Ver todos',
  onActionClick,
  onPagar,
  esPagado,
}) => {
  return (
    <Box sx={{ mt: 3, px: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{title}</Typography>
        <ButtonBase onClick={onActionClick}>
          <Typography sx={{ fontWeight: 700, fontSize: 12, color: 'secondary.main' }}>
            {actionLabel}
          </Typography>
        </ButtonBase>
      </Box>

      <ContactPaymentList loans={loans} onPagar={onPagar} esPagado={esPagado} />
    </Box>
  );
};

export default DashboardContactTable;