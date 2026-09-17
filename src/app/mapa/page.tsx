"use client";

import { useMemo, useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { MapView, type MapMarker } from "@/components/map/MapView";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, RatingStars } from "@/components/ui";
import { useProducersStore } from "@/lib/store/useProducersStore";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { distanceKm, formatDistance } from "@/lib/geo";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

export default function MapaPage() {
  const { push, replace, back } = useNavigate();
  const producers = useProducersStore((s) => s.producers);
  const buyerLocation = useSessionStore((s) => s.buyerAddress.location);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const withDistance = useMemo(
    () =>
      [...producers]
        .map((p) => ({ producer: p, dist: distanceKm(buyerLocation, p.location) }))
        .sort((a, b) => a.dist - b.dist),
    [producers, buyerLocation]
  );

  const markers: MapMarker[] = withDistance.map(({ producer }) => ({
    id: producer.id,
    position: producer.location,
    emoji: producer.avatarSeed.emoji,
    colorFrom: producer.avatarSeed.from,
    colorTo: producer.avatarSeed.to,
    photoUrl: producer.avatarSeed.photoUrl,
    onClick: () => setSelectedId(producer.id),
  }));

  return (
    <AppShell hideNav>
      <div className="relative flex h-dvh flex-col">
        <div className="relative h-[52%] w-full">
          <MapView
            center={buyerLocation}
            zoom={10}
            markers={markers}
            className="h-full w-full"
          />
          <PageHeader title="" tone="overlay" onBack={() => push("/home")} />
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto rounded-t-3xl bg-cream-100 px-4 pb-24 pt-4 shadow-[0_-6px_24px_rgba(18,32,26,0.12)]">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-ink-300/40" />
          <p className="mb-3 px-1 text-xs font-bold uppercase tracking-wide text-ink-500">
            {withDistance.length} produtores na sua região
          </p>
          <div className="flex flex-col gap-2.5">
            {withDistance.map(({ producer, dist }) => (
              <button
                key={producer.id}
                onClick={() => {
                  setSelectedId(producer.id);
                  push(`/produtores/${producer.id}`);
                }}
                className={cn(
                  "flex items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-[0_1px_3px_rgba(18,32,26,0.08)] transition-transform active:scale-[0.99]",
                  selectedId === producer.id && "ring-2 ring-lime-500"
                )}
              >
                <Avatar seed={producer.avatarSeed} size={48} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink-900">{producer.farmName}</p>
                  <p className="truncate text-xs text-ink-500">{producer.city}/{producer.state}</p>
                  <RatingStars rating={producer.rating} size={11} showValue count={producer.ratingCount} />
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-cream-200 px-2.5 py-1.5 text-xs font-bold text-forest-800">
                  <MapPin size={12} />
                  {formatDistance(dist)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
