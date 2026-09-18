export interface Credits {
    admissionDate?:            number;
    chargeRules?:              ChargeRules;
    created?:                  number;
    creationStatus?:           CreationStatus;
    // ID del crédito original que se está renovando. Solo se manda en renovaciones.
    creditId?:                 string;
    creditAmount?:             number;
    creditAmountWithMoratory?: number;
    creditorCompanyId:         string;
    customerId:                string;
    expirationDate?:           number;
    fixedCharge?:              number;
    /**
     * Se precarga con la fecha del ultimo reporte de cobro realizado al cobrador
     */
    startDateChargeConfig?: number;
    status?:                string;
    transactionId:          string;
    userId:                 string;
}

export interface ChargeRules {
    chargeFrequency?:  string;
    chargePeriods?:    number;
    // Solo aplica a chargeFrequency "weekly" — día de la semana en que cae
    // el cobro (ej. "monday"). El backend la usa para calcular
    // startDateChargeConfig (ver ChargeFrequencyDateCatalog).
    chargeDay?:        string;
    comissionRate?:    number;
    renovationPeriod?: number;
}

export enum CreationStatus {
    New = "new",
    Renewed = "renewed",
}
