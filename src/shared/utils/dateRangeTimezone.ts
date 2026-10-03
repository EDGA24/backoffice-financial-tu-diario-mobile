// Convierte un rango de fechas local (inputs tipo <input type="date">,
// "YYYY-MM-DD") a límites UTC correctos para filtrar por createdAt en el
// backend.
//
// El bug que esto resuelve: `new Date("YYYY-MM-DD")` SIEMPRE se interpreta
// como medianoche UTC (no medianoche local), sin importar en qué zona
// horaria esté el dispositivo — es el comportamiento del spec de Date, no un
// bug del servidor ni de la región donde corre (Render/Oregon no tiene
// nada que ver: `new Date()` en el backend siempre guarda el instante UTC
// correcto, Mongo también almacena todo en UTC).
//
// Como México (zona centro, sin horario de verano desde la reforma de 2022)
// está en UTC-6 todo el año, tratar esas fechas como si fueran UTC corre el
// rango 6 horas de más: se incluyen horas del día anterior al inicio, y se
// excluyen las últimas horas del día seleccionado al final — justo el
// síntoma reportado (movimientos de la tarde/noche que "no aparecen" al
// filtrar por el día en que se crearon).
//
// Si el negocio alguna vez opera en otra zona horaria, este es el único
// valor que hay que tocar en este archivo (y su equivalente en el repo del
// backoffice web, ya que son dos codebases independientes sin paquete
// compartido).
export const APP_UTC_OFFSET = '-06:00';

export const startOfDayLocal = (isoDate: string): number =>
    new Date(`${isoDate}T00:00:00.000${APP_UTC_OFFSET}`).getTime();

export const endOfDayLocal = (isoDate: string): number =>
    new Date(`${isoDate}T23:59:59.999${APP_UTC_OFFSET}`).getTime();
