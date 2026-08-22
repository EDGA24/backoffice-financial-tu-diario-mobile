import useHomeDashboardState from './state/useHomeDashboardState';
import React from 'react';
import ResumeToday from '@/components/molecules/mobile/ResumeToday/ResumeToday';
import QuickActionsSection from '@/components/molecules/mobile/QuickActionSection/QuickActionsSection';


const HomeDashboardContainer = () => {
    const {
        stats,
        quickActions
    } = useHomeDashboardState();

    return (
        <React.Fragment>
            {/* --- Resumen de hoy --- */}
            <ResumeToday stats={stats} />

            {/* --- Acciones rápidas --- */}
            <QuickActionsSection actions={quickActions} />
        </React.Fragment>
    );
};

export default HomeDashboardContainer;