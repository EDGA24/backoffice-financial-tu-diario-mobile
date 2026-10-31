// Cargo por faltas: amountMoratory es el total cargado al crédito y
// amountPaidMoratory lo que ya se abonó (igual que amountDue / amountPaid).
interface MoratoryFields {
    amountMoratory?: number;
    amountPaidMoratory?: number;
}

// Lo que todavía falta pagar de faltas (nunca negativo).
export const getFaltasPendientes = (loan?: MoratoryFields | null): number =>
    Math.max(0, (loan?.amountMoratory ?? 0) - (loan?.amountPaidMoratory ?? 0));
