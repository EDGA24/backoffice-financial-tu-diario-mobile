export interface TransactionTable {
    _id?:                string;
    createdAt?:          string;
    creditBasicInfo?:    CreditBasicInfo;
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

// Info del crédito enlazado (creditInfo[0] del join en el backend) — trae el
// _id real del crédito para poder navegar de la transacción a su crédito.
export interface CreditBasicInfo {
    creditId:    string;
    total:       number;
    amountPaid:  number;
    amountDue:   number;
}

export interface DestinationAccount {
    accountNumber?: string;
    walletId:       string;
}

export interface SourceAccount {
    accountNumber?: string;
    walletId:       string;
}
