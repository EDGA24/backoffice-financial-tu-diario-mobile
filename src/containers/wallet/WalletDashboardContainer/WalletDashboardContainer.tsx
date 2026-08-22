import WalletBalanceCard from '@/components/organisms/mobile/WalletBalanceCard/WalletBalanceCard';
import useWalletDashboardState from './state/useWalletDashboardState';
import React from 'react';
import TransactionsSection from '@/components/molecules/mobile/TransactionSection/TransactionSection';
import TransactionsFilterSheet from '@/components/molecules/mobile/Filter/TransactionsFilterSheet/TransactionsFilterSheet';
import FilterBottomSheet from '@/components/molecules/mobile/Filter/FilterBottomSheet/FilterBottomSheet';
import TransactionForm from '@/components/molecules/mobile/Forms/TransactionForm/TransactionForm';
import TransactionStatusOverlay from '@/components/molecules/mobile/TransactionStatusOverlay/TransactionStatusOverlay';
import LoanSearchBar from '@/components/molecules/mobile/LoanSearchBar/LoanSearchBar';
import { Alert, Box } from '@mui/material';

const MOVIMIENTO_OPTIONS = ['credit', 'payment', 'transfer', 'deposit', 'withdrawal'];

const MOVIMIENTO_LABELS: Record<string, string> = {
    credit: 'Desembolso de crédito',
    payment: 'Pago recibido',
    transfer: 'Transferencia',
    deposit: 'Depósito',
    withdrawal: 'Retiro',
};

const WalletDashboardContainer = () => {
    const {
        balance,
        accountNumber,
        pendingIncomes,
        pendingExpenses,
        transactions,
        actions,
        hasMoreTransactions,
        loadingMoreTransactions,
        handleLoadMoreTransactions,
        filter,
        handleApplyFilter,
        searchTerm,
        setSearchTerm,
        transactionSheetOpen,
        transactionSheetTitle,
        transactionForm,
        submittingTransaction,
        transactionError,
        transactionOverlayStatus,
        handleCloseTransactionForm,
        handleAcceptTransactionForm,
    } = useWalletDashboardState();

    return (
        <React.Fragment>
            <WalletBalanceCard
                balance={balance}
                accountNumber={accountNumber}
                pendingIncomes={pendingIncomes}
                pendingExpenses={pendingExpenses}
                actions={actions}
            />

            <Box sx={{ display: 'flex', gap: 1, px: 2.5, mt: 2, alignItems: 'center' }}>
                <Box sx={{ flex: 1 }}>
                    <LoanSearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Buscar por concepto o descripción"
                    />
                </Box>

                <TransactionsFilterSheet
                    value={filter}
                    movimientoOptions={MOVIMIENTO_OPTIONS}
                    movimientoLabels={MOVIMIENTO_LABELS}
                    onApply={handleApplyFilter}
                />
            </Box>

            <TransactionsSection
                transactions={transactions}
                hasMore={hasMoreTransactions}
                loadingMore={loadingMoreTransactions}
                onLoadMore={handleLoadMoreTransactions}
            />

            <FilterBottomSheet
                open={transactionSheetOpen}
                title={transactionSheetTitle}
                onClose={handleCloseTransactionForm}
                onClear={handleCloseTransactionForm}
                onApply={handleAcceptTransactionForm}
                applyLabel="Aceptar"
                clearLabel="Cancelar"
                applyLoading={submittingTransaction}
            >
                {transactionError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {transactionError}
                    </Alert>
                )}
                <TransactionForm
                    control={transactionForm.control}
                    errors={transactionForm.errors}
                    transactionTypeLabel={transactionForm.transactionTypeLabel}
                    destinationAccountMode={transactionForm.destinationAccountMode}
                    requiresSourceAccount={transactionForm.requiresSourceAccount}
                    sourceAccountNumber={transactionForm.sourceAccountNumber}
                    sourceWalletId={transactionForm.sourceWalletId}
                    employeeOptions={transactionForm.employeeOptions}
                    destinationAccountNumber={transactionForm.destinationAccountNumber}
                    destinationWalletId={transactionForm.destinationWalletId}
                    loadingDestinationWallet={transactionForm.loadingDestinationWallet}
                    onSelectDestinationEmployee={transactionForm.onSelectDestinationEmployee}
                />
            </FilterBottomSheet>

            <TransactionStatusOverlay status={transactionOverlayStatus} />
        </React.Fragment>
    );
};

export default WalletDashboardContainer;