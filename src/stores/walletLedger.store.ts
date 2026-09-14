import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { WalletSnapshot } from '@/types/LoginResponse';
/**
 * Cartera local: espejo en el front de firmBalance/pendingIncomesBalance/
 * pendingExpensesBalance de la wallet del user logueado. Reglas:
 *  - Al iniciar sesión, arranca con el walletSnapshot que trae el login.
 *  - Cada vez que se consulta /getWalletInfo (la wallet PROPIA), el servidor
 *    reemplaza por completo lo que hubiera local — nunca se mezcla, se prioriza
 *    siempre lo que venga del servidor.
 *  - Al crear un pago o un crédito, se ajusta local 
 *    (sin esperar a volver a consultar el servidor) — ese ajuste se pierde
 *    en cuanto vuelva a llegar un syncFromServer.
 */
interface WalletLedgerState {
    firmBalance: number;
    pendingIncomesBalance: number;
    pendingExpensesBalance: number;
    // Epoch millis del último dato con el que se sincronizó (login o getWalletInfo).
    queriedAt: number | null;
    initFromLogin: (snapshot: WalletSnapshot) => void;
    syncFromServer: (wallet: {
        firmBalance?: number;
        pendingIncomesBalance?: number;
        pendingExpensesBalance?: number;
    }) => void;
    // Pago cobrado por el user logueado -> entra a SU wallet como ingreso pendiente
    // (misma regla que TRANSACTION_PENDING_OPERATION_WALLET_BUILD.INCOMES en el backend).
    applyLocalPayment: (amount: number) => void;
    // Crédito desembolsado por el user logueado -> sale de SU wallet como egreso pendiente
    // (misma regla que TRANSACTION_PENDING_OPERATION_WALLET_BUILD.EXPENSES en el backend).
    applyLocalCredit: (amount: number) => void;
    reset: () => void;
}

const EMPTY_LEDGER = {
    firmBalance: 0,
    pendingIncomesBalance: 0,
    pendingExpensesBalance: 0,
    queriedAt: null as number | null,
};

export const useWalletLedgerStore = create<WalletLedgerState>()(
    persist(
        (set) => ({
            ...EMPTY_LEDGER,
            initFromLogin: (snapshot) =>
                set(() => ({
                    firmBalance: snapshot.firmBalance,
                    pendingIncomesBalance: snapshot.pendingIncomesBalance,
                    pendingExpensesBalance: snapshot.pendingExpensesBalance,
                    queriedAt: snapshot.queriedAt,
                })),
            syncFromServer: (wallet) =>
                set(() => ({
                    firmBalance: wallet.firmBalance ?? 0,
                    pendingIncomesBalance: wallet.pendingIncomesBalance ?? 0,
                    pendingExpensesBalance: wallet.pendingExpensesBalance ?? 0,
                    queriedAt: Date.now(),
                })),
            applyLocalPayment: (amount) =>
                set((state) => ({
                    pendingIncomesBalance: state.pendingIncomesBalance + amount,
                })),
            applyLocalCredit: (amount) =>
                set((state) => ({
                    pendingExpensesBalance: state.pendingExpensesBalance + amount,
                })),
            reset: () => set(() => ({ ...EMPTY_LEDGER })),
        }),
        {
            name: 'wallet-ledger-storage',
            // localStorage: consistente con auth.store — debe sobrevivir cerrar
            // y reabrir la app mientras la sesión siga vigente, no resetear a $0.
            storage: createJSONStorage(() => localStorage),
        }
    )
);
