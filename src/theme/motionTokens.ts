// Tokens de movimiento — reutilizables en cualquier transición de la app
// (no solo la intro del Login). Valores puros (ms / cubic-bezier), sin
// depender de MUI ni de ninguna librería de animación.

export const motionEasing = {
    // Entradas suaves (fade/scale de elementos que aparecen).
    entrance: 'cubic-bezier(.2,.8,.2,1)',
    // Viajes/traslados de un punto a otro (FLIP).
    travel: 'cubic-bezier(.65,0,.25,1)',
    // Elementos que "suben" a su posición final (la hoja del formulario).
    rise: 'cubic-bezier(.2,.9,.25,1)',
} as const;

export const motionDuration = {
    logoFadeIn: 700,
    dotsPattern: 1300,
    logoTravel: 750,
    sheetRise: 850,
    staggerItem: 450,
    staggerGap: 70,
    crossfade: 220,
    reducedMotionFade: 200,
} as const;

// Offsets en ms desde que arranca la intro (t=0) — describen la coreografía
// completa en un solo lugar, para no tener números mágicos regados.
export const motionDelay = {
    dotsPatternStart: 900,
    logoTravelStart: 900,
    headerCrossfadeStart: 1500,
    sheetRiseStart: 1050,
    staggerStart: 1450,
} as const;

// Duración total aproximada de la intro (ms, ~1.9s con margen para que la
// última cascada termine de pintarse) — usada como timeout de seguridad que
// dispara onComplete si algo no encaja perfecto.
export const INTRO_TOTAL_DURATION_MS = 2150;
