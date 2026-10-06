export interface GetCreditSummaryRequest {
    fromTimestamp: number;
    toTimestamp: number;
    filtersItems?: {
        userId?: string;
    };
}

// Un renglón por frecuencia de cobro (solo conteos, sin montos)
export interface GetCreditSummaryResponse {
    chargeFrequency: string;
    collected: number; // pagos registrados en el periodo
    new: number;       // créditos nuevos
    renewed: number;   // renovaciones
}
