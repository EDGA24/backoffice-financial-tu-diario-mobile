import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Vite no resuelve los iconos default de Leaflet desde su CSS (rutas
// relativas al paquete, no al build) — sin esto el marker se ve como un
// cuadro roto. Se reasignan una sola vez a nivel de módulo; cada archivo que
// use un <Marker> debe importar este módulo por su efecto secundario.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
