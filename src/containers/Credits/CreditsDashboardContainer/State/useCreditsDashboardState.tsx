import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { NavKey } from '@/components/organisms/mobile/BottomNavigation/BottomNavigation';
import type { LoanSummary, PaymentRecord } from '@/components/molecules/mobile/DashboardContacTable/DashboardContacTable';
import { useEmployeeOptions } from '@/hooks/useEmployeeOptions';
import { useCreditStore } from '@/stores/credits.store';
import { useAuthStore } from '@/stores/auth.store';
import { CreditTable } from '@/types/CreditTable';
import { LoanStatus } from '@/components/atoms/StatusChip/StatusChip';
import { ChargeFrequencyEnum } from '@/shared/constants/ChargeFrequencyEnum';
import { get } from 'lodash';

const ITEMS_PER_PAGE = 10;

interface CreditsDashboardNavigationState {
  chargeFrequency?: string[];
}

const CHARGE_FREQUENCY_LABELS: Record<string, string> = {
  [ChargeFrequencyEnum.DAILY]: 'Créditos Diario',
  [ChargeFrequencyEnum.WEEKLY]: 'Créditos Semanal',
};

// Umbral para habilitar "Renovar": aún no hay backend que calcule pagos reales,
// así que el historial se simula a partir del avance en el tiempo del crédito
// (admissionDate -> expirationDate). Regla acordada: más del 90% liquidado.
// Se usa porcentaje (no un conteo fijo de pagos) porque el total de pagos
// varía según la frecuencia del crédito (diario vs semanal).
const DEFAULT_SIMULATED_PAYMENTS = 12;
const UMBRAL_PORCENTAJE_LIQUIDADO = 0.9;

// ---------- Helpers de mapeo backend -> LoanSummary ----------
const formatDate = (date: string | number | Date) =>
  new Date(date).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

const getInitials = (fullName: string) =>
  fullName
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

// Simula el historial de pagos de un crédito a partir de su avance en el
// tiempo (admissionDate -> expirationDate) MÁS los pagos que el usuario
// registre a mano con el modal de "Pagar" (pagosManuales: los montos
// capturados, en orden), ya que aún no existe backend que reporte los
// pagos reales.
const buildSimulatedHistorial = (credit: CreditTable, pagosManuales: number[]): PaymentRecord[] => {
  const totalPagos = credit.chargeRules?.chargePeriods || DEFAULT_SIMULATED_PAYMENTS;
  const inicio = new Date(credit.admissionDate).getTime();
  const fin = new Date(credit.expirationDate).getTime();
  const duracionTotal = fin > inicio ? fin - inicio : 1;
  const progresoTiempo = Math.min(1, Math.max(0, (Date.now() - inicio) / duracionTotal));
  const pagosPorTiempo = Math.round(progresoTiempo * totalPagos);
  const pagosRealizados = Math.min(totalPagos, pagosPorTiempo + pagosManuales.length);
  const montoPorPagoDefault = (credit.creditAmount ?? 0) / totalPagos;

  return Array.from({ length: totalPagos }, (_, i) => {
    const esPagoManual = i >= pagosPorTiempo && i < pagosRealizados;
    const montoManual = esPagoManual ? pagosManuales[i - pagosPorTiempo] : undefined;

    return {
      id: `${credit._id}-pago-${i + 1}`,
      date: formatDate(new Date(inicio + ((i + 1) / totalPagos) * duracionTotal)),
      amount: montoManual ?? montoPorPagoDefault,
      status: i < pagosRealizados ? 'pagado' : 'pendiente',
    };
  });
};

const mapCreditToLoanSummary = (
  credit: CreditTable & { customerInfo?: any[] },
  pagosManuales: number[],
  pagoPendiente: boolean
): LoanSummary => {
  const customer = credit.customerInfo?.[0];
  const clienteIdCorto = credit.customerId?.slice(-4) ?? '----';

  const nombreCliente = customer?.contact
    ? `${get(customer, 'contact.name', '')} ${get(customer, 'contact.lastName', '')}`.trim()
    : (credit.customerBasicInfo?.fullName ?? `Cliente #${clienteIdCorto}`);

  const telefonoCliente = customer?.contact
    ? get(customer, 'contact.phoneNumber', 'Sin teléfono')
    : (credit.customerBasicInfo?.phoneNumber ?? 'Sin teléfono');

  const direccionCliente = get(customer, 'contact.address', '');
  const ubicacionCliente = get(customer, 'threeWordsUbication', '');

  const empleadoId = credit.employeeBasicInfo?.userId ?? credit.userId;

  return {
    initials: nombreCliente ? getInitials(nombreCliente) : 'CL',
    name: nombreCliente,
    phone: telefonoCliente,
    date: formatDate(credit.admissionDate),
    amount: formatAmount(credit.creditAmount),
    amountDue: credit.amountDue,
    amountPaid: credit.amountPaid,
    status: credit.status as LoanStatus,
    employeeId: empleadoId,
    customerId: credit.customerId,
    creditorCompanyId: credit.creditorCompanyId,
    creditId: credit._id,
    address: direccionCliente,
    threeWordsUbication: ubicacionCliente,
    fixedCharge: credit.fixedCharge,
    historialPagos: buildSimulatedHistorial(credit, pagosManuales),
    transactionPaymentStatusTemp: pagoPendiente ? 'pending' : undefined,
  };
};

