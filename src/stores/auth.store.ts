import { create } from 'zustand'
import { persist } from 'zustand/middleware';
import { customSessionStorage } from './storages/session-storage.storage';
import axios from "../shared/utils/axiosUtils"
import { get } from 'lodash';
import { LoginRequest } from '@/types/LoginRequest';
import { LoginResponse, LoginResponseUser } from '@/types/LoginResponse';
import { SearchEmployeesRequest } from '@/types/SearchEmployeesRequest';
import { EmployeeUser } from '@/types/EmployeeUser';

const BASE_URL = "https://credit-saas-gateway.onrender.com/authorizer";
// Local: se deja comentada para usarla más adelante.
// const BASE_URL = "http://localhost:4000/authorizer";

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
            },
            logout: () => {
                localStorage.removeItem("jwt");
                set(() => ({ token: '', user: null, isAuthenticated: false }));
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
            storage: customSessionStorage
        }
    )
)