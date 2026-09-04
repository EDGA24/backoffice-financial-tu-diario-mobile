import React from 'react';
import { Box, Chip } from '@mui/material';
import DashboardContactTable from '@/components/molecules/mobile/DashboardContacTable/DashboardContacTable';
import CreditsSummaryCard from '@/components/molecules/mobile/CreditsSummaryCard/CreditsSummaryCard';
import ColorLegend from '@/components/molecules/mobile/ColorLegend/ColorLegend';
import useCreditsDashboardState from './State/useCreditsDashboardState';
import { PENDING_APPROVAL_YELLOW, ON_TIME_PAYMENT_GREEN } from '@/shared/constants/statusColors';

const LEGEND_ITEMS = [
    {
        color: PENDING_APPROVAL_YELLOW,
        label: 'Pendiente por aprobar',
        description: 'Créditos con un pago enviado que está pendiente por aprobar.',
    },
    {
        color: ON_TIME_PAYMENT_GREEN,
        label: 'Pago a tiempo',
        description: 'Pago aprobado dentro del rango de fecha.',
    },
];

const CreditsDashboardContainer = () => {
    const {
        loans,
        onPagar,
        esElegibleParaRenovar,
        employeeOptions,
        controlledPagination,
        controlledEmployeeFilter,
        controlledSearch,
        chargeFrequencyFilterLabel,
        onClearChargeFrequencyFilter,
        creditsSummary,
    } = useCreditsDashboardState();

    return (
        <React.Fragment>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', px: 2.5, pt: 2 }}>
                <ColorLegend items={LEGEND_ITEMS} />
            </Box>

            {chargeFrequencyFilterLabel && (
                <Box sx={{ px: 2.5, pt: 2 }}>
                    <Chip
                        label={chargeFrequencyFilterLabel}
                        color="primary"
                        onDelete={onClearChargeFrequencyFilter}
                        sx={{ fontWeight: 600 }}
                    />
                </Box>
            )}

            <CreditsSummaryCard
                totalPorCobrar={creditsSummary.totalPorCobrar}
                totalCobrado={creditsSummary.totalCobrado}
                pendientePorCobrar={creditsSummary.pendientePorCobrar}
            />

            {/* --- Últimos préstamos --- */}
            <DashboardContactTable
                loans={loans}
                onPagar={onPagar}
                esElegibleParaRenovar={esElegibleParaRenovar}
                employeeOptions={employeeOptions}
                controlledPagination={controlledPagination}
                controlledEmployeeFilter={controlledEmployeeFilter}
                 controlledSearch={controlledSearch}

            />
        </React.Fragment>
    );
};

export default CreditsDashboardContainer;