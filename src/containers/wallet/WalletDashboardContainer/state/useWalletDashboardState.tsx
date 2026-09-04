import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { get } from 'lodash';
import { type NavKey } from '@/components/organisms/mobile/BottomNavigation/BottomNavigation';
import { type TransactionKind } from '@/components/molecules/mobile/TransactionListItem/TransactionListItem';
import type { TransactionSummary } from '@/components/molecules/mobile/TransactionSection/TransactionSection';
import AddCardRoundedIcon from '@mui/icons-material/AddCardRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import LocalAtmRoundedIcon from '@mui/icons-material/LocalAtmRounded';
import SwapCallsRoundedIcon from '@mui/icons-material/SwapCallsRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import type { SvgIconComponent } from '@mui/icons-material';
import { useTransactionStore } from '@/stores/transactions.store';
import { useCreditStore } from '@/stores/credits.store';
import { useAuthStore } from '@/stores/auth.store';
import { TransactionTable } from '@/types/TransactionTable';
import type { Transactions } from '@/types/Transactions';
import type { TransactionsFilterValue } from '@/components/molecules/mobile/Filter/TransactionsFilterSheet/TransactionsFilterSheet';
import { UserRoleEnum } from '@/shared/constants/UserRoleEnum';
import { useEmployeeOptions } from '@/hooks/useEmployeeOptions';
import type { TransactionOverlayStatus } from '@/components/molecules/mobile/TransactionStatusOverlay/TransactionStatusOverlay';

// Cuánto se queda visible el aviso de "éxito" antes de cerrar el sheet solo.
const SUCCESS_OVERLAY_DURATION_MS = 1600;
// Mínimo que se muestra el "cargando" aunque el backend responda al instante
// (si no, en local casi ni se alcanza a ver antes de pasar a "éxito").
const MIN_LOADING_OVERLAY_MS = 900;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface WalletActionSummary {
  icon: SvgIconComponent;
  label: string;
  onClick?: () => void;
}

const ITEMS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 400;

// Solo el rol admin puede hacer movimientos (depositar, transferir, retirar).
// Cada acción trae su propio transactionType fijo (no se elige en el form) y
// el prefijo con el que se arma la descripción automática ("PREFIJO - nombre").
// 'self' = la cuenta destino es la propia wallet del usuario logueado, se
// precarga sola sin elegir nada (caso de "Ingresar"). 'employee' = se elige
// de un autocomplete y se resuelve su wallet real (caso "Transferir").
// 'none' = no aplica cuenta destino (caso "Retirar").
export type DestinationAccountMode = 'self' | 'employee' | 'none';

interface WalletActionConfig {
  icon: SvgIconComponent;
  label: string;
  sheetTitle: string;
  transactionType: string;
  typeLabel: string;
  descriptionPrefix: string;
  destinationAccountMode: DestinationAccountMode;
  // Un depósito es dinero externo entrando a una wallet — no aplica "de dónde sale".
  requiresSourceAccount: boolean;
}

const WALLET_ACTIONS_BASE: WalletActionConfig[] = [
  { icon: AddCardRoundedIcon, label: 'Ingresar', sheetTitle: 'Ingresar dinero', transactionType: 'deposit', typeLabel: 'Depósito', descriptionPrefix: 'DEP', destinationAccountMode: 'self', requiresSourceAccount: false },
  { icon: SwapHorizRoundedIcon, label: 'Transferir', sheetTitle: 'Transferir dinero', transactionType: 'transfer', typeLabel: 'Transferencia', descriptionPrefix: 'TRANS', destinationAccountMode: 'employee', requiresSourceAccount: true },
  { icon: LocalAtmRoundedIcon, label: 'Retirar', sheetTitle: 'Retirar dinero', transactionType: 'withdrawal', typeLabel: 'Retiro', descriptionPrefix: 'RET', destinationAccountMode: 'none', requiresSourceAccount: true },
];

