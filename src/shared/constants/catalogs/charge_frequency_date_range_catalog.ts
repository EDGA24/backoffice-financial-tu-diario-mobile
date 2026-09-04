import { ChargeFrequencyEnum } from '@/shared/constants/ChargeFrequencyEnum';

const getStartOfToday = (referenceDate: Date = new Date()): Date => {
    const start = new Date(referenceDate);
    start.setHours(0, 0, 0, 0);
    return start;
};

const getLastMonday = (referenceDate: Date = new Date()): Date => {
    const start = getStartOfToday(referenceDate);
    const day = start.getDay(); // 0 = domingo, 1 = lunes, ... 6 = sábado
    const daysSinceMonday = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - daysSinceMonday);
    return start;
};

export const ChargeFrequencyDateRangeCatalog: Record<string, () => { fromTimestamp: number, toTimestamp: number }> = {
    [ChargeFrequencyEnum.DAILY]: () => ({
        fromTimestamp: getStartOfToday().getTime(),
        toTimestamp: Date.now(),
    }),
    [ChargeFrequencyEnum.WEEKLY]: () => ({
        fromTimestamp: getLastMonday().getTime(),
        toTimestamp: Date.now(),
    }),
};

/**
 * Resuelve el rango de fechas a partir de la frecuencia de cobro elegida.
 * Si no se elige ninguna (vista de "créditos en general"), se usa el corte
 * diario como configuración por defecto.
 */
export const resolveChargeFrequencyDateRange = (chargeFrequency: string[]): { fromTimestamp: number, toTimestamp: number } => {
    const frequency = chargeFrequency[0];
    const rangeBuilder = ChargeFrequencyDateRangeCatalog[frequency] ?? ChargeFrequencyDateRangeCatalog[ChargeFrequencyEnum.DAILY];
    return rangeBuilder();
};
