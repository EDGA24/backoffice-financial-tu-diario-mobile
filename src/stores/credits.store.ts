import { create } from 'zustand'
import { persist } from 'zustand/middleware';
import { get } from 'lodash';
import { Credits } from '@/types/Credits';
// import axios from "../shared/utils/axiosUtils"
import { customSessionStorage } from './storages/session-storage.storage';

interface CreditStoreState {
    notification: {
        message: string,
        status: "info" | "warning" | "error"
    },
    createCredit: (request: Credits) => Promise<void>
}

export const useCreditStore = create<CreditStoreState>()(
    persist(
        (set) => ({
            notification: { message: "", status: "info" },
            createCredit: async (request: Credits) => {
                console.log("createCredit request (simulado):", request);
                // const response = await axios.post<{ mensaje: string, data: boolean }>(
                //     "http://localhost:4000/authorizer/createCredit",
                //     request
                // );

                await new Promise((resolve) => setTimeout(resolve, 800));
                const response = {
                    data: {
                        mensaje: "Crédito creado correctamente",
                        data: true,
                    }
                };
                set((state ) => ({
                    notification: {
                        message: get(response.data, "mensaje", ""),
                        status: get(response.data, "data", false) === true ? "info" : "error"
                    }
                }))
            }
        }),
        {
            name: "credit-storage",
            storage: customSessionStorage
        }
    )
)