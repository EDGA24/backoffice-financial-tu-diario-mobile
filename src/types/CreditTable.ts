export interface CreditTable {
    _id:                      string;
    admissionDate:            Date;
    chargeRules:              ChargeRules;
    creditAmount:             number;
    amountDue?:               number;
    amountPaid?:              number;
    creditAmountWithMoratory: number;
    creditorCompanyId:        string;
    customerBasicInfo?:       CustomerBasicInfo;
    customerId:               string;
    employeeBasicInfo?:       EmployeeBasicInfo;
    expirationDate:           Date;
    fixedCharge:              number;
    startDateChargeConfig:    Date;
    status:                   Status;
    // Status de la transacción de DESEMBOLSO del propio crédito (nace en
    // "pending" hasta que un admin la aprueba) — distinto del transactionStatus
    // de lastPayment, que es el de un pago del cliente.
    transactionStatus?:       string;
    transactionId:            string;
    userId:                   string;
    lastPayment?:             LastPayment;
}

export interface LastPayment {
    createdAt:         Date;
    transactionStatus: string;
    total:              number;
}

export interface ChargeRules {
    chargeFrequency:  string;
    chargePeriods:    number;
    comissionRate:    number;
    renovationPeriod: number;
}

export interface CustomerBasicInfo {
    customerId:  string;
    fullName:    string;
    phoneNumber: string;
}

export interface EmployeeBasicInfo {
    fullName:    string;
    phoneNumber: string;
    userId:      string;
}

export enum Status {
    ChargeProcess = "CHARGE-PROCESS",
    Paid = "PAID",
    Restructured = "RESTRUCTURED",
    SlowPay = "SLOW-PAY",
}
