export interface SearchCreditsByEmployeeRequest {
    filtersItems: FiltersItems;
    pagination:   Pagination;
}

export interface FiltersItems {
    creditorCompanyId: string;
    generalSearch?:    string;
    userId:            string;
    chargeFrequency?:  string[];
    // Navegación desde Transacciones hacia el crédito relacionado — se manda
    // SOLO uno de los dos, nunca ambos (ver UserRoleCatalogs.tsx en el backend).
    creditId?:      string;
    transactionId?: string;
}

export interface Pagination {
    limit:      number;
    pageNumber: number;
}
