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
    transactionId:            string;
    userId:                   string;
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
