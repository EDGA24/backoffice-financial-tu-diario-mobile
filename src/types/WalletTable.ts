export interface WalletTable {
    _id?:                    string;
    accountNumber?:          string;
    createdAt?:              string;
    customerId?:             string;
    firmBalance?:            number;
    pendingExpensesBalance?: number;
    pendingIncomesBalance?:  number;
    status?:                 string;
    totalAmount?:            number;
    updatedAt?:              string;
    userId?:                 string;
}
