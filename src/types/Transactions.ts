export interface Transactions {
    creditIdSource?:     string;
    creditorCompanyId:   string;
    currency?:           string;
    description?:        string;
    destinationAccount?: TransactionAccount;
    sourceAccount?:      TransactionAccount;
    status?:             string;
    total?:              number;
    transactionSubType?: string;
    transactionType?:    string;
}

export interface TransactionAccount {
    accountNumber?: string;
    walletId:       string;
}