// Alineado al TransactionTypeEnum real que utilzamos en el backend:
// credit | payment | transfer | deposit | withdrawal
const TRANSACTION_TYPE_CONFIG: Record<
  string,
  { label: string; icon: SvgIconComponent; kind: TransactionKind }
> = {
  credit: { label: 'Desembolso de crédito', icon: ArrowUpwardRoundedIcon, kind: 'expense' },
  payment: { label: 'Pago recibido', icon: SwapCallsRoundedIcon, kind: 'income' },
  transfer: { label: 'Transferencia', icon: SwapHorizRoundedIcon, kind: 'income' },
  deposit: { label: 'Depósito', icon: AddCardRoundedIcon, kind: 'income' },
  withdrawal: { label: 'Retiro', icon: LocalAtmRoundedIcon, kind: 'expense' },
};

const formatDate = (isoDate?: string) =>
  isoDate
    ? new Date(isoDate).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' })
    : '';

const formatAmount = (amount?: number) =>
  new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount ?? 0);

const formatBalance = (amount?: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount ?? 0);

const getIsoDate = (t: TransactionTable): string | undefined => t.createdAt;

// Para "transfer" el signo depende de quién es quién: si tu wallet es la
// sourceAccount, es dinero que sale (negativo); si eres la destinationAccount,
// es dinero que entra (positivo). Los demás tipos ya tienen un sentido fijo.
const mapTransactionToSummary = (t: TransactionTable, index: number, myWalletId: string): TransactionSummary => {
  const baseConfig = (t.transactionType ? TRANSACTION_TYPE_CONFIG[t.transactionType] : undefined) ?? {
    label: t.transactionType ?? 'Movimiento',
    icon: MoreHorizRoundedIcon,
    kind: 'transfer' as TransactionKind,
  };

  const kind: TransactionKind =
    t.transactionType === 'transfer'
      ? (t.sourceAccount?.walletId === myWalletId ? 'expense' : 'income')
      : baseConfig.kind;

  const config = { ...baseConfig, kind };

  return {
    id: t._id ?? `tx-${index}`,
    icon: config.icon,
    title: config.label,
    subtitle: t.description ?? formatDate(t.createdAt),
    amount: formatAmount(t.total),
    kind: config.kind,
    isPending: t.status === 'pending',
    date: getIsoDate(t),
  };
};

const DEFAULT_FILTER: TransactionsFilterValue = {
  dateRange: { preset: 'TODOS', range: null },
  movimientos: [],
};

