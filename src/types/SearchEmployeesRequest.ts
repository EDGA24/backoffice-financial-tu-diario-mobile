export interface SearchEmployeesRequest {
    filtersItems: FilterItemsEmployees;
    pagination:   Pagination;
}

export interface FilterItemsEmployees {
    creditorCompanyId: string;
    generalSearch?:    string;
    status?:           string[];
}

export interface Pagination {
    limit:      number;
    pageNumber: number;
}
