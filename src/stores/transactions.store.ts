import { DashboardTableCatalogEnum } from '@/shared/constants/catalogs/dashboard_table_catalogs'
import { create } from 'zustand'
import { persist } from 'zustand/middleware';
import { customSessionStorage } from './storages/session-storage.storage';
import axios from "../shared/utils/axiosUtils"
import { get } from 'lodash';
import { SearchTransactionsRequest } from '@/types/SearchTransactionsRequest';
import { SearchTransactionsByUserRequest } from '@/types/SearchTransactionsByUserRequest';
import { TransactionTable } from '@/types/TransactionTable';
import { Transactions } from '@/types/Transactions';

const BASE_URL = "https://credit-saas-gateway.onrender.com/transactions";
// const BASE_URL = "http://localhost:4003/transactions";

// Mapea la transacción cruda del backend (con creditInfo[0] del join) a
// TransactionTable.creditBasicInfo — trae el _id real del crédito para poder
// navegar de la transacción a su crédito (mismo mapeo que ya usa el store web).
const mapTransactionRecords = (records: any[]): TransactionTable[] =>
    records.map((transaction: any) => {
        const creditInfo = get(transaction, 'creditInfo[0]');
        return {
            ...transaction,
            creditBasicInfo: creditInfo ? {
                creditId: get(creditInfo, '_id', ''),
                total: get(creditInfo, 'creditAmount', 0),
                amountPaid: get(creditInfo, 'amountPaid', 0),
                amountDue: get(creditInfo, 'amountDue', 0),
            } : undefined,
        };
    });

interface TransactionStoreState {
    transactionsData: {
        records: TransactionTable[],
        total: number,
        entityName: DashboardTableCatalogEnum
    },
    setTransactionsData: (value: {
        records: TransactionTable[],
        total: number,
        entityName: DashboardTableCatalogEnum
    }) => void,
    searchTransactionsData: (request: SearchTransactionsRequest) => Promise<void>,
    searchTransactionsByUserData: (request: SearchTransactionsByUserRequest) => Promise<void>,
    createTransactionByEmployee: (request: Transactions) => Promise<boolean>
}

export const useTransactionStore = create<TransactionStoreState>()(
    persist(
        (set) => ({
            transactionsData: { records: [], total: 0, entityName: DashboardTableCatalogEnum.transactions },
            setTransactionsData: (value) => set(() => ({ transactionsData: value })),
            searchTransactionsData: async (request: SearchTransactionsRequest) => {
                const response = await axios.post<{ total: number, records: any[] }>(`${BASE_URL}/searchTransactions`, request);
                set(() => ({
                    transactionsData: {
                        records: mapTransactionRecords(get(response.data, "data.records", [])),
                        total: get(response.data, "data.total", 0),
                        entityName: DashboardTableCatalogEnum.transactions
                    }
                }))
            },
            searchTransactionsByUserData: async (request: SearchTransactionsByUserRequest) => {
                 const response = await axios.post<{ total: number, records: any[] }>(`${BASE_URL}/SearchTransactionsByUser`, request);
                set(() => ({
                    transactionsData: {
                        records: mapTransactionRecords(get(response.data, "data.records", [])),
                        total: get(response.data, "data.total", 0),
                        entityName: DashboardTableCatalogEnum.transactions
                    }
                }))
            },
            createTransactionByEmployee: async (request: Transactions) => {
                const response = await axios.post<{ data: boolean }>(`${BASE_URL}/createTransactionByEmployee`, request);
                return get(response.data, "data", false);
            }
        }),
        {
            name: "transaction-storage",
            storage: customSessionStorage
        }
    )
)