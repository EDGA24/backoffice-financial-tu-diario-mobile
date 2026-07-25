import AlertBanner from '@/components/molecules/mobile/AlertBanner/AlertBanner';
import useHomeDashboardState from './state/useHomeDashboardState';
import React from 'react';
import ResumeToday from '@/components/molecules/mobile/ResumeToday/ResumeToday';
import QuickActionsSection from '@/components/molecules/mobile/QuickActionSection/QuickActionsSection';
import DashboardContactTable from '@/components/molecules/mobile/DashboardContacTable/DashboardContacTable';

const HomeDashboardContainer = () => {
    const {
        alertText,
        loans,
        stats,
        quickActions
    } = useHomeDashboardState();

    return (
        <React.Fragment>
            <AlertBanner text={alertText} />

            {/* --- Resumen de hoy --- */}
            <ResumeToday stats={stats} />

            {/* --- Acciones rápidas --- */}
            <QuickActionsSection actions={quickActions} />

            {/* --- Últimos préstamos --- */}
            <DashboardContactTable loans={loans} />
        </React.Fragment>
    );
};

export default HomeDashboardContainer;