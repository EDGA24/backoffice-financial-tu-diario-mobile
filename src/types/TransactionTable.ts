export interface TransactionTable {
    _id?:       string;
    createdAt?: string;
    /**
     * Info del credito enlazado (creditInfo[0] del join en el backend): trae el _id real del
     * credito para poder navegar de la transaccion a su credito
     */
    creditBasicInfo?:    CreditBasicInfo;
    creditIdSource?:     string;
    creditorCompanyId?:  string;
    currency?:           string;
    description?:        string;
    destinationAccount?: DestinationAccount;
    sourceAccount?:      SourceAccount;
    status?:             string;
    total?:              number;
    transactionSubType?: string;
    transactionType?:    string;
    updatedAt?:          string;
}

/**
 * Info del credito enlazado (creditInfo[0] del join en el backend): trae el _id real del
 * credito para poder navegar de la transaccion a su credito
 */
export interface CreditBasicInfo {
    amountDue:  number;
    amountPaid: number;
    creditId:   string;
    total:      number;
}

export interface DestinationAccount {
    accountNumber?: string;
    walletId:       string;
}

export interface SourceAccount {
    accountNumber?: string;
    walletId:       string;
}
