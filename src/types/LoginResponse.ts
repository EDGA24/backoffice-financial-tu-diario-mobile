export interface LoginResponse {
    token: string;
    user:  LoginResponseUser;
}

export interface LoginResponseUser {
    _id:                  string;
    accountNumber?:       string;
    creditorCompanyId:    string;
    creditorCompanyInfo?: LoginResponseCreditorCompanyInfo;
    email:                string;
    permissions:          string[];
    roles:                string[];
    userName:             string;
    walletId?:            string;
    /**
     * Foto del saldo de la wallet al momento del login: arranca la cartera local (ver
     * walletLedger.store.ts). No es opcional: el backend siempre la manda, en ceros si el user
     * todavia no tiene wallet
     */
    walletSnapshot: WalletSnapshot;
}

export interface LoginResponseCreditorCompanyInfo {
    _id:          string;
    chargeRules?: LoginResponseChargeRules[];
    companyName:  string;
    email:        string;
    phoneNumber:  string;
    socialReason: string;
}

export interface LoginResponseChargeRules {
    chargeDay?:         string;
    chargeFrequency?:   string;
    chargePeriods?:     number;
    comissionRate?:     number;
    firstCharge?:       boolean;
    latePaymentCharge?: number;
    renovationPeriod?:  number;
}

/**
 * Foto del saldo de la wallet al momento del login: arranca la cartera local (ver
 * walletLedger.store.ts). No es opcional: el backend siempre la manda, en ceros si el user
 * todavia no tiene wallet
 */
export interface WalletSnapshot {
    firmBalance:            number;
    pendingExpensesBalance: number;
    pendingIncomesBalance:  number;
    /**
     * Epoch millis (Date.now()) del momento exacto en que el backend consulto este saldo
     */
    queriedAt: number;
}
