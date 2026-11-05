export interface SearchCreditsByEmployeeRequest {
    filtersItems: FiltersItems;
    pagination:   Pagination;
}

export interface FiltersItems {
    chargeFrequency?: string[];
    /**
     * Navegacion desde Transacciones hacia el credito relacionado: se manda solo uno de los
     * dos, nunca ambos (ver UserRoleCatalogs.tsx en el backend)
     */
    creditId?:         string;
    creditorCompanyId: string;
    generalSearch?:    string;
    transactionId?:    string;
    userId:            string;
}

export interface Pagination {
    limit:      number;
    pageNumber: number;
}
