import { DashboardTableCatalogEnum } from '@/shared/constants/catalogs/dashboard_table_catalogs'
import { create } from 'zustand'
import { persist } from 'zustand/middleware';
import { customSessionStorage } from './storages/session-storage.storage';
import axios from "../shared/utils/axiosUtils"
import { get } from 'lodash';
import { CreditTable } from '@/types/CreditTable';
import { Credits } from '@/types/Credits';
import { Customers } from '@/types/Customers';
import { SearchCreditsByEmployeeRequest } from '@/types/SearchCreditsByEmployeeRequest';
import { GetPaymentRequest } from '@/types/GetPaymentRequest';
import { PaymentTable } from '@/types/PaymentTable';
import { GetWalletRequest } from '@/types/GetWalletRequest';
import { WalletTable } from '@/types/WalletTable';
import { GetCreditTotalsRequest, GetCreditTotalsResponse } from '@/types/GetCreditTotalsRequest';

const BASE_URL = "https://credit-saas-gateway.onrender.com/credits";
// const BASE_URL = "http://localhost:4001/credits";

interface CreditStoreState {
    creditsData: {
        records: CreditTable[],
        total: number,
        entityName: DashboardTableCatalogEnum
    },
    setCreditsData: (value: {
        records: CreditTable[],
        total: number,
        entityName: DashboardTableCatalogEnum
    }) => void,
    searchCreditsByEmployeeData: (request: SearchCreditsByEmployeeRequest) => Promise<void>,
    createCredit: (request: { customer?: Customers, credit: Credits }) => Promise<boolean>,
    createPayment: (request: { creditId: string, customerId: string, total: number }) => Promise<boolean>,
    getPaymentByCredit: (request: GetPaymentRequest) => Promise<{ total: number, records: PaymentTable[] }>,
    getWalletInfo: (request: GetWalletRequest) => Promise<{ total: number, records: WalletTable[] }>,
    getCreditTotals: (request: GetCreditTotalsRequest) => Promise<GetCreditTotalsResponse>
}

export const useCreditStore = create<CreditStoreState>()(
    persist(
        (set) => ({
            creditsData: { records: [], total: 0, entityName: DashboardTableCatalogEnum.credits },
            setCreditsData: (value) => set(() => ({ creditsData: value })),
            searchCreditsByEmployeeData: async (request: SearchCreditsByEmployeeRequest) => {
                const response = await axios.post<{ total: number, records: any[] }>(`${BASE_URL}/searchCreditsByEmployee`, request);
                set(() => ({
                    creditsData: {
                        records: get(response.data, "data.documents", []), 
                        total: get(response.data, "data.totalDocuments", 0),
                        entityName: DashboardTableCatalogEnum.credits
                    }
                }))
            },
            createCredit: async (request: { customer?: Customers, credit: Credits }) => {
                const response = await axios.post<{ data: boolean }>(`${BASE_URL}/createCreditsByEmployee`, request);
                return get(response.data, "data", false);
            },
            createPayment: async (request: { creditId: string, customerId: string, total: number }) => {
                const response = await axios.post<{ data: boolean }>(`${BASE_URL}/createPaymentsByEmployee`, request);
                return get(response.data, "data", false);
            },
            getPaymentByCredit: async (request: GetPaymentRequest) => {
                const response = await axios.post<{ total: number, records: PaymentTable[] }>(`${BASE_URL}/getPaymentyByCredit`, request);
                return {
                    total: get(response.data, "data.total", 0),
                    records: get(response.data, "data.records", [])
                };
            },
            getWalletInfo: async (request: GetWalletRequest) => {
                const response = await axios.post<{ total: number, records: WalletTable[] }>(`${BASE_URL}/getWalletInfo`, request);
                return {
                    total: get(response.data, "data.total", 0),
                    records: get(response.data, "data.records", [])
                };
            },
            getCreditTotals: async (request: GetCreditTotalsRequest) => {
                const response = await axios.post<{ data: GetCreditTotalsResponse[] }>(`${BASE_URL}/getCreditTotals`, request);
                return {
                    totalToCollect: get(response.data, "data[0].totalToCollect", 0),
                    totalCollected: get(response.data, "data[0].totalCollected", 0),
                    totalPending: get(response.data, "data[0].totalPending", 0)
                };
            }
        }),
        {
            name: "credit-storage",
            storage: customSessionStorage
        }
    )
)