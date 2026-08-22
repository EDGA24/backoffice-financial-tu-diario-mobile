import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import type { EmployeeOption } from '@/shared/constants/catalogs/employees.catalog';

export const useEmployeeOptions = () => {
  const { searchEmployees } = useAuthStore();
  const creditorCompanyId = useAuthStore((state) => state.user?.creditorCompanyId ?? '');
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);

  useEffect(() => {
    if (!creditorCompanyId) return;

    searchEmployees({
      filtersItems: { creditorCompanyId },
      pagination: { pageNumber: 0, limit: 100 },
    }).then(({ records }) => {
      setEmployeeOptions(
        records.map((employee) => ({ optionId: employee._id, label: employee.userName }))
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditorCompanyId]);

  return employeeOptions;
};

export default useEmployeeOptions;
