import { useMemo, useState } from 'react';

export interface UsePaginationOptions<T> {
  items: T[];
  itemsPerPage?: number;
  initialPage?: number;
}

export interface UsePaginationResult<T> {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  paginatedItems: T[];
  totalItems: number;
  goToPage: (page: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export function usePagination<T>({
  items,
  itemsPerPage = 10,
  initialPage = 1,
}: UsePaginationOptions<T>): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, safePage, itemsPerPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  return {
    currentPage: safePage,
    totalPages,
    itemsPerPage,
    paginatedItems,
    totalItems,
    goToPage,
    goToNext: () => goToPage(safePage + 1),
    goToPrevious: () => goToPage(safePage - 1),
    canGoNext: safePage < totalPages,
    canGoPrevious: safePage > 1,
  };
}