"use client";

import { useEffect, useMemo } from "react";
import { prefetchImageUrls } from "@/lib/prefetchImages";
import { AppShell } from "@/components/layout/AppShell";
import { BuyerHomeHeader } from "@/components/layout/BuyerHomeHeader";
import { SectionHeader } from "@/components/ui";
import { CategoryPill } from "@/components/CategoryPill";
import { ProductCard } from "@/components/ProductCard";
import { ProducerCard } from "@/components/ProducerCard";
import { CATEGORIES } from "@/lib/mockData";
import { useProductsStore } from "@/lib/store/useProductsStore";
import { useProducersStore } from "@/lib/store/useProducersStore";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { distanceKm } from "@/lib/geo";
import { groupProductsByType } from "@/lib/offers";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function BuyerHomePage() {
  const products = useProductsStore((s) => s.products);
  const producers = useProducersStore((s) => s.producers);
  const buyerLocation = useSessionStore((s) => s.buyerAddress.location);

  const productTypes = useMemo(() => groupProductsByType(products.filter((p) => p.active)), [products]);

  const bestSelling = useMemo(
    () => [...productTypes].sort((a, b) => b.totalSold - a.totalSold).slice(0, 8),
    [productTypes]
  );

  const freshest = useMemo(
    () =>
      [...productTypes]
        .sort((a, b) => new Date(b.latestHarvestedAt).getTime() - new Date(a.latestHarvestedAt).getTime())
        .slice(0, 8),
    [productTypes]
  );

  const nearby = useMemo(
    () =>
      [...producers]
        .map((p) => ({ producer: p, dist: distanceKm(buyerLocation, p.location) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 4),
    [producers, buyerLocation]
  );

  useEffect(() => {
    const urls: string[] = [];
    for (const t of bestSelling) {
      if (t.imageSeed.photoUrl) urls.push(t.imageSeed.photoUrl);
    }
    for (const { producer } of nearby) {
      if (producer.coverSeed.photoUrl) urls.push(producer.coverSeed.photoUrl);
      if (producer.avatarSeed.photoUrl) urls.push(producer.avatarSeed.photoUrl);
    }
    prefetchImageUrls(urls);
  }, [bestSelling, nearby]);

  return (
    <AppShell>
      <BuyerHomeHeader />

      <div className="flex flex-col gap-6 pt-5">
        <section className="flex flex-col gap-3">
          <SectionHeader title="Categorias" actionLabel="Ver todas" onAction={() => {}} />
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
            {CATEGORIES.map((c) => (
              <CategoryPill key={c.id} category={c} />
            ))}
          </div>
        </section>

        <section className="px-4">
          <Link
            href="/busca?categoria=verduras"
            className="flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-lime-500 to-lime-600 px-5 py-4 text-forest-900 shadow-sm"
          >
            <div>
              <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide">
                <Sparkles size={13} /> Direto da roça
              </p>
              <p className="mt-1 max-w-[190px] text-lg font-extrabold leading-tight">
                Frete grátis em pedidos acima de R$ 80
              </p>
              <span className="mt-2 inline-block rounded-full bg-forest-900 px-3 py-1.5 text-xs font-bold text-lime-400">
                Ver ofertas
              </span>
            </div>
            <span className="text-6xl">🥬</span>
          </Link>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader title="Mais vendidos" actionLabel="Ver todos" onAction={() => {}} />
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
            {bestSelling.map((t) => (
              <ProductCard key={t.typeId} summary={t} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader title="Produtores perto de você" actionLabel="Ver mapa" onAction={() => {}} />
          <div className="flex flex-col gap-2.5 px-4">
            {nearby.map(({ producer, dist }) => (
              <ProducerCard key={producer.id} producer={producer} distanceKm={dist} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3 pb-2">
          <SectionHeader title="Recém-colhidos" />
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
            {freshest.map((t) => (
              <ProductCard key={t.typeId} summary={t} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
