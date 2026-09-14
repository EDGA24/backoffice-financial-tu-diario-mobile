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
import { SearchCustomersByEmployeeRequest } from '@/types/SearchCustomersByEmployeeRequest';
import { GetPaymentRequest } from '@/types/GetPaymentRequest';
import { PaymentTable } from '@/types/PaymentTable';
import { GetWalletRequest } from '@/types/GetWalletRequest';
import { WalletTable } from '@/types/WalletTable';
import { GetCreditTotalsRequest, GetCreditTotalsResponse } from '@/types/GetCreditTotalsRequest';
import { useWalletLedgerStore } from './walletLedger.store';
import { useAuthStore } from './auth.store';

// const BASE_URL = "https://credit-saas-gateway.onrender.com/credits";
const BASE_URL = "http://localhost:4001/credits";

// Resultado del autocomplete de clientes — Customers no trae _id (es el
// shape para crear un cliente), este sí lo necesita para poder seleccionarlo.
export interface CustomerSearchResult extends Customers {
    _id: string;
}

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
    searchCustomersByEmployee: (request: SearchCustomersByEmployeeRequest) => Promise<{ total: number, records: CustomerSearchResult[] }>,
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
            searchCustomersByEmployee: async (request: SearchCustomersByEmployeeRequest) => {
                const response = await axios.post<{ total: number, records: CustomerSearchResult[] }>(`${BASE_URL}/searchCustomersByEmployee`, request);
                return {
                    total: get(response.data, "data.total", 0),
                    records: get(response.data, "data.records", [])
                };
            },
            createCredit: async (request: { customer?: Customers, credit: Credits }) => {
                const response = await axios.post<{ data: boolean }>(`${BASE_URL}/createCreditsByEmployee`, request);
                const ok = get(response.data, "data", false);
                // Optimista: el desembolso sale de la wallet del user logueado,
                // como egreso pendiente — no espera a volver a consultar el servidor.
                if (ok) {
                    useWalletLedgerStore.getState().applyLocalCredit(get(request, "credit.creditAmount", 0));
                }
                return ok;
            },
            createPayment: async (request: { creditId: string, customerId: string, total: number }) => {
                console.log("Total---:", request.total);
                const response = await axios.post<{ data: boolean }>(`${BASE_URL}/createPaymentsByEmployee`, request);
                const ok = get(response.data, "data", false);
                // Optimista: el cobro entra a la wallet del user logueado,
                // como ingreso pendiente — no espera a volver a consultar el servidor.
                if (ok) {
                    useWalletLedgerStore.getState().applyLocalPayment(request.total);
                }
                return ok;
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
                const records: WalletTable[] = get(response.data, "data.records", []);

                // Solo sincroniza la cartera local cuando la wallet que regresó es la
                // PROPIA del user logueado (este mismo endpoint también se usa para
                // resolver la wallet de OTRO empleado, ej. al elegir destino de una
                // transferencia — esa no debe tocar la cartera local de quien está logueado).
                const ownWalletId = useAuthStore.getState().user?.walletId;
                const wallet = records[0];
                if (ownWalletId && wallet?._id === ownWalletId) {
                    useWalletLedgerStore.getState().syncFromServer(wallet);
                }

                return {
                    total: get(response.data, "data.total", 0),
                    records
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