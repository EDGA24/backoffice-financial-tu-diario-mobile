import { useState } from 'react';
import { type NavKey } from '@/components/organisms/mobile/BottomNavigation/BottomNavigation';
import { type LoanStatus } from '@/components/atoms/StatusChip/StatusChip';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import type { QuickActionItem } from '@/components/molecules/mobile/QuickActionSection/QuickActionsSection';


export interface LoanSummary {
  initials: string;
  name: string;
  phone: string;
  date: string;
  amount: string;
  status: LoanStatus;
}

const quickActions: QuickActionItem[] = [
  { icon: PeopleAltRoundedIcon, label: 'Nuevo Cliente', color: '#1e3c72', filled: true },
  { icon: AccountBalanceRoundedIcon, label: 'Nuevo Préstamo', color: '#9c27b0', filled: true },
  { icon: CreditCardRoundedIcon, label: 'Gestionar Cartera', color: '#2a5298' },
  { icon: VisibilityRoundedIcon, label: 'Historial Clientes', color: '#2a5298' },
];


const MOCK_LOANS: LoanSummary[] = [
  { initials: 'EM', name: 'Erick Manuel', phone: '961 123 4567', date: '25/03/26', amount: '$3,000.00', status: 'paid' },
  { initials: 'EM', name: 'Erick Manuel', phone: '961 123 4567', date: '25/03/26', amount: '$3,000.00', status: 'restructured' },
  { initials: 'MJ', name: 'María José', phone: '961 987 6543', date: '18/03/26', amount: '$1,500.00', status: 'late' },
];

const useHomeDashboardState = () => {
  const [activeNav, setActiveNav] = useState<NavKey>('home');


  const stats = {
    totalClientes: 1,
    prestamosActivos: 1,
    cartera: 1,
    alertas: 1,
  };

  const alertText = '1 pago vencido y 1 cliente moroso requieren atención.';

  const loans = MOCK_LOANS;

  const handleNavChange = (key: NavKey) => setActiveNav(key);

  return {
    activeNav,
    handleNavChange,
    stats,
    alertText,
    loans,
    userName: 'Erick Manuel',
    userInitials: 'EM',
    quickActions
  };
};

export default useHomeDashboardState;