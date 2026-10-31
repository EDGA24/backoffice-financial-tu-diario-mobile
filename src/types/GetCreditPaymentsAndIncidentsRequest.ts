import { PaymentTable } from './PaymentTable';
import { IncidentTable } from './IncidentTable';

export interface GetCreditPaymentsAndIncidentsRequest {
    creditId: string;
}

// Pagos confirmados (> $0) e incidencias (faltas) del crédito, cada lista
// ordenada del más antiguo al más reciente.
export interface GetCreditPaymentsAndIncidentsResponse {
    payments:  PaymentTable[];
    incidents: IncidentTable[];
}