const useWalletDashboardState = () => {
  const { transactionsData, searchTransactionsByUserData, createTransactionByEmployee } = useTransactionStore();
  const { getWalletInfo } = useCreditStore();
  const employeeOptions = useEmployeeOptions();
  const creditorCompanyId = useAuthStore((state) => state.user?.creditorCompanyId ?? '');
  const walletId = useAuthStore((state) => state.user?.walletId ?? '');
  const accountNumber = useAuthStore((state) => state.user?.accountNumber ?? '');
  const userName = useAuthStore((state) => state.user?.userName ?? '');
  const roles = useAuthStore((state) => state.user?.roles ?? []);
  // Comparación case-insensitive: el backend guarda el nombre del rol tal
  // cual lo capturaron (p.ej. "ADMIN"), no necesariamente en minúsculas.
  // Solo admin ve los botones de mover dinero; manager y employee no (pero
  // manager sí puede filtrar, ese filtro no depende de este flag).
  const isAdmin = roles.some((role) => role.toLowerCase() === UserRoleEnum.ADMIN);
  const [activeNav, setActiveNav] = useState<NavKey>('wallet');

  const [allRecords, setAllRecords] = useState<TransactionTable[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<TransactionsFilterValue>(DEFAULT_FILTER);
  const [searchTerm, setSearchTerm] = useState('');
  const [walletTotalAmount, setWalletTotalAmount] = useState<number | undefined>(undefined);
  const [walletAccountNumber, setWalletAccountNumber] = useState<string>('');
  const [walletPendingIncomes, setWalletPendingIncomes] = useState<number | undefined>(undefined);
  const [walletPendingExpenses, setWalletPendingExpenses] = useState<number | undefined>(undefined);
  const [transactionSheetOpen, setTransactionSheetOpen] = useState(false);
  const [transactionSheetTitle, setTransactionSheetTitle] = useState('Nuevo movimiento');
  const [activeAction, setActiveAction] = useState<WalletActionConfig>(WALLET_ACTIONS_BASE[0]);
  const [destinationWallet, setDestinationWallet] = useState<{ accountNumber?: string; walletId?: string } | null>(null);
  const [loadingDestinationWallet, setLoadingDestinationWallet] = useState(false);
  const [submittingTransaction, setSubmittingTransaction] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [transactionOverlayStatus, setTransactionOverlayStatus] = useState<TransactionOverlayStatus>(null);

  const TRANSACTION_FORM_DEFAULTS: Transactions = {
    creditorCompanyId,
    transactionType: activeAction.transactionType,
    total: 0,
    description: '',
    currency: 'MXN',
    // La cuenta origen es siempre la wallet del usuario logueado (JWT), no se edita.
    sourceAccount: { accountNumber, walletId },
    destinationAccount: { accountNumber: '', walletId: '' },
  };

  const {
    control: transactionControl,
    formState: { errors: transactionErrors },
    setValue: setTransactionValue,
    handleSubmit: handleSubmitTransaction,
    reset: resetTransactionForm,
  } = useForm<Transactions>({
    defaultValues: TRANSACTION_FORM_DEFAULTS,
  });

  const balance = formatBalance(walletTotalAmount);
  const pendingIncomes = walletPendingIncomes ? formatBalance(walletPendingIncomes) : undefined;
  const pendingExpenses = walletPendingExpenses ? formatBalance(walletPendingExpenses) : undefined;

  const fetchPage = async (
    page: number,
    append: boolean,
    currentFilter: TransactionsFilterValue,
    currentSearchTerm: string
  ) => {
    if (append) setLoadingMore(true);

    await searchTransactionsByUserData({
      filtersItems: {
        creditorCompanyId,
        accountInformacion: {
          walletId,
          accountNumber,
        },
        createdRangeDate: currentFilter.dateRange.range
          ? {
              startDate: currentFilter.dateRange.range.startDate,
              endDate: currentFilter.dateRange.range.endDate,
            }
          : undefined,
        transactionType: currentFilter.movimientos.length > 0 ? currentFilter.movimientos : undefined,
        generalSearch: currentSearchTerm.trim() || undefined,
      },
      pagination: { limit: ITEMS_PER_PAGE, pageNumber: page },
    });

    const latestPageRecords = useTransactionStore.getState().transactionsData.records;
    setAllRecords((prev) => (append ? [...prev, ...latestPageRecords] : latestPageRecords));

    if (append) setLoadingMore(false);
  };

  useEffect(() => {
    if (!creditorCompanyId || !walletId) return;
    fetchPage(0, false, DEFAULT_FILTER, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditorCompanyId, walletId, accountNumber]);

  useEffect(() => {
    if (!walletId) return;
    getWalletInfo({ walletId }).then(({ records }) => {
      const wallet = records[0];
      setWalletTotalAmount(wallet?.firmBalance);
      setWalletAccountNumber(wallet?.accountNumber ?? '');
      setWalletPendingIncomes(wallet?.pendingIncomesBalance);
      setWalletPendingExpenses(wallet?.pendingExpensesBalance);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletId]);

  const handleNavChange = (key: NavKey) => setActiveNav(key);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchPage(nextPage, true, filter, searchTerm);
  };

  const handleApplyFilter = (value: TransactionsFilterValue) => {
    setFilter(value);
    setCurrentPage(0);
    setAllRecords([]);
    fetchPage(0, false, value, searchTerm);
  };

  // Búsqueda por texto: ahora va al backend (generalSearch), con debounce para
  // no disparar un request en cada tecla.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCurrentPage(0);
      setAllRecords([]);
      fetchPage(0, false, filter, term);
    }, SEARCH_DEBOUNCE_MS);
  };

  const transactions: TransactionSummary[] = allRecords.map((t, i) => mapTransactionToSummary(t, i, walletId));
  const hasMoreTransactions = allRecords.length > 0 && allRecords.length < transactionsData.total;

  const handleOpenTransactionForm = (action: WalletActionConfig) => {
    setActiveAction(action);
    setTransactionSheetTitle(action.sheetTitle);
    setTransactionValue('transactionType', action.transactionType);
    setTransactionValue('destinationEmployeeId' as any, '');

    if (action.destinationAccountMode === 'self') {
      // "Ingresar": se deposita a la propia wallet, se precarga sola.
      setTransactionValue('destinationAccount.walletId', walletId);
      setTransactionValue('destinationAccount.accountNumber', accountNumber);
      setDestinationWallet({ walletId, accountNumber });
      setTransactionValue('description', `${action.descriptionPrefix} - ${userName}`);
    } else if (action.destinationAccountMode === 'none') {
      // "Retirar": no aplica cuenta destino.
      setTransactionValue('destinationAccount.walletId', '');
      setTransactionValue('destinationAccount.accountNumber', '');
      setDestinationWallet(null);
      setTransactionValue('description', `${action.descriptionPrefix} - ${action.typeLabel}`);
    } else {
      // "Transferir": espera a que se elija un trabajador destino.
      setTransactionValue('destinationAccount.walletId', '');
      setTransactionValue('destinationAccount.accountNumber', '');
      setDestinationWallet(null);
      setTransactionValue('description', '');
    }

    setTransactionSheetOpen(true);
    setTransactionError(null);
  };

  const handleCloseTransactionForm = () => {
    setTransactionSheetOpen(false);
    setDestinationWallet(null);
    setTransactionError(null);
  };

  // Al elegir un empleado como destino, resuelve su wallet real por userId
  // (getWalletInfo ahora acepta userId además de walletId) y precarga los
  // campos de destinationAccount con el resultado.
  const handleSelectDestinationEmployee = async (employeeId: string | undefined) => {
    setTransactionError(null);

    if (!employeeId) {
      setDestinationWallet(null);
      setTransactionValue('destinationAccount.walletId', '');
      setTransactionValue('destinationAccount.accountNumber', '');
      setTransactionValue('description', '');
      return;
    }

    // La descripción se arma sola: "PREFIJO_DEL_MOVIMIENTO - nombre del trabajador".
    const employeeName = employeeOptions.find((employee) => employee.optionId === employeeId)?.label ?? '';
    setTransactionValue('description', employeeName ? `${activeAction.descriptionPrefix} - ${employeeName}` : '');

    try {
      setLoadingDestinationWallet(true);
      const { records } = await getWalletInfo({ userId: employeeId });
      const wallet = records[0];

      if (!wallet) {
        setDestinationWallet(null);
        setTransactionValue('destinationAccount.walletId', '');
        setTransactionValue('destinationAccount.accountNumber', '');
        setTransactionError('Este trabajador todavía no tiene una wallet asignada.');
        return;
      }

      setDestinationWallet({ accountNumber: wallet.accountNumber, walletId: wallet._id });
      setTransactionValue('destinationAccount.walletId', wallet._id ?? '');
      setTransactionValue('destinationAccount.accountNumber', wallet.accountNumber ?? '');
    } finally {
      setLoadingDestinationWallet(false);
    }
  };

  // handleSubmit valida los campos requeridos (tipo, cantidad, trabajador
  // destino) antes de llamar esto — si algo falta, ni siquiera se ejecuta.
  const submitTransaction = async (values: Transactions) => {
    setTransactionError(null);

    const destinationWalletId = get(values, 'destinationAccount.walletId', '');
    if (activeAction.destinationAccountMode !== 'none' && !destinationWalletId) {
      // El empleado se eligió pero la búsqueda de su wallet no encontró nada
      // (o sigue en curso): no hay a dónde mandar el movimiento.
      setTransactionError('Este trabajador todavía no tiene una wallet asignada.');
      return;
    }

    try {
      setSubmittingTransaction(true);
      // Bloquea toda la pantalla para que no se pueda picar "Aceptar" otra vez
      // mientras la petición sigue en curso.
      setTransactionOverlayStatus('loading');
      const loadingStartedAt = Date.now();

      await createTransactionByEmployee({
        transactionType: get(values, 'transactionType', ''),
        total: Number(get(values, 'total', 0)),
        description: get(values, 'description', ''),
        currency: get(values, 'currency', ''),
        sourceAccount: {
          accountNumber: get(values, 'sourceAccount.accountNumber', ''),
          walletId: get(values, 'sourceAccount.walletId', ''),
        },
        // Un retiro no manda destinationAccount: no aplica cuenta destino.
        ...(activeAction.destinationAccountMode !== 'none'
          ? {
              destinationAccount: {
                accountNumber: get(values, 'destinationAccount.accountNumber', ''),
                walletId: destinationWalletId,
              },
            }
          : {}),
        creditorCompanyId: get(values, 'creditorCompanyId', creditorCompanyId),
      });

      // Si el backend respondió muy rápido (p.ej. en local), espera a
      // completar el mínimo para que el "cargando" alcance a verse.
      const elapsed = Date.now() - loadingStartedAt;
      if (elapsed < MIN_LOADING_OVERLAY_MS) {
        await wait(MIN_LOADING_OVERLAY_MS - elapsed);
      }

      // Refresca la lista para reflejar la transacción recién creada (nace en PENDING).
      fetchPage(0, false, filter, searchTerm);

      setTransactionOverlayStatus('success');
      setTimeout(() => {
        setTransactionOverlayStatus(null);
        handleCloseTransactionForm();
        resetTransactionForm(TRANSACTION_FORM_DEFAULTS);
      }, SUCCESS_OVERLAY_DURATION_MS);
    } catch (error) {
      console.error('Error al crear la transacción:', error);
      setTransactionError('No se pudo crear el movimiento. Intenta de nuevo.');
      setTransactionOverlayStatus(null);
    } finally {
      setSubmittingTransaction(false);
    }
  };

  const handleAcceptTransactionForm = handleSubmitTransaction(submitTransaction);

  const actions: WalletActionSummary[] = isAdmin
    ? WALLET_ACTIONS_BASE.map((action) => ({
        icon: action.icon,
        label: action.label,
        onClick: () => handleOpenTransactionForm(action),
      }))
    : [];

  return {
    activeNav,
    handleNavChange,
    balance,
    accountNumber: walletAccountNumber || accountNumber,
    pendingIncomes,
    pendingExpenses,
    transactions,
    actions,
    hasMoreTransactions,
    loadingMoreTransactions: loadingMore,
    handleLoadMoreTransactions: handleLoadMore,
    filter,
    handleApplyFilter,
    searchTerm,
    setSearchTerm: handleSearchTermChange,
    transactionSheetOpen,
    transactionSheetTitle,
    submittingTransaction,
    transactionError,
    transactionOverlayStatus,
    transactionForm: {
      control: transactionControl,
      errors: transactionErrors,
      transactionTypeLabel: activeAction.typeLabel,
      destinationAccountMode: activeAction.destinationAccountMode,
      requiresSourceAccount: activeAction.requiresSourceAccount,
      sourceAccountNumber: accountNumber,
      sourceWalletId: walletId,
      employeeOptions,
      destinationAccountNumber: destinationWallet?.accountNumber,
      destinationWalletId: destinationWallet?.walletId,
      loadingDestinationWallet,
      onSelectDestinationEmployee: handleSelectDestinationEmployee,
    },
    handleCloseTransactionForm,
    handleAcceptTransactionForm,
  };
};

export default useWalletDashboardState;