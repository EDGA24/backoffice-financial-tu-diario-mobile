export interface GetCreditTotalsRequest {
    filtersItems:  FiltersItems;
    fromTimestamp: number;
    toTimestamp:   number;
}

export interface FiltersItems {
    chargeFrequency?: string[];
    userId?:          string;
}
