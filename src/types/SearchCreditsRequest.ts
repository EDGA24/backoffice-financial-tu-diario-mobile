export interface SearchCreditsRequest {
    filtersItems: FiltersItems;
    pagination:   Pagination;
}

export interface FiltersItems {
    creditorCompanyId?: string;
    status?:            string[];
}

export interface Pagination {
    limit:      number;
    pageNumber: number;
}
