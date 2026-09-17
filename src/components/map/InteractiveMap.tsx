"use client";

import "leaflet/dist/leaflet.css";
import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import type { GeoPoint } from "@/lib/types";

export interface MapMarker {
  id: string;
  position: GeoPoint;
  emoji: string;
  colorFrom: string;
  colorTo: string;
  photoUrl?: string;
  popup?: React.ReactNode;
  onClick?: () => void;
}

function markerIcon({
  emoji,
  from,
  to,
  photoUrl,
  size = 48,
}: {
  emoji: string;
  from: string;
  to: string;
  photoUrl?: string;
  size?: number;
}) {
  const safeUrl = photoUrl
    ?.replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
  const photo = safeUrl
    ? `<img src="${safeUrl}" alt="" draggable="false" onerror="this.remove()" />`
    : "";
  return L.divIcon({
    html: `<div class="ceasa-map-pin" style="width:${size}px;height:${size}px;background:linear-gradient(135deg, ${from}, ${to});">
      <span>${emoji}</span>
      ${photo}
    </div>`,
    className: "ceasa-map-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function Recenter({ center, zoom }: { center: GeoPoint; zoom?: number }) {
  const map = useMap();
  useMemo(() => {
    map.setView([center.lat, center.lng], zoom ?? map.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng]);
  return null;
}

export function InteractiveMap({
  center,
  zoom = 11,
  markers,
  showUserMarker = true,
  radiusCircle,
  className,
  scrollWheelZoom = false,
}: {
  center: GeoPoint;
  zoom?: number;
  markers: MapMarker[];
  showUserMarker?: boolean;
  radiusCircle?: { center: GeoPoint; km: number; color?: string };
  className?: string;
  scrollWheelZoom?: boolean;
}) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      scrollWheelZoom={scrollWheelZoom}
      zoomControl={false}
      className={className}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      <Recenter center={center} zoom={zoom} />

      {radiusCircle && (
        <Circle
          center={[radiusCircle.center.lat, radiusCircle.center.lng]}
          radius={radiusCircle.km * 1000}
          pathOptions={{
            color: radiusCircle.color ?? "#a8e05f",
            fillColor: radiusCircle.color ?? "#a8e05f",
            fillOpacity: 0.12,
            weight: 2,
          }}
        />
      )}

      {showUserMarker && (
        <Marker
          position={[center.lat, center.lng]}
          icon={markerIcon({ emoji: "🏠", from: "#0d2118", to: "#1a4d32", size: 34 })}
        >
          <Popup>Seu endereço de entrega</Popup>
        </Marker>
      )}

      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.position.lat, m.position.lng]}
          icon={markerIcon({
            emoji: m.emoji,
            from: m.colorFrom,
            to: m.colorTo,
            photoUrl: m.photoUrl,
          })}
          eventHandlers={m.onClick ? { click: m.onClick } : undefined}
        >
          {m.popup && <Popup>{m.popup}</Popup>}
        </Marker>
      ))}
    </MapContainer>
  );
}
