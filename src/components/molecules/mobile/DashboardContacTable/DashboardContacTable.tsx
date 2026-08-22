import { Box, Typography, ButtonBase, Stack } from '@mui/material';
import type { LoanStatus } from '@/components/atoms/StatusChip/StatusChip';
import ContactPaymentList from '../ListContactPayment/ContactPaymentList';
import Pagination from '../Pagination/Pagination';
import LoanSearchBar from '../LoanSearchBar/LoanSearchBar';
import LoanEmployeeFilter from '../LoanEmployeeFilter/LoanEmployeeFilter';
import { usePagination } from '@/hooks/usePagination';
import { useLoanSearch } from '@/hooks/useLoanSearch';
import { useEmployeeFilter } from '@/hooks/useEmployeeFilter';
import type { EmployeeOption } from '@/shared/constants/catalogs/employees.catalog';

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  status: 'pagado' | 'atrasado' | 'pendiente' | 'cancelado';
  method?: string;
}

export interface LoanSummary {
  initials: string;
  name: string;
  phone: string;
  date: string;
  amount: string;
  amountDue?: number;
  amountPaid?: number;
  status: LoanStatus;
  historialPagos?: PaymentRecord[];
  employeeId?: string;
  customerId?: string;
  creditorCompanyId?: string;
  creditId?: string;
  address?: string;
  threeWordsUbication?: string;
  fixedCharge?: number;
  // Simulación: aún no existe backend que confirme el pago, así que se
  // marca "pending" al enviarlo y la tarjeta se pinta de amarillo mientras dura.
  transactionPaymentStatusTemp?: 'pending';
}

export interface DashboardContactTableProps {
  loans: LoanSummary[];
  title?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  onPagar?: (loan: LoanSummary, index: number, amount: number) => Promise<void> | void;
  esPagado?: (loan: LoanSummary) => boolean;
  esElegibleParaRenovar?: (loan: LoanSummary) => boolean;
  employeeOptions?: EmployeeOption[];
  itemsPerPage?: number;
  showSearch?: boolean;
  controlledPagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  // Nuevo: cuando se provee, el filtro de trabajador se resuelve en el backend
  // (searchCreditsByEmployee) 
  controlledEmployeeFilter?: {
    selectedEmployeeId: string | null;
    onApply: (employeeId: string | null) => void;
  };
  // Nuevo: cuando se provee, la búsqueda de texto se resuelve en el backend
  // (searchCreditsByEmployee -> generalSearch)
  controlledSearch?: {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
  };
}

const DashboardContactTable: React.FC<DashboardContactTableProps> = ({
  loans,
  title = 'Ultimos préstamos',
  actionLabel = '',
  onActionClick,
  onPagar,
  esPagado,
  esElegibleParaRenovar,
  employeeOptions = [],
  itemsPerPage = 10,
  showSearch = true,
  controlledPagination,
  controlledEmployeeFilter,
  controlledSearch,
}) => {
  const isEmployeeFilterControlled = Boolean(controlledEmployeeFilter);

  // Solo usamos el filtrado client-side si NO viene controlado desde afuera
  const localEmployeeFilter = useEmployeeFilter(loans);
  const loansFiltradosPorEmpleado = isEmployeeFilterControlled ? loans : localEmployeeFilter.filteredItems;
  const selectedEmployeeId = isEmployeeFilterControlled
    ? controlledEmployeeFilter!.selectedEmployeeId
    : localEmployeeFilter.selectedEmployeeId;
  const handleEmployeeApply = isEmployeeFilterControlled
    ? controlledEmployeeFilter!.onApply
    : localEmployeeFilter.setSelectedEmployeeId;

  // Búsqueda de texto: si viene controlada desde afuera (backend), la usamos;
  // si no, caemos al filtrado local por texto (useLoanSearch)
  const isSearchControlled = Boolean(controlledSearch);
  const localSearch = useLoanSearch(loansFiltradosPorEmpleado);
  const searchTerm = isSearchControlled ? controlledSearch!.searchTerm : localSearch.searchTerm;
  const setSearchTerm = isSearchControlled ? controlledSearch!.setSearchTerm : localSearch.setSearchTerm;
  // Cuando la búsqueda está controlada, "loansFiltradosPorEmpleado" YA viene
  // filtrado por texto desde el backend (generalSearch), así que no se vuelve a filtrar local
  const filteredItems = isSearchControlled ? loansFiltradosPorEmpleado : localSearch.filteredItems;

  // Paginación sobre el resultado final
  const local = usePagination({ items: filteredItems, itemsPerPage });

  const isControlled = Boolean(controlledPagination);

  const itemsToShow = isControlled ? filteredItems : local.paginatedItems;
  const currentPage = isControlled ? controlledPagination!.currentPage : local.currentPage;
  const totalPages = isControlled ? controlledPagination!.totalPages : local.totalPages;
  const onPageChange = isControlled ? controlledPagination!.onPageChange : local.goToPage;
  const onNext = isControlled
    ? () => controlledPagination!.onPageChange(currentPage + 1)
    : local.goToNext;
  const onPrevious = isControlled
    ? () => controlledPagination!.onPageChange(currentPage - 1)
    : local.goToPrevious;
  const canGoNext = currentPage < totalPages;
  const canGoPrevious = currentPage > 1;

  return (
    <Box sx={{ mt: 3, px: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{title}</Typography>
        <ButtonBase onClick={onActionClick}>
          <Typography sx={{ fontWeight: 700, fontSize: 12, color: 'secondary.main' }}>
            {actionLabel}
          </Typography>
        </ButtonBase>
      </Box>

      {showSearch && (
        <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <LoanSearchBar value={searchTerm} onChange={setSearchTerm} />
          </Box>

          {employeeOptions.length > 0 && (
            <LoanEmployeeFilter
              options={employeeOptions}
              selectedEmployeeId={selectedEmployeeId}
              onApply={handleEmployeeApply}
            />
          )}
        </Stack>
      )}

      {filteredItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="body2" color="text.secondary">
            No se encontraron resultados{searchTerm ? ` para "${searchTerm}"` : ''}
          </Typography>
        </Box>
      ) : (
        <>
          <ContactPaymentList
            loans={itemsToShow}
            onPagar={onPagar}
            esPagado={esPagado}
            esElegibleParaRenovar={esElegibleParaRenovar}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            onNext={onNext}
            onPrevious={onPrevious}
            canGoNext={canGoNext}
            canGoPrevious={canGoPrevious}
          />
        </>
      )}
    </Box>
  );
};

export default DashboardContactTable;