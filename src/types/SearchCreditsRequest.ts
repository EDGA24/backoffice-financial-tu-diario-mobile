export interface SearchCreditsRequest {
    filtersItems: FiltersItems;
    pagination:   Pagination;
}

export interface FiltersItems {
    createdRangeDate?:  CreatedRangeDate;
    creditorCompanyId:  string;
    customerId?:        string;
    status?:            string[];
    transactionStatus?: string[];
    userId?:            string;
}

export interface CreatedRangeDate {
    endDate?:   number;
    startDate?: number;
}

export interface Pagination {
    limit:      number;
    pageNumber: number;
}
