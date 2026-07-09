import type { LoanStatus } from '@/components/atoms/StatusChip/StatusChip';
import type { NavKey } from '@/components/organisms/mobile/BottomNavigation/BottomNavigation';
import { useState } from 'react'


export interface LoanSummary {
  initials: string;
  name: string;
  phone: string;
  date: string;
  amount: string;
  status: LoanStatus;
}

const MOCK_LOANS: LoanSummary[] = [
  { initials: 'EM', name: 'Erick Manuel', phone: '961 123 4567', date: '25/03/26', amount: '$3,000.00', status: 'paid' },
  { initials: 'EM', name: 'Erick Manuel', phone: '961 123 4567', date: '25/03/26', amount: '$3,000.00', status: 'restructured' },
  { initials: 'MJ', name: 'María José', phone: '961 987 6543', date: '18/03/26', amount: '$1,500.00', status: 'late' },
  { initials: 'MJ', name: 'María José', phone: '961 987 6543', date: '18/03/26', amount: '$1,500.00', status: 'late' },
  { initials: 'MJ', name: 'María José', phone: '961 987 6543', date: '18/03/26', amount: '$1,500.00', status: 'late' },
  { initials: 'MJ', name: 'María José', phone: '961 987 6543', date: '18/03/26', amount: '$1,500.00', status: 'late' },
  
];

const useCreditsDashboardState = () => {
    const [activeNav, setActiveNav] = useState<NavKey>('credits');
      const loans = MOCK_LOANS;

    const handleNavChange = (key: NavKey) => setActiveNav(key);

    return {
        activeNav,
        handleNavChange,
        loans

      
    };
};

export default useCreditsDashboardState;