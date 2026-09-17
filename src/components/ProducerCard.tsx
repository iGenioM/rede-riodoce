"use client";

import Link from "next/link";
import { MapPin, BadgeCheck } from "lucide-react";
import type { Producer } from "@/lib/types";
import { Avatar, RatingStars } from "@/components/ui";
import { ProductImage } from "@/components/ui/ProductImage";
import { formatDistance } from "@/lib/geo";

export function ProducerCard({
  producer,
  distanceKm,
  layout = "row",
}: {
  producer: Producer;
  distanceKm?: number;
  layout?: "row" | "grid";
}) {
  if (layout === "grid") {
    return (
      <Link
        href={`/produtores/${producer.id}`}
        className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(18,32,26,0.08)] active:scale-[0.98] transition-transform"
      >
        <ProductImage seed={producer.coverSeed} className="h-20 w-full" rounded="rounded-none" emojiClassName="text-4xl" />
        <div className="flex items-center gap-2 p-3">
          <Avatar seed={producer.avatarSeed} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink-900">{producer.farmName}</p>
            <div className="flex items-center gap-1">
              <RatingStars rating={producer.rating} size={11} />
              <span className="text-[11px] text-ink-500">({producer.ratingCount})</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/produtores/${producer.id}`}
      className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_1px_3px_rgba(18,32,26,0.08)] active:scale-[0.99] transition-transform"
    >
      <Avatar seed={producer.avatarSeed} size={52} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="truncate text-sm font-bold text-ink-900">{producer.farmName}</p>
          {producer.verified && <BadgeCheck size={14} className="shrink-0 text-sky" />}
        </div>
        <p className="truncate text-xs text-ink-500">{producer.name} · {producer.city}/{producer.state}</p>
        <div className="mt-1 flex items-center gap-2">
          <RatingStars rating={producer.rating} size={12} showValue count={producer.ratingCount} />
        </div>
      </div>
      {typeof distanceKm === "number" && (
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="inline-flex items-center gap-0.5 rounded-full bg-cream-200 px-2 py-1 text-[11px] font-bold text-forest-800">
            <MapPin size={11} />
            {formatDistance(distanceKm)}
          </span>
        </div>
      )}
    </Link>
  );
}
