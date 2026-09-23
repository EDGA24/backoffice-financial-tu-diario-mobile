import L from 'leaflet';

let styleInjected = false;

// Inyecta el CSS del marcador "pulso" una sola vez por sesión — más liviano
// que traer una librería de iconos solo para esto, y evita depender de un
// archivo .css global que Vite tendría que resolver por su cuenta.
const injectPulseStyles = () => {
    if (styleInjected || typeof document === 'undefined') return;
    styleInjected = true;

    const style = document.createElement('style');
    style.textContent = `
        .pulse-marker { position: relative; width: 26px; height: 26px; }
        .pulse-marker-ring {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: rgba(30, 60, 114, 0.35);
            animation: pulse-marker-anim 2.2s ease-out infinite;
        }
        .pulse-marker-dot {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 16px;
            height: 16px;
            margin: -8px 0 0 -8px;
            border-radius: 50%;
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            border: 2.5px solid #ffffff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        }
        @keyframes pulse-marker-anim {
            0% { transform: scale(0.35); opacity: 0.9; }
            100% { transform: scale(2.6); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
};

// Marcador de "punto vivo" (dot + anillo animado) en vez del pin clásico de
// Leaflet — para la vista de solo-lectura, donde queremos que se sienta como
// una foto elegante de la ubicación, no como el mapa de captura.
export const createPulsingLocationIcon = (): L.DivIcon => {
    injectPulseStyles();
    return L.divIcon({
        className: '',
        html: '<div class="pulse-marker"><div class="pulse-marker-ring"></div><div class="pulse-marker-dot"></div></div>',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
    });
};
