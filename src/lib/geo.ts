import type { GeoPoint } from "./types";

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/** Distância em km entre dois pontos (fórmula de Haversine). */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_KM * c;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

/** Desloca um ponto por um raio aproximado em km, em direção aleatória determinística. */
export function jitterPoint(center: GeoPoint, km: number, seedDeg: number): GeoPoint {
  const rad = toRad(seedDeg);
  const dLat = (km / EARTH_RADIUS_KM) * (180 / Math.PI) * Math.cos(rad);
  const dLng =
    ((km / EARTH_RADIUS_KM) * (180 / Math.PI) * Math.sin(rad)) /
    Math.cos(toRad(center.lat));
  return { lat: center.lat + dLat, lng: center.lng + dLng };
}
