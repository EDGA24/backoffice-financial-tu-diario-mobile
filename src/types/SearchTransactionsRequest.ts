export interface SearchTransactionsRequest {
    filtersItems: FiltersItems;
    pagination:   Pagination;
}

export interface FiltersItems {
    accountInformacion?: AccountInformacion;
    chargeFrequency?:    string[];
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
    endDate?:   number;
    startDate?: number;
}

export interface Pagination {
    limit:      number;
    pageNumber: number;
}
