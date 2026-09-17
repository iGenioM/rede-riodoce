"use client";

import { use, useMemo, useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import Link from "next/link";
import { MapPin, BadgeCheck, Plus, ArrowUpDown } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, Badge, EmptyState, RatingStars } from "@/components/ui";
import { ProductImage } from "@/components/ui/ProductImage";
import { useProductsStore } from "@/lib/store/useProductsStore";
import { useProducersStore } from "@/lib/store/useProducersStore";
import { useCartStore } from "@/lib/store/useCartStore";
import { useToastStore } from "@/lib/store/useToastStore";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { formatBRL } from "@/lib/utils";
import { distanceKm, formatDistance } from "@/lib/geo";
import { CATEGORIES } from "@/lib/mockData";
import { getProductTypeSummary } from "@/lib/offers";
import { cn } from "@/lib/utils";
import { unitLabel } from "@/lib/units";

type SortKey = "preco" | "distancia";

/** Página agregada: mostra TODAS as ofertas de um mesmo tipo de produto
 * (ex.: "Alface"), vindas de produtores diferentes, para o comprador
 * comparar preço, distância e reputação antes de escolher. */
export default function ProdutoTipoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { push, replace, back } = useNavigate();
  const [sort, setSort] = useState<SortKey>("preco");

  const products = useProductsStore((s) => s.products);
  const producers = useProducersStore((s) => s.producers);
  const addItem = useCartStore((s) => s.addItem);
  const show = useToastStore((s) => s.show);
  const buyerLocation = useSessionStore((s) => s.buyerAddress.location);

  const summary = useMemo(() => getProductTypeSummary(products, id), [products, id]);

  const offersWithMeta = useMemo(() => {
    if (!summary) return [];
    const list = summary.offers
      .filter((o) => o.active)
      .map((offer) => {
        const producer = producers.find((p) => p.id === offer.producerId);
        const dist = producer ? distanceKm(buyerLocation, producer.location) : 9999;
        return { offer, producer, dist };
      })
      .filter((x) => x.producer);
    return [...list].sort((a, b) =>
      sort === "preco" ? a.offer.pricePerUnit - b.offer.pricePerUnit : a.dist - b.dist
    );
  }, [summary, producers, buyerLocation, sort]);

  if (!summary || offersWithMeta.length === 0) {
    return (
      <AppShell hideNav>
        <PageHeader title="Produto" onBack={() => back()} />
        <EmptyState title="Nenhuma oferta encontrada" description="Esse produto não está mais disponível." />
      </AppShell>
    );
  }

  const category = CATEGORIES.find((c) => c.id === summary.categoryId);

  function quickAdd(e: React.MouseEvent, productId: string, producerId: string, name: string) {
    e.preventDefault();
    e.stopPropagation();
    addItem(productId, producerId, 1);
    show(`${name} adicionado ao carrinho`, "success");
  }

  return (
    <AppShell hideNav>
      <div className="pb-8">
        <div className="relative">
          <ProductImage
            seed={summary.imageSeed}
            className="h-56 w-full"
            rounded="rounded-none"
            emojiClassName="text-8xl"
            priority
            sizes="(max-width: 448px) 100vw, 448px"
          />
          <PageHeader title="" tone="overlay" onBack={() => back()} />
          {summary.organicAny && (
            <span className="absolute right-3 top-[calc(env(safe-area-inset-top)+12px)] z-10 rounded-full bg-white px-3 py-1 text-xs font-bold text-forest-700 shadow">
              🌱 Tem opção orgânica
            </span>
          )}
        </div>

        <div className="px-4 pt-5">
          {category && <Badge variant="outline">{category.name}</Badge>}
          <h1 className="mt-2 text-xl font-extrabold text-ink-900">{summary.name}</h1>
          <p className="mt-1 text-2xl font-extrabold text-forest-800">
            {summary.minPrice === summary.maxPrice ? (
              formatBRL(summary.minPrice)
            ) : (
              <>
                <span className="text-sm font-semibold text-ink-500">a partir de </span>
                {formatBRL(summary.minPrice)}
              </>
            )}
            <span className="text-sm font-semibold text-ink-500"> /{unitLabel(summary.unit)}</span>
          </p>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm font-bold text-ink-900">
              {summary.offerCount} {summary.offerCount === 1 ? "oferta disponível" : "ofertas disponíveis"}
            </p>
            <button
              onClick={() => setSort(sort === "preco" ? "distancia" : "preco")}
              className="flex items-center gap-1.5 rounded-full bg-cream-200 px-3 py-1.5 text-xs font-bold text-ink-700"
            >
              <ArrowUpDown size={12} />
              {sort === "preco" ? "Menor preço" : "Mais perto"}
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-2.5">
            {offersWithMeta.map(({ offer, producer, dist }) => (
              <Link
                key={offer.id}
                href={`/oferta/${offer.id}`}
                className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-sm active:scale-[0.99] transition-transform"
              >
                <Avatar seed={producer!.avatarSeed} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-sm font-bold text-ink-900">{producer!.farmName}</p>
                    {producer!.verified && <BadgeCheck size={12} className="shrink-0 text-sky" />}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <RatingStars rating={producer!.rating} size={10} showValue />
                    <span className="text-[11px] text-ink-400">·</span>
                    <span className="flex items-center gap-0.5 text-[11px] text-ink-500">
                      <MapPin size={10} />
                      {formatDistance(dist)}
                    </span>
                  </div>
                  {offer.organic && (
                    <span
                      className={cn(
                        "mt-1 inline-block rounded-full bg-forest-800/10 px-1.5 py-0.5 text-[10px] font-bold text-forest-700"
                      )}
                    >
                      Orgânico
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <p className="text-sm font-extrabold text-forest-800">
                    {formatBRL(offer.pricePerUnit)}
                    <span className="text-[10px] font-medium text-ink-500">/{unitLabel(offer.unit)}</span>
                  </p>
                  <button
                    onClick={(e) => quickAdd(e, offer.id, offer.producerId, offer.name)}
                    aria-label="Adicionar ao carrinho"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-900 text-lime-400 active:scale-90 transition-transform"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
