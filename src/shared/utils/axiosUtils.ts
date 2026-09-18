import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

const instance = axios.create({
    headers: {
        "Content-type": "application/json"
    },
    // Sin esto, si un servicio está caído y la conexión se queda "colgada"
    // en vez de rechazarse al instante, la promesa nunca resuelve ni
    // rechaza — el try/catch de quien llama nunca se dispara y la pantalla
    // se queda cargando para siempre, sin mostrar ningún error.
    timeout: 15000,
})

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("jwt");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// El JWT vence a las 8h (ver AuthorizerService.ts) pero el backend no guarda
// sesiones — la expiración solo se nota cuando llega un 401 en algún request.
// Sin esto, la app se queda mostrando lo último que cargó como si la sesión
// siguiera activa, aunque el token ya no sirva para nada.
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401 && useAuthStore.getState().isAuthenticated) {
            // logout() limpia token/user y pone isAuthenticated en false —
            // ProtectedRoute.tsx ya redirige solo a /login en cuanto eso pasa.
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default instance;