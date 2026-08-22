export interface Transactions {
    transactionType?:   string;
    status?:             string;
    total?:              number;
    description?:        string;
    currency?:           string;
    sourceAccount?:      TransactionAccount;
    destinationAccount?: TransactionAccount;
    creditIdSource?:     string;
    creditorCompanyId:   string;
}

export interface TransactionAccount {
    accountNumber?: string;
    walletId:       string;
}
