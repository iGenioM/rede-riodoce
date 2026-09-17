"use client";

import dynamic from "next/dynamic";

export const MapView = dynamic(
  () => import("./InteractiveMap").then((m) => m.InteractiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-cream-200">
        <div className="flex flex-col items-center gap-2 text-ink-500">
          <span className="text-2xl animate-pulse">🗺️</span>
          <span className="text-xs font-semibold">Carregando mapa…</span>
        </div>
      </div>
    ),
  }
);

export type { MapMarker } from "./InteractiveMap";
