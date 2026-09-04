export interface GetCreditTotalsRequest {
    fromTimestamp: number;
    toTimestamp: number;
    filtersItems: {
        chargeFrequency?: string[];
        userId?: string;
    };
}

export interface GetCreditTotalsResponse {
    totalToCollect: number;
    totalCollected: number;
    totalPending: number;
}
