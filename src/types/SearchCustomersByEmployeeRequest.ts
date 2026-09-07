export interface SearchCustomersByEmployeeRequest {
    filtersItems: FiltersItems;
    pagination:   Pagination;
}

export interface FiltersItems {
    generalSearch?: string;
}

export interface Pagination {
    limit:      number;
    pageNumber: number;
}
