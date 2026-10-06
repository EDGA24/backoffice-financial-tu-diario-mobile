import { useEffect, useState } from 'react';
import { get } from 'lodash';
import { useCreditStore } from '@/stores/credits.store';
import { useAuthStore } from '@/stores/auth.store';
import { ChargeFrequencyDateRangeCatalog } from '@/shared/constants/catalogs/charge_frequency_date_range_catalog';
import type { GetCreditSummaryResponse } from '@/types/GetCreditSummaryRequest';
import type { ResumeTodayStats } from '@/components/molecules/mobile/ResumeToday/ResumeToday';
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


  // Resumen de la semana (getCreditSummary): solo conteos por frecuencia.
  const { getCreditSummary } = useCreditStore();
  const creditorCompanyId = useAuthStore((state) => state.user?.creditorCompanyId ?? '');
  // Día de corte semanal configurado por la empresa (mismo criterio que Créditos)
  const weeklyChargeDay = useAuthStore((state) =>
    state.user?.creditorCompanyInfo?.chargeRules?.find((rule) => rule.chargeFrequency === ChargeFrequencyEnum.WEEKLY)?.chargeDay
  );
  const [summary, setSummary] = useState<GetCreditSummaryResponse[]>([]);

  useEffect(() => {
    if (!creditorCompanyId) return;
    const { fromTimestamp, toTimestamp } = ChargeFrequencyDateRangeCatalog[ChargeFrequencyEnum.WEEKLY](weeklyChargeDay);
    getCreditSummary({ fromTimestamp, toTimestamp })
      .then(setSummary)
      .catch((error) => {
        console.error('Error al obtener el resumen:', error);
        setSummary([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditorCompanyId]);

  // Si una frecuencia no viene en la respuesta (sin créditos de ese tipo), va en 0
  const daily = summary.find((row) => row.chargeFrequency === ChargeFrequencyEnum.DAILY);
  const weekly = summary.find((row) => row.chargeFrequency === ChargeFrequencyEnum.WEEKLY);
  const byFrequency = (key: 'collected' | 'new' | 'renewed') => ({
    daily: get(daily, key, 0),
    weekly: get(weekly, key, 0),
  });

  const stats: ResumeTodayStats = {
    collected: byFrequency('collected'),
    new: byFrequency('new'),
    renewed: byFrequency('renewed'),
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