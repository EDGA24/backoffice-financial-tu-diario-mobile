// Colores dedicados a estados temporales/de negocio que no vienen de
// theme.palette (evita choques con colores que MUI ya usa para otros
// significados, como warning = naranja).
export const PENDING_APPROVAL_YELLOW = '#FDD835';
// Pago registrado dentro de los 7 días siguientes al inicio del periodo de
// cobro (startDateChargeConfig) — se considera "a tiempo".
export const ON_TIME_PAYMENT_GREEN = '#66BB6A';
// amountPaid ya alcanzó fixedCharge * renovationPeriod — el crédito está
// disponible para renovar.
export const RENEWAL_AVAILABLE_CYAN = '#00ACC1';
// Pago ya registrado (status "pagado") pero por debajo del fixedCharge del
// crédito — se cubrió menos de lo que correspondía a esa cuota. Un amarillo
// más apagado/mostaza a propósito, para que no se confunda con
// PENDING_APPROVAL_YELLOW (son dos significados distintos).
export const PARTIAL_PAYMENT_YELLOW = '#C9A227';
