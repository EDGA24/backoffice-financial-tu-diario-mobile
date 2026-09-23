import { Box, Drawer, IconButton, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DirectionsRoundedIcon from '@mui/icons-material/DirectionsRounded';
import RoomRoundedIcon from '@mui/icons-material/RoomRounded';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '@/shared/utils/leafletIconFix';
import { createPulsingLocationIcon } from '@/shared/utils/pulsingLocationIcon';
import type { LoanSummary } from '../DashboardContacTable/DashboardContacTable';

export interface LocationViewModalProps {
    open: boolean;
    onClose: () => void;
    loan: LoanSummary | null;
}

const gradient = 'linear-gradient(135deg, #1e3c72, #2a5298)';

// Bottom sheet de solo-lectura: muestra dónde el cobrador capturó la
// ubicación del cliente (LocationPickerField, en el form de alta). A
// diferencia de ese picker, aquí el mapa es una foto fija — sin drag, sin
// zoom, sin click — y el único siguiente paso posible es salir a Google Maps
// a trazar la ruta.
export default function LocationViewModal({ open, onClose, loan }: LocationViewModalProps) {
    const latitude = loan?.ubication?.latitude;
    const longitude = loan?.ubication?.longitude;
    if (!open || !loan || !latitude || !longitude) return null;

    const position: [number, number] = [Number(latitude), Number(longitude)];
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        maxHeight: '85vh',
                        overflow: 'hidden',
                    },
                },
            }}
        >
            {/* Manija visual del bottom sheet */}
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.25, pb: 0.5 }}>
                <Box sx={{ width: 40, height: 4, borderRadius: 999, bgcolor: 'divider' }} />
            </Box>

            <Box sx={{ px: 2.5, pt: 1, pb: 3 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        mb: 2.5,
                    }}
                >
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(30, 60, 114, 0.35)',
                        }}
                    >
                        <RoomRoundedIcon sx={{ color: '#fff', fontSize: 24 }} />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: 16, lineHeight: 1.25 }}>
                            {loan.name}
                        </Typography>
                        {loan.address && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                {loan.address}
                            </Typography>
                        )}
                    </Box>

                    <IconButton onClick={onClose} size="small" sx={{ flexShrink: 0, mt: -0.5 }}>
                        <CloseRoundedIcon />
                    </IconButton>
                </Box>

                <Box
                    sx={{
                        position: 'relative',
                        borderRadius: 4,
                        overflow: 'hidden',
                        height: 300,
                        boxShadow: '0 6px 20px rgba(16, 24, 40, 0.14)',
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            // El mapa se ve pero no se toca: nada de arrastrar, hacer zoom
                            // ni clicks — es una foto fija de dónde quedó capturado el punto.
                            pointerEvents: 'none',
                            // Leaflet mete sus propios panes/controles con z-index alto
                            // (hasta 1000) — sin fijar un z-index numérico aquí, ese valor
                            // se escapa de este Box y tapa los overlays de abajo (el chip de
                            // coordenadas nunca se veía). zIndex:0 convierte a este Box en su
                            // propio stacking context, conteniendo todo lo de Leaflet adentro.
                            zIndex: 0,
                        }}
                    >
                        <MapContainer
                            center={position}
                            zoom={16}
                            style={{ width: '100%', height: '100%' }}
                            zoomControl={false}
                            dragging={false}
                            touchZoom={false}
                            doubleClickZoom={false}
                            scrollWheelZoom={false}
                            boxZoom={false}
                            keyboard={false}
                        >
                            <TileLayer
                                attribution='&copy; OpenStreetMap contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={position} icon={createPulsingLocationIcon()} />
                        </MapContainer>
                    </Box>

                    {/* Sombreado sutil para que el chip de coordenadas siempre
                        se lea, sin importar qué tan clara sea la textura del mapa ahí. */}
                    <Box
                        sx={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: 56,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0))',
                            pointerEvents: 'none',
                            zIndex: 1,
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            left: 12,
                            bottom: 12,
                            px: 1.25,
                            py: 0.5,
                            borderRadius: 999,
                            backgroundColor: 'rgba(0,0,0,0.55)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 1,
                        }}
                    >
                        <Typography sx={{ color: '#fff', fontSize: 11.5, fontWeight: 600, letterSpacing: 0.2 }}>
                            {Number(latitude).toFixed(6)}, {Number(longitude).toFixed(6)}
                        </Typography>
                    </Box>
                </Box>

                <Box
                    component="a"
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                        mt: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        py: 1.4,
                        borderRadius: 999,
                        background: gradient,
                        color: '#fff',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: 15,
                        boxShadow: '0 6px 16px rgba(30, 60, 114, 0.35)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        '&:active': {
                            transform: 'scale(0.98)',
                            boxShadow: '0 3px 10px rgba(30, 60, 114, 0.3)',
                        },
                    }}
                >
                    <DirectionsRoundedIcon />
                    Cómo llegar en Google Maps
                </Box>
            </Box>
        </Drawer>
    );
}
