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
    // Solo del request: el backend lo usa para la descripción de la
    // transacción ("CREDIT - <nombre>"), no se guarda en el crédito.
    customerName?:             string;
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
    // Viene de la regla de la empresa: si es true, se registra el primer
    // pago en cuanto se crea el crédito (nuevo o renovación).
    firstCharge?:      boolean;
}

export enum CreationStatus {
    New = "new",
    Renewed = "renewed",
}
