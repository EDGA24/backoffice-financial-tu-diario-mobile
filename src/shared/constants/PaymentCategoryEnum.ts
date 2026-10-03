export enum PaymentCategoryEnum {
    CHARGE_PERIOD = 'chargePeriod', // cuota fija del periodo de cobro
    LIQUIDATION = 'liquidation',    // liquidación del crédito
    RENEWAL = 'renewal',            // renovación del crédito
    FIRST_CHARGE = 'firstCharge',   // primer cobro automático al crear un crédito cuya regla trae firstCharge (cuenta en "otros")
}
