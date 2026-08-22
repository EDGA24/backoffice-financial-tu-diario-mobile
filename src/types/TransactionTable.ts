export interface TransactionTable {
    _id?:                string;
    createdAt?:          string;
    creditIdSource?:     string;
    creditorCompanyId?:  string;
    currency?:           string;
    description?:        string;
    destinationAccount?: DestinationAccount;
    sourceAccount?:      SourceAccount;
    status?:             string;
    total?:              number;
    transactionType?:    string;
    updatedAt?:          string;
}

export interface DestinationAccount {
    accountNumber?: string;
    walletId:       string;
}

export interface SourceAccount {
    accountNumber?: string;
    walletId:       string;
}
