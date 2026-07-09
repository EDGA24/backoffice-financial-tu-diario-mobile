import { useState } from 'react';
import { type NavKey } from '@/components/organisms/mobile/BottomNavigation/BottomNavigation';
import { type TransactionKind } from '@/components/molecules/mobile/TransactionListItem/TransactionListItem';
import AddCardRoundedIcon from '@mui/icons-material/AddCardRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import SwapCallsRoundedIcon from '@mui/icons-material/SwapCallsRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import type { SvgIconComponent } from '@mui/icons-material';

export interface TransactionSummary {
  id: number;
  icon: SvgIconComponent;
  title: string;
  subtitle: string;
  amount: string;
  kind: TransactionKind;
}

export interface WalletActionSummary {
  icon: SvgIconComponent;
  label: string;
}

const MOCK_TRANSACTIONS: TransactionSummary[] = [
  { id: 1, icon: TrendingUpRoundedIcon, title: 'Ganancia', subtitle: 'Beneficio del período', amount: '0.25', kind: 'income' },
  { id: 2, icon: SwapCallsRoundedIcon, title: 'Transferencia recibida', subtitle: '5 de julio', amount: '1,700.00', kind: 'income' },
  { id: 3, icon: ArrowUpwardRoundedIcon, title: 'Retiro', subtitle: '3 de julio', amount: '500.00', kind: 'expense' },
];

const MOCK_ACTIONS: WalletActionSummary[] = [
  { icon: AddCardRoundedIcon, label: 'Ingresar' },
  { icon: SwapHorizRoundedIcon, label: 'Transferir' },
  { icon: ArrowDownwardRoundedIcon, label: 'Retirar' },
  { icon: MoreHorizRoundedIcon, label: 'Más' },
];

const useWalletDashboardState = () => {
  const [activeNav, setActiveNav] = useState<NavKey>('wallet');

  const balance = '$2,293.02';
  const changeAmount = '$0.44';
 

  const transactions = MOCK_TRANSACTIONS;
  const actions = MOCK_ACTIONS;

  const handleNavChange = (key: NavKey) => setActiveNav(key);

  return {
    activeNav,
    handleNavChange,
    balance,
    changeAmount,
    transactions,
    actions,
  };
};

export default useWalletDashboardState;