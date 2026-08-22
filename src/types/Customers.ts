export interface Customers {
    contact:             Contact;
    created?:            number;
    creditorCompanyId:   string;
    status?:             string;
    threeWordsUbication: string;
    userId:              string;
}

export interface Contact {
    address?:     string;
    lastName?:    string;
    name?:        string;
    phoneNumber?: string;
}
