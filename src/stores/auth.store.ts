import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware';
import axios from "../shared/utils/axiosUtils"
import { get } from 'lodash';
import { LoginRequest } from '@/types/LoginRequest';
import { LoginResponse, LoginResponseUser } from '@/types/LoginResponse';
import { SearchEmployeesRequest } from '@/types/SearchEmployeesRequest';
import { EmployeeUser } from '@/types/EmployeeUser';
import { useWalletLedgerStore } from './walletLedger.store';
import { isJwtExpired } from '@/shared/utils/jwtUtils';

// const BASE_URL = "https://credit-saas-gateway.onrender.com/authorizer";
const BASE_URL = "http://localhost:4000/authorizer";

interface AuthStoreState {
    token: string,
    user: LoginResponseUser | null,
    isAuthenticated: boolean,
    login: (request: LoginRequest) => Promise<void>,
    logout: () => void,
    searchEmployees: (request: SearchEmployeesRequest) => Promise<{ total: number, records: EmployeeUser[] }>
}

export const useAuthStore = create<AuthStoreState>()(
    persist(
        (set) => ({
            token: '',
            user: null,
            isAuthenticated: false,
            login: async (request: LoginRequest) => {
                const response = await axios.post<{ mensaje: string, data: LoginResponse }>(`${BASE_URL}/login`, request);
                const token = get(response.data, "data.token", "");
                const user = get(response.data, "data.user", null) as LoginResponseUser | null;

                localStorage.setItem("jwt", token);

                set(() => ({ token, user, isAuthenticated: true }));
                // Arranca la cartera local desde cero con el snapshot del login 
                if (user?.walletSnapshot) {
                    useWalletLedgerStore.getState().initFromLogin(user.walletSnapshot);
                }
            },
            logout: () => {
                localStorage.removeItem("jwt");
                set(() => ({ token: '', user: null, isAuthenticated: false }));
                useWalletLedgerStore.getState().reset();
            },
            searchEmployees: async (request: SearchEmployeesRequest) => {
                const response = await axios.post<{ total: number, records: EmployeeUser[] }>(`${BASE_URL}/searchEmployees`, request);
                return {
                    total: get(response.data, "data.total", 0),
                    records: get(response.data, "data.records", [])
                };
            }
        }),
        {
            name: "auth-storage",
            // localStorage : debe sobrevivir a cerrar/reabrir
            // la app, no solo recargar la pestaña — si no, el user se tendría
            // que loguear cada vez aunque el JWT siga vigente.
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                // Al reabrir la app: si el JWT persistido ya venció, cierra sesión
                // de una vez en vez de dejar que ProtectedRoute confíe en un
                // isAuthenticated:true que ya no sirve para llamar al backend.
                if (state?.token && isJwtExpired(state.token)) {
                    state.logout();
                }
            }
        }
    )
)