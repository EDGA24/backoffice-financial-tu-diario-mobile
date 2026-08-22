export interface EmployeeUser {
    _id:                string;
    userName:           string;
    email?:             string;
    roles?:             string[];
    status?:            string;
    creditorCompanyId?: string;
}