const useCreditsDashboardState = () => {
  const location = useLocation();
  const { chargeFrequency: initialChargeFrequency } = (location.state ?? {}) as CreditsDashboardNavigationState;

  const { creditsData, searchCreditsByEmployeeData, createPayment } = useCreditStore();
  const creditorCompanyId = useAuthStore((state) => state.user?.creditorCompanyId ?? '');
  const employeeOptions = useEmployeeOptions();
  const [activeNav, setActiveNav] = useState<NavKey>('newcredits');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  // Filtro de "Créditos Diario"/"Créditos Semanal" que llega desde los
  // botones del home dashboard (chargeRules.chargeFrequency en el backend).
  const [chargeFrequencyFilter, setChargeFrequencyFilter] = useState<string[]>(initialChargeFrequency ?? []);
  // Pagos simulados registrados a mano con el modal de "Pagar" (creditId -> montos capturados).
  const [pagosManuales, setPagosManuales] = useState<Record<string, number[]>>({});
  // Créditos con un pago recién enviado y "pendiente" de confirmación (simulación).
  const [pagosPendientes, setPagosPendientes] = useState<Record<string, boolean>>({});

  const fetchPage = (page: number, employeeId: string | null, search: string, chargeFrequency: string[]) => {
    searchCreditsByEmployeeData({
      filtersItems: {
        creditorCompanyId,
        userId: employeeId ?? '',
        generalSearch: search,
        chargeFrequency: chargeFrequency.length > 0 ? chargeFrequency : undefined,
      },
      pagination: {
        limit: ITEMS_PER_PAGE,
        pageNumber: page - 1,
      },
    });
  };

  useEffect(() => {
    if (!creditorCompanyId) return;
    fetchPage(1, selectedEmployeeId, searchText, chargeFrequencyFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditorCompanyId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPage(page, selectedEmployeeId, searchText, chargeFrequencyFilter);
  };

  const handleEmployeeFilterApply = (employeeId: string | null) => {
    setSelectedEmployeeId(employeeId);
    setCurrentPage(1);
    fetchPage(1, employeeId, searchText, chargeFrequencyFilter);
  };

  const handleSearchChange = (search: string) => {
    setSearchText(search);
    setCurrentPage(1);
    fetchPage(1, selectedEmployeeId, search, chargeFrequencyFilter);
  };

  const handleClearChargeFrequencyFilter = () => {
    setChargeFrequencyFilter([]);
    setCurrentPage(1);
    fetchPage(1, selectedEmployeeId, searchText, []);
  };

  const handleNavChange = (key: NavKey) => setActiveNav(key);

  // Al confirmar el monto en el modal, crea el pago real en el backend
  // (createPaymentsByEmployee) y, mientras no exista un endpoint que liste
  // los pagos reales en esta vista, lo deja en pending localmente.
  const handlePagar = async (loan: LoanSummary, _index: number, amount: number) => {
    if (!loan.creditId) return;
    const creditId = loan.creditId;

    await createPayment({
      creditId,
      customerId: loan.customerId ?? '',
      total: amount,
    });

    setPagosManuales((prev) => ({
      ...prev,
      [creditId]: [...(prev[creditId] ?? []), amount],
    }));
    setPagosPendientes((prev) => ({ ...prev, [creditId]: true }));
  };

  const loans: LoanSummary[] = creditsData.records.map((credit) =>
    mapCreditToLoanSummary(credit, pagosManuales[credit._id] ?? [], pagosPendientes[credit._id] ?? false)
  );
  const totalPages = Math.max(1, Math.ceil(creditsData.total / ITEMS_PER_PAGE));

  // Nota: solo refleja los créditos de la página actual, ya que el backend
  // no expone un endpoint de totales agregados todavía.
  // totalCobrado y pendientePorCobrar ya vienen calculados en el backend
  // (amountPaid / amountDue en cada crédito), no son una aproximación local.
  const totalPorCobrar = creditsData.records.reduce((sum, credit) => sum + (credit.creditAmount ?? 0), 0);
  const totalCobrado = creditsData.records.reduce((sum, credit) => sum + (credit.amountPaid ?? 0), 0);
  const pendientePorCobrar = creditsData.records.reduce((sum, credit) => sum + (credit.amountDue ?? 0), 0);

  const esElegibleParaRenovar = (loan: LoanSummary) => {
    const historial = loan.historialPagos ?? [];
    const totalPagos = historial.length;
    if (totalPagos === 0) return false;

    const pagosRealizados = historial.filter((p) => p.status === 'pagado').length;
    return pagosRealizados / totalPagos > UMBRAL_PORCENTAJE_LIQUIDADO;
  };

  return {
    activeNav,
    handleNavChange,
    loans,
    onPagar: handlePagar,
    esElegibleParaRenovar,
    employeeOptions,
    controlledPagination: {
      currentPage,
      totalPages,
      onPageChange: handlePageChange,
    },
    controlledEmployeeFilter: {
      selectedEmployeeId,
      onApply: handleEmployeeFilterApply,
    },
    controlledSearch: {
      searchTerm: searchText,
      setSearchTerm: handleSearchChange,
    },
    chargeFrequencyFilterLabel: chargeFrequencyFilter[0]
      ? (CHARGE_FREQUENCY_LABELS[chargeFrequencyFilter[0]] ?? null)
      : null,
    onClearChargeFrequencyFilter: handleClearChargeFrequencyFilter,
    creditsSummary: {
      totalPorCobrar: formatAmount(totalPorCobrar),
      totalCobrado: formatAmount(totalCobrado),
      pendientePorCobrar: formatAmount(pendientePorCobrar),
    },
  };
};

export default useCreditsDashboardState;