import React, { useEffect, useState } from 'react';
import { useController } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { Box, Button, Typography } from '@mui/material';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import type L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@/shared/utils/leafletIconFix';
// Plugin de Capacitor en vez de navigator.geolocation crudo: en el navegador
// usa la misma Web API por debajo, pero dentro del APK dispara el diálogo
// nativo de permiso de Android (navigator.geolocation solo, sin este plugin
// y sin permisos en el manifest, falla en silencio dentro del WebView).
import { Geolocation } from '@capacitor/geolocation';

// Centro por default cuando no hay ubicación capturada ni GPS disponible
// (Tuxtla Gutiérrez, Chiapas — zona de operación de Tu Diario).
const DEFAULT_CENTER: [number, number] = [16.7535, -93.115];
const DEFAULT_ZOOM = 15;

// El primer fix de geolocalización en Android suele venir de red/celda
// (puede fallar por cientos de km) mientras el chip GPS real sigue
// "calentando" — solo lo damos por bueno cuando el propio navegador reporta
// un margen de error razonable. Mientras tanto seguimos escuchando updates.
const ACCEPTABLE_ACCURACY_METERS = 50;
// Tope de espera por una lectura precisa antes de rendirnos y quedarnos con
// lo último que haya llegado (mejor una ubicación aproximada que ninguna).
const MAX_LOCATE_WAIT_MS = 15000;
// Zoom nivel-calle: se aplica solo cuando ya hay una lectura confiable, para
// que se vea claramente la cuadra/casa exacta, no solo la colonia.
const PRECISE_ZOOM = 50;
// Zoom intermedio mientras el GPS todavía está afinando (lectura burda).
const APPROXIMATE_ZOOM = 20;

export interface LocationPickerFieldProps {
  control: Control<any>;
  latitudeName: string;
  longitudeName: string;
  label?: string;
}

interface DraggableMarkerProps {
  position: [number, number];
  onChange: (lat: number, lng: number) => void;
}

// Marker que se puede arrastrar y también se reposiciona al tocar el mapa —
// las dos formas de "manipularlo en pantalla" que se pidieron.
const DraggableMarker: React.FC<DraggableMarkerProps> = ({ position, onChange }) => {
  useMapEvents({
    click: (event) => {
      onChange(event.latlng.lat, event.latlng.lng);
    },
  });

  return (
    <Marker
      position={position}
      draggable
      eventHandlers={{
        dragend: (event) => {
          const marker = event.target as L.Marker;
          const { lat, lng } = marker.getLatLng();
          onChange(lat, lng);
        },
      }}
    />
  );
};

interface MapViewState {
  position: [number, number];
  zoom: number;
}

