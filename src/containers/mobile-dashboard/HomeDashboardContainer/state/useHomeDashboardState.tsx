import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type NavKey } from '@/components/organisms/mobile/BottomNavigation/BottomNavigation';
import { type LoanStatus } from '@/components/atoms/StatusChip/StatusChip';
import RequestQuoteRoundedIcon from '@mui/icons-material/RequestQuoteRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import CalendarViewWeekRoundedIcon from '@mui/icons-material/CalendarViewWeekRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import type { QuickActionItem } from '@/components/molecules/mobile/QuickActionSection/QuickActionsSection';
import { NAV_ROUTES } from '@/shared/constants/navRoutes';
import { ChargeFrequencyEnum } from '@/shared/constants/ChargeFrequencyEnum';


export interface LoanSummary {
  initials: string;
  name: string;
  phone: string;
  date: string;
  amount: string;
  status: LoanStatus;
}

const useHomeDashboardState = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState<NavKey>('home');

  const goToCreditsFilteredByFrequency = (chargeFrequency: ChargeFrequencyEnum) => {
    navigate(NAV_ROUTES.loans, { state: { chargeFrequency: [chargeFrequency] } });
  };

  const quickActions: QuickActionItem[] = [
    { icon: RequestQuoteRoundedIcon, label: 'Nuevo Credito', color: '#9c27b0', filled: true, onClick: () => navigate(NAV_ROUTES.newcredits) },
    { icon: CreditCardRoundedIcon, label: 'Gestionar Cartera', color: '#2a5298', onClick: () => navigate(NAV_ROUTES.loans) },
    { icon: TodayRoundedIcon, label: 'Créditos Diario', color: '#ef6c00', onClick: () => goToCreditsFilteredByFrequency(ChargeFrequencyEnum.DAILY) },
    { icon: CalendarViewWeekRoundedIcon, label: 'Créditos Semanal', color: '#00838f', onClick: () => goToCreditsFilteredByFrequency(ChargeFrequencyEnum.WEEKLY) },
    { icon: SwapHorizRoundedIcon, label: 'Movimientos', color: '#2e7d32', fullWidth: true, onClick: () => navigate(NAV_ROUTES.wallet) },
  ];


  const stats = {
    creditosDiariosActivos: 1,
    creditosSemanalesActivos: 1,
    clientesTotal: 1,
  };

  const handleNavChange = (key: NavKey) => setActiveNav(key);

  return {
    activeNav,
    handleNavChange,
    stats,
    quickActions
  };
};

export default useHomeDashboardState;