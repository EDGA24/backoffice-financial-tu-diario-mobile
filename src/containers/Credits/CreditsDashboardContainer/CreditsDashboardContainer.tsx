import React from 'react';
import DashboardContactTable from '@/components/molecules/mobile/DashboardContacTable/DashboardContacTable';
import useCreditsDashboardState from './State/useCreditsDashboardState';


const CreditsDashboardContainer = () => {
    const {
        loans,
    } = useCreditsDashboardState();

    return (
        <React.Fragment>

            {/* --- Últimos préstamos --- */}
            <DashboardContactTable loans={loans} />

        </React.Fragment>
    );
};

export default CreditsDashboardContainer;