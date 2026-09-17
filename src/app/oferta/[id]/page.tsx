"use client";

import { use, useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { Minus, Plus, MapPin, ShoppingCart, BadgeCheck, Store } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, Badge, Button, EmptyState, RatingStars } from "@/components/ui";
import { ProductImage } from "@/components/ui/ProductImage";
import { OfferCard } from "@/components/OfferCard";
import { useProductsStore } from "@/lib/store/useProductsStore";
import { useProducersStore } from "@/lib/store/useProducersStore";
import { useCartStore } from "@/lib/store/useCartStore";
import { useToastStore } from "@/lib/store/useToastStore";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { formatBRL, formatDateFull } from "@/lib/utils";
import { unitLabel, qtyStep } from "@/lib/units";
import { NegotiationPanel } from "@/components/NegotiationPanel";
import { useProposalsStore } from "@/lib/store/useProposalsStore";
import { distanceKm, formatDistance } from "@/lib/geo";
import { CATEGORIES } from "@/lib/mockData";
import { getProductTypeSummary } from "@/lib/offers";

export default function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { push, replace, back } = useNavigate();
  const [qty, setQty] = useState(1);

  const allProducts = useProductsStore((s) => s.products);
  const product = allProducts.find((p) => p.id === id);
  const otherProducts = product
    ? allProducts.filter((p) => p.producerId === product.producerId && p.id !== product.id && p.active)
    : [];
  const sameTypeSummary = product ? getProductTypeSummary(allProducts, product.productTypeId) : null;
  const otherOffersCount = sameTypeSummary ? sameTypeSummary.offerCount - 1 : 0;
  const producer = useProducersStore((s) => s.producers.find((p) => p.id === product?.producerId));
  const addItem = useCartStore((s) => s.addItem);
  const show = useToastStore((s) => s.show);
  const buyerLocation = useSessionStore((s) => s.buyerAddress.location);
  const buyerName = useSessionStore((s) => s.buyerName);
  const acceptedPrice = useProposalsStore((s) => s.acceptedPrice(product?.id ?? "", buyerName));

  if (!product || !producer) {
    return (
      <AppShell hideNav>
        <PageHeader title="Produto" />
        <EmptyState title="Produto não encontrado" />
      </AppShell>
    );
  }

  const category = CATEGORIES.find((c) => c.id === product.categoryId);
  const dist = distanceKm(buyerLocation, producer.location);
  const step = qtyStep(product.unit);
  const unitPrice = acceptedPrice ?? product.pricePerUnit;

  function addToCart() {
    const active = useProposalsStore.getState().activeForProduct(product!.id, buyerName);
    addItem(product!.id, product!.producerId, qty, {
      negotiatedPricePerUnit: acceptedPrice,
      proposalId: active?.status === "aceita" ? active.id : undefined,
    });
    show(`${qty} ${unitLabel(product!.unit, qty > 1)} de ${product!.name} adicionado`, "success");
    setQty(1);
  }

  return (
    <AppShell hideNav>
      <div className="pb-24">
      <div className="relative">
        <ProductImage
          seed={product.imageSeed}
          className="h-64 w-full"
          rounded="rounded-none"
          emojiClassName="text-8xl"
          priority
          sizes="(max-width: 448px) 100vw, 448px"
        />
        <PageHeader title="" tone="overlay" onBack={() => back()} />
        {product.organic && (
          <span className="absolute right-3 top-[calc(env(safe-area-inset-top)+12px)] z-10 rounded-full bg-white px-3 py-1 text-xs font-bold text-forest-700 shadow">
            🌱 Orgânico
          </span>
        )}
      </div>

      <div className="px-4 pt-5">
        {category && <Badge variant="outline">{category.name}</Badge>}
        <h1 className="mt-2 text-xl font-extrabold text-ink-900">{product.name}</h1>
        <p className="mt-1 text-2xl font-extrabold text-forest-800">
          {formatBRL(unitPrice)}
          <span className="text-sm font-semibold text-ink-500"> /{unitLabel(product.unit)}</span>
          {acceptedPrice != null && (
            <span className="ml-2 text-xs font-bold text-lime-700">preço negociado</span>
          )}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-700">{product.description}</p>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-500">
          <span>Colhido em {formatDateFull(product.harvestedAt)}</span>
          <span>· {product.availableQty} {unitLabel(product.unit, product.availableQty > 1)} disponíveis</span>
        </div>

        <NegotiationPanel product={product} qty={qty} />

        <button
          onClick={() => push(`/produtores/${producer.id}`)}
          className="mt-5 flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left shadow-sm active:scale-[0.99] transition-transform"
        >
          <Avatar seed={producer.avatarSeed} size={44} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p className="truncate text-sm font-bold text-ink-900">{producer.farmName}</p>
              {producer.verified && <BadgeCheck size={13} className="shrink-0 text-sky" />}
            </div>
            <RatingStars rating={producer.rating} size={11} showValue count={producer.ratingCount} />
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-cream-200 px-2.5 py-1.5 text-xs font-bold text-forest-800">
            <MapPin size={11} />
            {formatDistance(dist)}
          </span>
        </button>

        {otherOffersCount > 0 && (
          <button
            onClick={() => push(`/produto/${product.productTypeId}`)}
            className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-lime-500/15 p-3.5 text-left active:scale-[0.99] transition-transform"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-900 text-lime-400">
              <Store size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink-900">
                +{otherOffersCount} {otherOffersCount === 1 ? "outro produtor vende" : "outros produtores vendem"} {product.name.toLowerCase()}
              </p>
              <p className="text-[11px] text-ink-500">Compare preços e distância</p>
            </div>
          </button>
        )}

        {otherProducts.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 text-sm font-bold text-ink-900">Mais de {producer.farmName}</p>
            <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
              {otherProducts.map((p) => (
                <OfferCard key={p.id} product={p} compact showProducer={false} />
              ))}
            </div>
          </div>
        )}
      </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-md items-center gap-3 border-t border-ink-900/8 bg-white px-4 py-3 safe-bottom">
        <div className="flex items-center gap-3 rounded-xl bg-cream-200 px-2 py-1.5">
          <button
            onClick={() => setQty((q) => Math.max(step, q - step))}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-ink-900 shadow-sm"
          >
            <Minus size={15} />
          </button>
          <span className="w-10 text-center text-sm font-bold text-ink-900">{qty}</span>
          <button
            onClick={() => setQty((q) => q + step)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-ink-900 shadow-sm"
          >
            <Plus size={15} />
          </button>
        </div>
        <Button className="flex-1" size="lg" onClick={addToCart}>
          <ShoppingCart size={17} />
          Adicionar · {formatBRL(unitPrice * qty)}
        </Button>
      </div>
      <div className="h-20" />
    </AppShell>
  );
}