// MapContainer solo usa su prop center/zoom AL MONTARSE — cambios
// posteriores no mueven la vista solos (limitación conocida de
// react-leaflet). Este componente usa el mapa ya montado para hacer
// pan+zoom explícito cada vez que llega una lectura GPS nueva, así el
// usuario ve el mapa "seguir" al punto en vez de quedarse pegado en la
// primera lectura (burda) mientras el GPS sigue afinando.
const MapViewController: React.FC<{ view: MapViewState | null }> = ({ view }) => {
  const map = useMap();
  useEffect(() => {
    if (!view) return;
    map.setView(view.position, view.zoom, { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view?.position[0], view?.position[1], view?.zoom]);
  return null;
};

export const LocationPickerField: React.FC<LocationPickerFieldProps> = ({
  control,
  latitudeName,
  longitudeName,
  label = 'Ubicación',
}) => {
  const [expanded, setExpanded] = useState(false);
  const [locating, setLocating] = useState(false);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  // Separado del valor del form a propósito: solo lo actualiza el GPS, nunca
  // arrastrar/tocar el mapa a mano — así el usuario puede mover el marcador
  // libremente sin que la vista se le "jale" de vuelta en cada lectura.
  const [mapView, setMapView] = useState<MapViewState | null>(null);

  const { field: latField } = useController({ name: latitudeName, control });
  const { field: lngField } = useController({ name: longitudeName, control });

  const hasLocation = Boolean(latField.value) && Boolean(lngField.value);

  const position: [number, number] = hasLocation
    ? [Number(latField.value), Number(lngField.value)]
    : DEFAULT_CENTER;

  const setPosition = (lat: number, lng: number) => {
    latField.onChange(lat.toFixed(6));
    lngField.onChange(lng.toFixed(6));
  };

  // Al abrir el mapa por primera vez sin ubicación capturada, intenta centrar
  // en el GPS del dispositivo (el cobrador normalmente está parado en el
  // domicilio del cliente al momento de capturar). Si falla o lo niega, se
  // queda en DEFAULT_CENTER y el usuario mueve el marcador a mano.
  //
  // Usa watchPosition (no getCurrentPosition) porque un solo request suele
  // resolver con el primer fix disponible — casi siempre uno burdo por
  // red/celda — antes de que el GPS real termine de sincronizar. Aquí se
  // escuchan varias lecturas y el marcador se va corrigiendo en pantalla
  // hasta que la precisión reportada (accuracy, en metros) es aceptable.
  useEffect(() => {
    if (!expanded || hasLocation) return;

    setLocating(true);
    setAccuracyMeters(null);
    setMapView(null);
    let settled = false;
    // El efecto puede desmontarse/re-ejecutarse antes de que la promesa de
    // watchPosition resuelva (nos da el watchId de forma asíncrona) — sin
    // esta bandera, un watch "viejo" podría seguir vivo y seguir escribiendo
    // en el form después de que el usuario ya cerró el mapa.
    let cancelled = false;
    let watchId: string | null = null;

    const finish = () => {
      if (settled) return;
      settled = true;
      setLocating(false);
      clearTimeout(maxWaitTimer);
      if (watchId) Geolocation.clearWatch({ id: watchId }).catch(() => { });
    };

    Geolocation.watchPosition(
      { enableHighAccuracy: true, maximumAge: 0, timeout: MAX_LOCATE_WAIT_MS },
      (geoPosition, error) => {
        if (cancelled) return;
        if (!geoPosition) {
          if (error) finish();
          return;
        }
        const { latitude, longitude, accuracy } = geoPosition.coords;
        const isPrecise = accuracy <= ACCEPTABLE_ACCURACY_METERS;
        setPosition(latitude, longitude);
        setAccuracyMeters(accuracy);
        setMapView({
          position: [latitude, longitude],
          zoom: isPrecise ? PRECISE_ZOOM : APPROXIMATE_ZOOM,
        });
        if (isPrecise) finish();
      }
    ).then((id) => {
      if (cancelled) {
        Geolocation.clearWatch({ id }).catch(() => { });
        return;
      }
      watchId = id;
    }).catch(() => finish());

    // Si nunca llega una lectura suficientemente precisa (o si piden permiso
    // y nunca responden), nos quedamos con la última que haya entrado en vez
    // de dejar "Obteniendo tu ubicación…" colgado para siempre.
    const maxWaitTimer = setTimeout(finish, MAX_LOCATE_WAIT_MS);

    return () => {
      cancelled = true;
      clearTimeout(maxWaitTimer);
      if (watchId) Geolocation.clearWatch({ id: watchId }).catch(() => { });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Button
        onClick={() => setExpanded((prev) => !prev)}
        startIcon={<RoomOutlinedIcon />}
        variant={hasLocation ? 'outlined' : 'contained'}
        sx={{ borderRadius: 3, alignSelf: 'flex-start', textTransform: 'none' }}
      >
        {hasLocation
          ? expanded ? 'Ocultar mapa' : 'Editar ubicación'
          : expanded ? 'Ocultar mapa' : 'Agregar ubicación'}
      </Button>

      {expanded && (
        <Box
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            height: 280,
            position: 'relative',
          }}
        >
          <MapContainer
            center={position}
            zoom={hasLocation ? PRECISE_ZOOM : DEFAULT_ZOOM}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <DraggableMarker position={position} onChange={setPosition} />
            <MapViewController view={mapView} />
          </MapContainer>
        </Box>
      )}

      {expanded && (
        <Typography variant="caption" color="text.secondary">
          {locating
            ? `Afinando tu ubicación actual…${accuracyMeters ? ` (±${Math.round(accuracyMeters)} m)` : ''}`
            : 'Toca el mapa o arrastra el marcador para ajustar el punto exacto.'}
        </Typography>
      )}

      {hasLocation && (
        <Typography variant="caption" color="text.secondary">
          {label}: {Number(latField.value).toFixed(6)}, {Number(lngField.value).toFixed(6)}
        </Typography>
      )}
    </Box>
  );
};

export default LocationPickerField;
