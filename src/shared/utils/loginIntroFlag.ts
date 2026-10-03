// Bandera a nivel de módulo (no persistida) — vive mientras dure el proceso
// de JS. Por diseño: true la PRIMERA vez que se consulta en cada arranque en
// frío de la app, false después (aunque el usuario cierre sesión y vuelva a
// /login dentro de la misma sesión de la app, sin recargar).
let hasPlayedLoginIntro = false;

export const shouldPlayLoginIntro = (): boolean => {
    if (hasPlayedLoginIntro) return false;
    hasPlayedLoginIntro = true;
    return true;
};
