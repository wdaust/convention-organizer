'use client';

import { MapContainer, ImageOverlay, Marker, Popup, useMapEvents, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState } from 'react';

// Color palette
const COLORS = {
    red: '#EF4444',
    orange: '#F97316',
    yellow: '#EAB308',
    green: '#22C55E',
    teal: '#14B8A6',
    blue: '#3B82F6',
    indigo: '#6366F1',
    purple: '#A855F7',
    pink: '#EC4899',
    gray: '#6B7280',
};

// Create custom numbered circle marker
function createNumberedIcon(number: number | string, color: string = 'blue') {
    const colorHex = COLORS[color as keyof typeof COLORS] || COLORS.blue;

    return L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: ${colorHex};
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 16px;
                color: white;
                cursor: pointer;
            ">
                ${number}
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
    });
}

interface Location {
    id: string;
    name: string;
    lat: number;
    lng: number;
    color?: string;
    category?: string;
    level?: string;
}

interface MapProps {
    locations: Location[];
    onLocationUpdate: (id: string, lat: number, lng: number) => void;
    onMapClick: (lat: number, lng: number) => void;
    onPinClick: (location: Location) => void;
    editMode: boolean;
    currentLevel: string;
    levelImages: Record<string, string>;
}

// Component to handle map click events
function MapClickHandler({ onClick, enabled }: { onClick: (lat: number, lng: number) => void; enabled: boolean }) {
    useMapEvents({
        click: (e) => {
            if (enabled) {
                onClick(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
}

function LocationMarker({
    location,
    onUpdate,
    onClick,
    editMode
}: {
    location: Location;
    onUpdate: (id: string, lat: number, lng: number) => void;
    onClick: (location: Location) => void;
    editMode: boolean;
}) {
    const [position, setPosition] = useState<L.LatLngExpression>([location.lat, location.lng]);

    const eventHandlers = {
        dragend(e: any) {
            if (!editMode) return;
            const marker = e.target;
            if (marker != null) {
                const { lat, lng } = marker.getLatLng();
                setPosition([lat, lng]);
                onUpdate(location.id, lat, lng);
            }
        },
        click() {
            onClick(location);
        },
    };

    const displayNumber = location.name.match(/\d+/)?.[0] || location.name.substring(0, 2);

    const icon = createNumberedIcon(
        displayNumber,
        location.color || 'blue'
    );

    return (
        <Marker
            position={position}
            draggable={editMode}
            eventHandlers={eventHandlers}
            icon={icon}
        >
            <Popup>
                <div>
                    <strong>{location.name}</strong>
                    {location.level && <div>Level: {location.level}</div>}
                    {location.color && <div>Color: {location.color}</div>}
                    {location.category && <div>Category: {location.category}</div>}
                </div>
            </Popup>
        </Marker>
    );
}

export default function Map({ locations, onLocationUpdate, onMapClick, onPinClick, editMode, currentLevel, levelImages }: MapProps) {
    const arenaImageUrl = levelImages[currentLevel] || levelImages['Arena Level'] || '/arena-floor.png';
    const bounds: L.LatLngBoundsExpression = [[-100, -68.66], [100, 68.66]];
    const center: L.LatLngExpression = [0, 0];

    return (
        <MapContainer
            center={center}
            zoom={1}
            scrollWheelZoom={true}
            style={{ height: '100vh', width: '100%' }}
            crs={L.CRS.Simple}
            zoomControl={false}
        >
            <ImageOverlay url={arenaImageUrl} bounds={bounds} />
            <ZoomControl position="bottomright" />
            <MapClickHandler onClick={onMapClick} enabled={editMode} />

            {locations.map((loc) => (
                <LocationMarker
                    key={loc.id}
                    location={loc}
                    onUpdate={onLocationUpdate}
                    onClick={onPinClick}
                    editMode={editMode}
                />
            ))}
        </MapContainer>
    );
}
