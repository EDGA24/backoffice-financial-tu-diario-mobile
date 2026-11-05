export interface Credits {
    admissionDate?:            number;
    amountMoratory?:           number;
    amountPaidMoratory?:       number;
    chargeRules?:              ChargeRules;
    created?:                  number;
    creationStatus?:           CreationStatus;
    creditAmount?:             number;
    creditAmountWithMoratory?: number;
    /**
     * ID del credito original que se esta renovando. Solo se manda en renovaciones
     */
    creditId?:         string;
    creditorCompanyId: string;
    customerId:        string;
    /**
     * Solo del request: descripcion de la transaccion, no se guarda en el credito
     */
    customerName?:   string;
    expirationDate?: number;
    fixedCharge?:    number;
    /**
     * Se precarga con la fecha del ultimo reporte de cobro realizado al cobrador
     */
    startDateChargeConfig?: number;
    status?:                string;
    transactionId:          string;
    userId:                 string;
}

export interface ChargeRules {
    /**
     * Solo aplica a chargeFrequency weekly: dia de la semana en que cae el cobro. El backend la
     * usa para calcular startDateChargeConfig (ver ChargeFrequencyDateCatalog)
     */
    chargeDay?:       string;
    chargeFrequency?: string;
    chargePeriods?:   number;
    comissionRate?:   number;
    /**
     * Viene de la regla de la empresa: si es true, se registra el primer pago en cuanto se crea
     * el credito (nuevo o renovacion)
     */
    firstCharge?: boolean;
    /**
     * Moratorio fijo en pesos (ej. 50 = $50) por incumplimiento: solo se guarda en el credito
     */
    latePaymentCharge?: number;
    renovationPeriod?:  number;
}

export enum CreationStatus {
    New = "new",
    Renewed = "renewed",
}
