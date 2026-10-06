import type { ChargeRules } from '@/types/Credits';

// Id de una regla de cobro: todos sus valores en un orden fijo. Dos reglas
// distintas nunca comparten id (aunque tengan la misma frecuencia, ej. dos
// reglas "daily" de 20 y 16 pagos), y un crédito puede reconstruir el id de
// la regla con la que se creó a partir de su propio chargeRules.
// Ej: "daily|20|18|0.2||true", "weekly|12|11|0.5|monday|false"
export const buildChargeRuleId = (rule: Partial<ChargeRules>): string =>
    [
        rule.chargeFrequency ?? '',
        rule.chargePeriods ?? '',
        rule.renovationPeriod ?? '',
        rule.comissionRate ?? '',
        rule.chargeDay ?? '',
        rule.firstCharge ?? false,
    ].join('|');
