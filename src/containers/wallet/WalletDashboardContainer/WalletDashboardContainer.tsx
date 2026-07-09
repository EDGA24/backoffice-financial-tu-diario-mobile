import WalletBalanceCard from '@/components/organisms/mobile/WalletBalanceCard/WalletBalanceCard';
import useWalletDashboardState from './state/useWalletDashboardState';
import React from 'react';
import TransactionsSection from '@/components/molecules/mobile/TransactionSection/TransactionSection';

const WalletDashboardContainer = () => {
    const {
        balance,
        changeAmount,
        transactions,
        actions,
    } = useWalletDashboardState();

    return (
        <React.Fragment>
            <WalletBalanceCard
                balance={balance}
                changeAmount={changeAmount}
                actions={actions}
            />

            <TransactionsSection transactions={transactions} />
        </React.Fragment>
    );
};

export default WalletDashboardContainer;