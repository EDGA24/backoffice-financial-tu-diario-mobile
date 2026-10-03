import { useEffect, useState } from 'react';

// Mensajes que rotan mientras un paso está "activo" — le dan textura al
// proceso (que se sienta como que de verdad está pasando algo) en vez de
// solo un spinner mudo y estático.
export const useRotatingMessage = (active: boolean, messages: string[], intervalMs = 900): string | null => {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        if (!active) return;
        setIndex(0);
        if (messages.length <= 1) return;
        const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), intervalMs);
        return () => clearInterval(id);
    }, [active, messages, intervalMs]);
    return active ? messages[index] : null;
};
