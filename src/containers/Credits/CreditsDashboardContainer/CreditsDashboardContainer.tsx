import React, { useState } from 'react';
import { Box, Chip, Collapse, IconButton } from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import DashboardContactTable from '@/components/molecules/mobile/DashboardContacTable/DashboardContacTable';
import CreditsSummaryCard from '@/components/molecules/mobile/CreditsSummaryCard/CreditsSummaryCard';
import ColorLegend from '@/components/molecules/mobile/ColorLegend/ColorLegend';
import useCreditsDashboardState from './State/useCreditsDashboardState';
import { PENDING_APPROVAL_YELLOW } from '@/shared/constants/statusColors';

const LEGEND_ITEMS = [
    {
        color: PENDING_APPROVAL_YELLOW,
        label: 'Pendiente por aprobar',
        description: 'Créditos con un pago enviado que está pendiente por aprobar.',
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
    const [showSummary, setShowSummary] = useState(false);

    return (
        <React.Fragment>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, pt: 2 }}>
                <IconButton
                    size="small"
                    onClick={() => setShowSummary((prev) => !prev)}
                    aria-label={showSummary ? 'Ocultar totales' : 'Mostrar totales'}
                >
                    {showSummary ? (
                        <VisibilityRoundedIcon fontSize="small" />
                    ) : (
                        <VisibilityOffRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    )}
                </IconButton>
                <ColorLegend items={LEGEND_ITEMS} />
            </Box>

            <Collapse in={showSummary}>
                <CreditsSummaryCard
                    totalPorCobrar={creditsSummary.totalPorCobrar}
                    totalCobrado={creditsSummary.totalCobrado}
                    pendientePorCobrar={creditsSummary.pendientePorCobrar}
                />
            </Collapse>

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