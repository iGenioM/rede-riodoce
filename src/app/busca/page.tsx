"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X, SlidersHorizontal, Leaf } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { CategoryPill } from "@/components/CategoryPill";
import { ProductCard } from "@/components/ProductCard";
import { ProducerCard } from "@/components/ProducerCard";
import { EmptyState } from "@/components/ui";
import { BottomSheet } from "@/components/ui/Sheet";
import { CATEGORIES } from "@/lib/mockData";
import { useProductsStore } from "@/lib/store/useProductsStore";
import { useProducersStore } from "@/lib/store/useProducersStore";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { distanceKm } from "@/lib/geo";
import { cn } from "@/lib/utils";
import { groupProductsByType } from "@/lib/offers";

type SortKey = "relevancia" | "menor_preco" | "maior_preco" | "mais_vendido" | "mais_perto";
type ResultTab = "produtos" | "produtores";

function BuscaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("categoria") ?? "";

  const products = useProductsStore((s) => s.products);
  const producers = useProducersStore((s) => s.producers);
  const buyerLocation = useSessionStore((s) => s.buyerAddress.location);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [tab, setTab] = useState<ResultTab>("produtos");
  const [sort, setSort] = useState<SortKey>("relevancia");
  const [onlyOrganic, setOnlyOrganic] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredProductTypes = useMemo(() => {
    let list = products.filter((p) => p.active);
    if (category) list = list.filter((p) => p.categoryId === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (onlyOrganic) list = list.filter((p) => p.organic);

    const withDist = groupProductsByType(list).map((t) => {
      const distances = t.offers.map((o) => {
        const producer = producers.find((pr) => pr.id === o.producerId);
        return producer ? distanceKm(buyerLocation, producer.location) : 9999;
      });
      return { type: t, dist: Math.min(...distances) };
    });

    switch (sort) {
      case "menor_preco":
        withDist.sort((a, b) => a.type.minPrice - b.type.minPrice);
        break;
      case "maior_preco":
        withDist.sort((a, b) => b.type.maxPrice - a.type.maxPrice);
        break;
      case "mais_vendido":
        withDist.sort((a, b) => b.type.totalSold - a.type.totalSold);
        break;
      case "mais_perto":
        withDist.sort((a, b) => a.dist - b.dist);
        break;
      default:
        break;
    }
    return withDist.map((w) => w.type);
  }, [products, producers, category, query, onlyOrganic, sort, buyerLocation]);

  const filteredProducers = useMemo(() => {
    let list = producers;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.farmName.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
      );
    }
    return [...list]
      .map((p) => ({ producer: p, dist: distanceKm(buyerLocation, p.location) }))
      .sort((a, b) => (sort === "mais_perto" ? a.dist - b.dist : b.producer.rating - a.producer.rating));
  }, [producers, query, buyerLocation, sort]);

  const activeCategory = CATEGORIES.find((c) => c.id === category);

  return (
    <AppShell>
      <PageHeader title="Buscar" onBack={() => router.push("/home")} />

      <div className="px-4 pt-3">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-sm">
            <Search size={18} className="shrink-0 text-ink-500" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Produto, produtor ou cidade"
              className="flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-300"
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <X size={16} className="text-ink-400" />
              </button>
            )}
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl bg-forest-900 text-lime-400 active:scale-90 transition-transform"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategory("")}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold",
              !category ? "bg-forest-900 text-cream-100" : "bg-white text-ink-700"
            )}
          >
            Tudo
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id === category ? "" : c.id)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold",
                c.id === category ? "bg-forest-900 text-cream-100" : "bg-white text-ink-700"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-1 rounded-full bg-cream-200 p-1">
          {(["produtos", "produtores"] as ResultTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-full py-2 text-xs font-bold capitalize transition-colors",
                tab === t ? "bg-white text-forest-900 shadow-sm" : "text-ink-500"
              )}
            >
              {t === "produtos" ? `Produtos (${filteredProductTypes.length})` : `Produtores (${filteredProducers.length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 px-4">
        {tab === "produtos" ? (
          filteredProductTypes.length === 0 ? (
            <EmptyState
              icon={<Leaf size={26} />}
              title="Nenhum produto encontrado"
              description="Tente buscar por outro termo ou remover os filtros."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProductTypes.map((t) => (
                <ProductCard key={t.typeId} summary={t} compact />
              ))}
            </div>
          )
        ) : filteredProducers.length === 0 ? (
          <EmptyState title="Nenhum produtor encontrado" />
        ) : (
          <div className="flex flex-col gap-2.5">
            {filteredProducers.map(({ producer, dist }) => (
              <ProducerCard key={producer.id} producer={producer} distanceKm={dist} />
            ))}
          </div>
        )}
      </div>

      <BottomSheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Filtrar e ordenar">
        <div className="pb-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-500">Ordenar por</p>
          <div className="mb-5 flex flex-col gap-2">
            {[
              { key: "relevancia", label: "Relevância" },
              { key: "mais_perto", label: "Mais perto de mim" },
              { key: "menor_preco", label: "Menor preço" },
              { key: "maior_preco", label: "Maior preço" },
              { key: "mais_vendido", label: "Mais vendidos" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSort(opt.key as SortKey)}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold",
                  sort === opt.key ? "border-forest-900 bg-forest-900 text-cream-100" : "border-ink-900/10 text-ink-700"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <label className="flex items-center justify-between rounded-xl bg-cream-200 px-4 py-3">
            <span className="text-sm font-semibold text-ink-900">Somente orgânicos</span>
            <input
              type="checkbox"
              checked={onlyOrganic}
              onChange={(e) => setOnlyOrganic(e.target.checked)}
              className="h-5 w-5 accent-forest-900"
            />
          </label>
          {activeCategory && (
            <button
              onClick={() => setCategory("")}
              className="mt-3 w-full rounded-xl border border-ink-900/10 py-3 text-sm font-semibold text-ink-700"
            >
              Remover categoria &ldquo;{activeCategory.name}&rdquo;
            </button>
          )}
          <button
            onClick={() => setFilterOpen(false)}
            className="mt-4 w-full rounded-xl bg-lime-500 py-3.5 text-sm font-bold text-forest-900"
          >
            Aplicar filtros
          </button>
        </div>
      </BottomSheet>
    </AppShell>
  );
}

export default function BuscaPage() {
  return (
    <Suspense>
      <BuscaContent />
    </Suspense>
  );
}
