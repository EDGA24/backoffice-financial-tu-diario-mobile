export interface Customers {
    /**
     * Aval del cliente: solo informacion de respaldo (contacto de la persona que lo avala).
     * Opcional; el backend lo guarda al crear el cliente
     */
    aval?:               Aval;
    contact:             Contact;
    created?:            number;
    creditorCompanyId:   string;
    status?:             string;
    threeWordsUbication: string;
    userId:              string;
}

/**
 * Aval del cliente: solo informacion de respaldo (contacto de la persona que lo avala).
 * Opcional; el backend lo guarda al crear el cliente
 */
export interface Aval {
    contact: Contact;
    /**
     * Solo si el aval ya es un cliente registrado (se eligio del buscador)
     */
    customerId?: string;
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
