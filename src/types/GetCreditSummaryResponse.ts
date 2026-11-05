/**
 * Un renglon por frecuencia de cobro (solo conteos, sin montos)
 */
export interface GetCreditSummaryResponse {
    chargeFrequency: string;
    /**
     * Pagos registrados en el periodo
     */
    collected: number;
    /**
     * Creditos nuevos
     */
    new: number;
    /**
     * Renovaciones
     */
    renewed: number;
}
