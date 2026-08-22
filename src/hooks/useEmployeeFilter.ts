import { useMemo, useState } from 'react';

export interface FilterableByEmployee {
  employeeId?: string;
}

export interface UseEmployeeFilterResult<T> {
  selectedEmployeeId: string | null;
  setSelectedEmployeeId: (id: string | null) => void;
  filteredItems: T[];
}

export function useEmployeeFilter<T extends FilterableByEmployee>(
  items: T[]
): UseEmployeeFilterResult<T> {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!selectedEmployeeId) return items;
    return items.filter((item) => item.employeeId === selectedEmployeeId);
  }, [items, selectedEmployeeId]);

  return { selectedEmployeeId, setSelectedEmployeeId, filteredItems };
}