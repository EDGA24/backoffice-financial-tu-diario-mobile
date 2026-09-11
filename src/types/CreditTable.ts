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
    chargeDay?:       string;
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

// Coincide con el enum real del backend (CreditStatusEnum.ts): minúsculas,
// guion bajo, y "reestructured" con doble "e" (no "restructured").
export enum Status {
    ChargeProcess = "charge_process",
    Paid = "paid",
    Restructured = "reestructured",
    SlowPay = "slow_pay",
}
