export interface SearchEmployeesRequest {
    filtersItems: FilterItemsEmployees;
    pagination:   Pagination;
}

export interface FilterItemsEmployees {
    status?:            string[];
    creditorCompanyId:  string;
}

export interface Pagination {
    pageNumber: number;
    limit:      number;
}
