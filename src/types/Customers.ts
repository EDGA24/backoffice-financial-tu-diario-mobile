export interface Customers {
    contact:             Contact;
    // Aval del cliente — solo información de respaldo (contacto de la persona
    // que lo avala). Opcional; el backend lo guarda al crear el cliente.
    aval?:               Aval;
    created?:            number;
    creditorCompanyId:   string;
    status?:             string;
    threeWordsUbication: string;
    userId:              string;
}

export interface Aval {
    // Solo si el aval ya es un cliente registrado (se eligió del buscador)
    customerId?: string;
    contact:     Contact;
}

export interface Contact {
    address?:     string;
    lastName?:    string;
    name?:        string;
    phoneNumber?: string;
    ubication?:   Ubication;
}

export interface Ubication {
    latitude?:  string;
    longitude?: string;
}
