import { IColumnsTable } from "@/shared/interfaces/IColumnsTable"

export enum DashboardTableCatalogEnum {
    customers = "customers",
    credits = "credits",
    employees = "employees",
    transactions = "transactions"
}

export enum CustomerColumnsEnum {
    customerName = "customerName",
    phoneNumber = "phoneNumber",
    address = "address",
    endorsement = "endorsement",
    employee = "employee",
    status = "status",
    created = "created",
    actions = "actions"
}

export enum CreditColumnsEnum {
    creditName = "creditName",
    status = "status",
    created = "created",
    total = "total",
    customerInfo = "customerInfo",
    employeeInfo = "employeeInfo",
    actions = "actions"
}

export enum EmployeeColumnsEnum {
    employeeName = "customers",
    phoneNumber = "phoneNumber",
    address = "address",
    status = "status",
    created = "created",
    actions = "actions"
}

export enum TransactionColumnsEnum {
    transactionName = "transactionName",
    phoneNumber = "phoneNumber",
    address = "address",
    status = "status",
    created = "created",
    actions = "actions"
}

const ALL_CUSTOMER_RENDER_COLUMNS: IColumnsTable[] = [
    { columnTableId: CustomerColumnsEnum.customerName, tittle: "Nombre" },
    { columnTableId: CustomerColumnsEnum.phoneNumber, tittle: "Telefono" },
    { columnTableId: CustomerColumnsEnum.address, tittle: "Direccion" },
    { columnTableId: CustomerColumnsEnum.endorsement, tittle: "Aval" },
    { columnTableId: CustomerColumnsEnum.employee, tittle: "Empleado" },
    { columnTableId: CustomerColumnsEnum.status, tittle: "Estatus" },
    { columnTableId: CustomerColumnsEnum.created, tittle: "Registro" },
    { columnTableId: CustomerColumnsEnum.actions, tittle: "Acciones" }
];

const ALL_EMPLOYEE_RENDER_COLUMNS: IColumnsTable[] = [
    { columnTableId: EmployeeColumnsEnum.employeeName, tittle: "Nombre Empleado" },
    { columnTableId: EmployeeColumnsEnum.phoneNumber, tittle: "Telefono" },
    { columnTableId: EmployeeColumnsEnum.address, tittle: "Direccion" },
    { columnTableId: EmployeeColumnsEnum.status, tittle: "Status" },
    { columnTableId: EmployeeColumnsEnum.created, tittle: "Registro" },
    { columnTableId: EmployeeColumnsEnum.actions, tittle: "Acciones" }
];

const ALL_CREDITS_RENDER_COLUMNS: IColumnsTable[] = [
    { columnTableId: CreditColumnsEnum.creditName, tittle: "Nombre Credito" },
    { columnTableId: CreditColumnsEnum.created, tittle: "Registro" },
    { columnTableId: CreditColumnsEnum.customerInfo, tittle: "Informacion Cliente" },
    { columnTableId: CreditColumnsEnum.employeeInfo, tittle: "Informacion Empleado" },
    { columnTableId: CreditColumnsEnum.status, tittle: "Status" },
    { columnTableId: CreditColumnsEnum.total, tittle: "Total" },
    { columnTableId: CreditColumnsEnum.actions, tittle: "Acciones" }
];

const ALL_TRANSACTION_RENDER_COLUMNS: IColumnsTable[] = [
    { columnTableId: TransactionColumnsEnum.transactionName, tittle: "Nombre Transaction" },
    { columnTableId: TransactionColumnsEnum.phoneNumber, tittle: "Telefono" },
    { columnTableId: TransactionColumnsEnum.address, tittle: "Direccion" },
    { columnTableId: TransactionColumnsEnum.status, tittle: "Status" },
    { columnTableId: TransactionColumnsEnum.created, tittle: "Registro" },
    { columnTableId: TransactionColumnsEnum.actions, tittle: "Acciones" }
];

export const DashboardTableCatalog: Record<string, IColumnsTable[]> = {
    [DashboardTableCatalogEnum.customers]: ALL_CUSTOMER_RENDER_COLUMNS,
    [DashboardTableCatalogEnum.credits]: ALL_CREDITS_RENDER_COLUMNS,
    [DashboardTableCatalogEnum.employees]: ALL_EMPLOYEE_RENDER_COLUMNS,
    [DashboardTableCatalogEnum.transactions]: ALL_TRANSACTION_RENDER_COLUMNS
}