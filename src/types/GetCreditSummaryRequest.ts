export interface GetCreditSummaryRequest {
    filtersItems?: FiltersItems;
    fromTimestamp: number;
    toTimestamp:   number;
}

export interface FiltersItems {
    userId?: string;
}
