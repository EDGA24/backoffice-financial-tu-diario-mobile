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
    walletSnapshot:       WalletSnapshot;
}

// Foto del saldo de la wallet al momento del login — arranca la "cartera
// local" (ver walletLedger.store.ts). No es opcional: el backend siempre la
// manda, en ceros si el user todavía no tiene wallet.
export interface WalletSnapshot {
    firmBalance:            number;
    pendingIncomesBalance:  number;
    pendingExpensesBalance: number;
    // Epoch millis (Date.now()) del momento exacto en que el backend consultó este saldo.
    queriedAt:              number;
}

export interface LoginResponse {
    token: string;
    user:  LoginResponseUser;
}
