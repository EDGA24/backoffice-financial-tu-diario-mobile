import { useEffect, useState } from 'react';

// Si el viewport visible se reduce más de este umbral respecto a la altura
// total de la ventana, asumimos que es el teclado virtual abriéndose (no un
// simple resize de la barra del navegador, que reduce mucho menos).
const KEYBOARD_HEIGHT_THRESHOLD_PX = 150;

// Detecta el teclado virtual con la API nativa `visualViewport` — sin
// @capacitor/keyboard (no instalado en el proyecto) ni otras dependencias
// nuevas. Reutilizable por cualquier pantalla que necesite colapsar UI
// cuando el teclado está abierto (no solo el Login).
export const useIsKeyboardOpen = (): boolean => {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    useEffect(() => {
        const viewport = window.visualViewport;
        if (!viewport) return;

        const handleResize = () => {
            const heightDiff = window.innerHeight - viewport.height;
            setIsKeyboardOpen(heightDiff > KEYBOARD_HEIGHT_THRESHOLD_PX);
        };

        viewport.addEventListener('resize', handleResize);
        handleResize();

        return () => viewport.removeEventListener('resize', handleResize);
    }, []);

    return isKeyboardOpen;
};

export default useIsKeyboardOpen;
