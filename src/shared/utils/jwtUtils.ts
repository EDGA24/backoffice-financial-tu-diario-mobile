import { get } from 'lodash';

// Decodifica el payload de un JWT sin verificar la firma (eso ya lo hace el
// backend) — solo para leer el "exp" y saber si conviene mandar al usuario a
// /login antes de intentar cualquier request.
export const isJwtExpired = (token: string): boolean => {
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        const expMs = get(decoded, 'exp', 0) * 1000;
        return !expMs || expMs <= Date.now();
    } catch {
        return true;
    }
};
