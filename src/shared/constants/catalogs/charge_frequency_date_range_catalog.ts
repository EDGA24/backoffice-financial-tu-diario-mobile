import { ChargeFrequencyEnum } from '@/shared/constants/ChargeFrequencyEnum';
import { ChargeDayEnum } from '@/shared/constants/ChargeDayEnum';

const DAY_NAME_TO_INDEX: Record<string, number> = {
    [ChargeDayEnum.SUNDAY]: 0,
    [ChargeDayEnum.MONDAY]: 1,
    [ChargeDayEnum.TUESDAY]: 2,
    [ChargeDayEnum.WEDNESDAY]: 3,
    [ChargeDayEnum.THURSDAY]: 4,
    [ChargeDayEnum.FRIDAY]: 5,
    [ChargeDayEnum.SATURDAY]: 6,
};

const getStartOfToday = (referenceDate: Date = new Date()): Date => {
    const start = new Date(referenceDate);
    start.setHours(0, 0, 0, 0);
    return start;
};

// Retrocede desde referenceDate hasta la última ocurrencia (incluyendo hoy)
// del día de la semana indicado — mismo criterio que usa el backend en
// ChargeFrequencyDateCatalog.tsx (services/credits) para el corte semanal.
const getLastOccurrenceOfDay = (dayIndex: number, referenceDate: Date = new Date()): Date => {
    const start = getStartOfToday(referenceDate);
    const diff = (start.getDay() - dayIndex + 7) % 7;
    start.setDate(start.getDate() - diff);
    return start;
};

export const ChargeFrequencyDateRangeCatalog: Record<string, (chargeDay?: string) => { fromTimestamp: number, toTimestamp: number }> = {
    [ChargeFrequencyEnum.DAILY]: () => ({
        fromTimestamp: getStartOfToday().getTime(),
        toTimestamp: Date.now(),
    }),
    [ChargeFrequencyEnum.WEEKLY]: (chargeDay = ChargeDayEnum.MONDAY) => {
        const dayIndex = DAY_NAME_TO_INDEX[chargeDay] ?? 1; // 1 = lunes, por si el valor no coincide con ningún día conocido
        return {
            fromTimestamp: getLastOccurrenceOfDay(dayIndex).getTime(),
            toTimestamp: Date.now(),
        };
    },
};

/**
 * Resuelve el rango de fechas a partir de la frecuencia de cobro elegida.
 * `chargeDay` es el día de corte semanal configurado en la empresa acreedora
 * (creditorCompanyInfo.chargeRules) — si no se manda, cae a lunes por
 * default. Si no se elige ninguna frecuencia (vista de "créditos en
 * general"), se usa el corte diario como configuración por defecto.
 */
export const resolveChargeFrequencyDateRange = (chargeFrequency: string[], chargeDay?: string): { fromTimestamp: number, toTimestamp: number } => {
    const frequency = chargeFrequency[0];
    const rangeBuilder = ChargeFrequencyDateRangeCatalog[frequency] ?? ChargeFrequencyDateRangeCatalog[ChargeFrequencyEnum.DAILY];
    return rangeBuilder(chargeDay);
};
