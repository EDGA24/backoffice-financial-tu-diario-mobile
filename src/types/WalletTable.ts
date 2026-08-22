export interface WalletTable {
    _id?:                     string;
    accountNumber?:           string;
    status?:                  string;
    userId?:                  string;
    totalAmount?:             number;
    firmBalance?:             number;
    pendingIncomesBalance?:   number;
    pendingExpensesBalance?:  number;
    customerId?:              string;
    createdAt?:               string;
    updatedAt?:               string;
}
