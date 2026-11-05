/**
 * Pagos (> $0) e incidencias (faltas) del credito, cada lista ordenada del mas antiguo al
 * mas reciente
 */
export interface GetCreditPaymentsAndIncidentsResponse {
    incidents: IncidentTable[];
    payments:  PaymentTable[];
}

export interface IncidentTable {
    _id?:               string;
    createdAt?:         string;
    currency?:          string;
    description?:       string;
    latePaymentCharge?: number;
}

export interface PaymentTable {
    _id?:               string;
    createdAt?:         string;
    creditId?:          string;
    customerId?:        string;
    paymentCategory?:   string;
    paymentMethod?:     string;
    total?:             number;
    transactionId?:     string;
    transactionStatus?: string;
    updatedAt?:         string;
}
