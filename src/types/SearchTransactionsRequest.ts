export interface SearchTransactionsRequest {
    filtersItems: FiltersItems;
    pagination:   Pagination;
}

export interface FiltersItems {
    accountInformacion?: AccountInformacion;
    createdRangeDate?:   CreatedRangeDate;
    creditorCompanyId:   string;
    generalSearch?:      string;
    status?:             string[];
    transactionType?:    string[];
}

export interface AccountInformacion {
    accountNumber: string;
    walletId:      string;
}

export interface CreatedRangeDate {
    endDate?:   string;
    startDate?: string;
}

export interface Pagination {
    limit:      number;
    pageNumber: number;
}
