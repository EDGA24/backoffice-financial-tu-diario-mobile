export interface LoginResponseCreditorCompanyInfo {
    _id:          string;
    companyName:  string;
    socialReason: string;
    phoneNumber:  string;
    email:        string;
    chargeRules?: LoginResponseChargeRules[];
}

export interface LoginResponseChargeRules {
    chargeFrequency?:  string;
    chargePeriods?:    number;
    chargeDay?:        string;
    renovationPeriod?: number;
    comissionRate?:    number;
}

export interface LoginResponseUser {
    _id:                  string;
    userName:             string;
    email:                string;
    roles:                string[];
    permissions:          string[];
    creditorCompanyId:    string;
    walletId?:            string;
    accountNumber?:       string;
    creditorCompanyInfo?: LoginResponseCreditorCompanyInfo;
}

export interface LoginResponse {
    token: string;
    user:  LoginResponseUser;
}
