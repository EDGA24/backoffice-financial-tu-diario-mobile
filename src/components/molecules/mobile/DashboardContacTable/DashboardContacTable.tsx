import { Box, Typography, ButtonBase } from '@mui/material';
import type { LoanStatus } from '@/components/atoms/StatusChip/StatusChip';
import ContactPaymentList from '../ListContactPayment/ContactPaymentList';
import Pagination from '../Pagination/Pagination';
import LoanSearchBar from '../LoanSearchBar/LoanSearchBar';
import { usePagination } from '@/hooks/usePagination';
import { useLoanSearch } from '@/hooks/useLoanSearch';

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  status: 'pagado' | 'atrasado' | 'pendiente';
  method?: string;
}

export interface LoanSummary {
  initials: string;
  name: string;
  phone: string;
  date: string;
  amount: string;
  status: LoanStatus;
  historialPagos?: PaymentRecord[];
}

export interface DashboardContactTableProps {
  loans: LoanSummary[];
  title?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  onPagar?: (loan: LoanSummary, index: number) => Promise<void> | void;
  esPagado?: (loan: LoanSummary) => boolean;
  itemsPerPage?: number;
  showSearch?: boolean;
  controlledPagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

const DashboardContactTable: React.FC<DashboardContactTableProps> = ({
  loans,
  title = 'Últimos préstamos',
  actionLabel = 'Ver todos',
  onActionClick,
  onPagar,
  esPagado,
  itemsPerPage = 10,
  showSearch = true,
  controlledPagination,
}) => {
  // 1. Búsqueda primero: filtra sobre el total de préstamos
  const { searchTerm, setSearchTerm, filteredItems } = useLoanSearch(loans);

  // 2. Paginación sobre el resultado ya filtrado por búsqueda
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
        <Box sx={{ mb: 2 }}>
          <LoanSearchBar value={searchTerm} onChange={setSearchTerm} />
        </Box>
      )}

      {filteredItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="body2" color="text.secondary">
            No se encontraron resultados para "{searchTerm}"
          </Typography>
        </Box>
      ) : (
        <>
          <ContactPaymentList loans={itemsToShow} onPagar={onPagar} esPagado={esPagado} />

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