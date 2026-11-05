export interface CreditTable {
    _id:                      string;
    admissionDate:            Date;
    amountDue?:               number;
    amountMoratory?:          number;
    amountPaid?:              number;
    amountPaidMoratory?:      number;
    changeDateStatus?:        Date;
    chargeRules:              ChargeRules;
    creationStatus?:          CreationStatus;
    creditAmount:             number;
    creditAmountWithMoratory: number;
    creditorCompanyId:        string;
    customerBasicInfo?:       CustomerBasicInfo;
    customerId:               string;
    employeeBasicInfo?:       EmployeeBasicInfo;
    expirationDate:           Date;
    fixedCharge:              number;
    lastPayment?:             LastPayment;
    lastPaymentDateApproved?: Date;
    startDateChargeConfig:    Date;
    /**
     * Coincide con CreditStatusEnum del backend: minusculas, guion bajo, y reestructured con
     * doble e
     */
    status:             Status;
    transactionId:      string;
    transactionStatus?: string;
    userId:             string;
}

export interface ChargeRules {
    chargeDay?:         string;
    chargeFrequency:    string;
    chargePeriods:      number;
    comissionRate:      number;
    firstCharge?:       boolean;
    latePaymentCharge?: number;
    renovationPeriod:   number;
}

export enum CreationStatus {
    New = "new",
    Renewed = "renewed",
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

export interface LastPayment {
    createdAt:         Date;
    total:             number;
    transactionStatus: string;
}

/**
 * Coincide con CreditStatusEnum del backend: minusculas, guion bajo, y reestructured con
 * doble e
 */
export enum Status {
    ChargeProcess = "charge_process",
    Paid = "paid",
    Reestructured = "reestructured",
    SlowPay = "slow_pay",
}
