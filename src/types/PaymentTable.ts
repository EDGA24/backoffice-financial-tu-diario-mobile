export interface PaymentTable {
    _id?:               string;
    createdAt?:         string;
    creditId?:          string;
    customerId?:        string;
    paymentCategory?:   string;
    paymentMethod?:     string;
    total?:             number;
    transactionId?:     string;
    transactionStatus?: string;
    updatedAt?:         string;
}
