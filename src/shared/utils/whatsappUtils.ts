import { ChargeFrequencyEnum } from '@/shared/constants/ChargeFrequencyEnum';

const CHARGE_FREQUENCY_LABELS: Record<string, string> = {
    [ChargeFrequencyEnum.DAILY]: 'diario',
    [ChargeFrequencyEnum.WEEKLY]: 'semanal',
};

export const getChargeFrequencyLabel = (chargeFrequency?: string): string =>
    chargeFrequency ? CHARGE_FREQUENCY_LABELS[chargeFrequency] ?? chargeFrequency : 'periódico';

const MX_COUNTRY_CODE = '52';

// Los teléfonos se capturan en la app como número local (10 dígitos), sin
// código de país. Si se manda así a wa.me, WhatsApp intenta adivinar el país
// usando los primeros dígitos y puede resolver uno completamente distinto
// (ej. un número que empieza en "961..." se interpreta como Líbano, +961).
// Anteponer "52" explícitamente evita esa adivinanza.
const withCountryCode = (cleanPhone: string): string =>
    cleanPhone.length === 10 ? `${MX_COUNTRY_CODE}${cleanPhone}` : cleanPhone;

// Abre WhatsApp con un chat prellenado — no usa la API de WhatsApp, solo el
// esquema de link "click to chat" (wa.me). El usuario sigue teniendo que
// presionar "Enviar" dentro de WhatsApp, eso no se puede automatizar sin la
// API de Business real.
export const openWhatsApp = (phone: string, message: string): void => {
    const cleanPhone = withCountryCode(phone.replace(/\D/g, ''));
    if (!cleanPhone) return;

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    // '_system' (no '_blank'): así Capacitor le pasa la URL al sistema
    // operativo en vez de intentar abrirla dentro del WebView de la app,
    // dejando que Android decida abrir WhatsApp o el navegador.
    window.open(whatsappUrl, '_system');
};

// Mismo formato que se usa en el ticket visual (CreditSuccessTicket), para
// que la fecha del mensaje de WhatsApp y la del ticket coincidan.
export const formatTicketDateTime = (createdAt: number): string =>
    new Date(createdAt).toLocaleString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

export interface CreditWhatsAppMessageParams {
    customerName: string;
    creditAmount: number;
    chargeAmount: number;
    chargeFrequency?: string;
    chargePeriods: number;
    createdAt: number;
    status: string;
}

export interface TransactionWhatsAppMessageParams {
    typeLabel: string;
    description?: string;
    total: number;
    currency?: string;
    statusLabel: string;
    createdAt?: string;
}

// Mensaje interno para la empresa (no para el cliente) — comparte el detalle
// de un movimiento ya existente, mismo criterio que buildCreditWhatsAppMessage.
export const buildTransactionWhatsAppMessage = ({
    typeLabel,
    description,
    total,
    currency,
    statusLabel,
    createdAt,
}: TransactionWhatsAppMessageParams): string => {
    return [
        `${typeLabel} — ${statusLabel}`,
        '',
        `Fecha: ${createdAt ? new Date(createdAt).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}`,
        `Descripción: ${description || '—'}`,
        `Monto: $${total.toFixed(2)} ${currency || 'MXN'}`,
    ].join('\n');
};

// Mensaje interno para la empresa (no para el cliente) — avisa que un
// trabajador acaba de registrar un crédito nuevo.
export const buildCreditWhatsAppMessage = ({
    customerName,
    creditAmount,
    chargeAmount,
    chargeFrequency,
    chargePeriods,
    createdAt,
    status
}: CreditWhatsAppMessageParams): string => {
    const frequencyLabel = getChargeFrequencyLabel(chargeFrequency);

    return [
        'Nuevo crédito registrado.',
        '',
        `Fecha: ${formatTicketDateTime(createdAt)}`,
        `Status del credito: ${status}`,
        `Cliente: ${customerName}`,
        `Monto del crédito: $${creditAmount.toFixed(2)}`,
        `Pago ${frequencyLabel}: $${chargeAmount.toFixed(2)}`,
        `Número de pagos: ${chargePeriods}`,
        

    ].join('\n');
};
