"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, MapPin } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, Button, EmptyState, Divider } from "@/components/ui";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCartStore, cartItemsGroupedByProducer } from "@/lib/store/useCartStore";
import { useProductsStore } from "@/lib/store/useProductsStore";
import { useProducersStore } from "@/lib/store/useProducersStore";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { formatBRL, formatQty } from "@/lib/utils";
import { distanceKm } from "@/lib/geo";

export default function CarrinhoPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const removeProducer = useCartStore((s) => s.removeProducer);
  const products = useProductsStore((s) => s.products);
  const producers = useProducersStore((s) => s.producers);
  const buyerLocation = useSessionStore((s) => s.buyerAddress.location);

  const groups = useMemo(() => cartItemsGroupedByProducer(items), [items]);

  const grandTotal = useMemo(() => {
    let subtotal = 0;
    let delivery = 0;
    groups.forEach((groupItems, producerId) => {
      const producer = producers.find((p) => p.id === producerId);
      const groupSubtotal = groupItems.reduce((sum, it) => {
        const product = products.find((p) => p.id === it.productId);
        return sum + (product ? product.pricePerUnit * it.qty : 0);
      }, 0);
      subtotal += groupSubtotal;
      if (producer) {
        const dist = distanceKm(buyerLocation, producer.location);
        delivery += Math.round((6 + dist * 0.35) * 100) / 100;
      }
    });
    return { subtotal, delivery, total: subtotal + delivery };
  }, [groups, products, producers, buyerLocation]);

  if (items.length === 0) {
    return (
      <AppShell>
        <PageHeader title="Carrinho" onBack={() => router.push("/home")} />
        <EmptyState
          icon={<ShoppingBag size={26} />}
          title="Seu carrinho está vazio"
          description="Explore produtores da sua região e adicione produtos frescos."
          action={
            <Button onClick={() => router.push("/home")} className="mt-2">
              Explorar produtos
            </Button>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell hideNav>
      <div className="pb-40">
        <PageHeader title="Carrinho" onBack={() => router.push("/home")} />

        <div className="flex flex-col gap-4 px-4 pt-3">
          {[...groups.entries()].map(([producerId, groupItems]) => {
            const producer = producers.find((p) => p.id === producerId);
            if (!producer) return null;
            const dist = distanceKm(buyerLocation, producer.location);
            const deliveryFee = Math.round((6 + dist * 0.35) * 100) / 100;
            const subtotal = groupItems.reduce((sum, it) => {
              const product = products.find((p) => p.id === it.productId);
              return sum + (product ? product.pricePerUnit * it.qty : 0);
            }, 0);

            return (
              <div key={producerId} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <Avatar seed={producer.avatarSeed} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-900">{producer.farmName}</p>
                    <p className="text-[11px] text-ink-500">{producer.city}/{producer.state}</p>
                  </div>
                  <button
                    onClick={() => removeProducer(producerId)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-200 text-tomato"
                    aria-label="Remover produtor do carrinho"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <Divider className="my-3" />

                <div className="flex flex-col gap-3">
                  {groupItems.map((item) => {
                    const product = products.find((p) => p.id === item.productId);
                    if (!product) return null;
                    const step = product.unit === "kg" ? 0.5 : 1;
                    return (
                      <div key={item.productId} className="flex items-center gap-3">
                        <ProductImage seed={product.imageSeed} className="h-14 w-14 shrink-0" emojiClassName="text-2xl" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink-900">{product.name}</p>
                          <p className="text-xs text-ink-500">
                            {formatBRL(product.pricePerUnit)}/{product.unit}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-cream-200 px-1.5 py-1">
                          <button
                            onClick={() => updateQty(item.productId, Math.round((item.qty - step) * 100) / 100)}
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-ink-900"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold">{formatQty(item.qty, "")}</span>
                          <button
                            onClick={() => updateQty(item.productId, Math.round((item.qty + step) * 100) / 100)}
                            className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-ink-900"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Divider className="my-3" />
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-ink-500">
                    <MapPin size={12} /> Entrega estimada
                  </span>
                  <span className="font-semibold text-ink-700">{formatBRL(deliveryFee)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink-700">Subtotal</span>
                  <span className="font-bold text-ink-900">{formatBRL(subtotal)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-ink-900/8 bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-3 shadow-[0_-4px_16px_rgba(18,32,26,0.08)]">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-ink-500">Subtotal ({groups.size} {groups.size === 1 ? "produtor" : "produtores"})</span>
          <span className="font-semibold text-ink-900">{formatBRL(grandTotal.subtotal)}</span>
        </div>
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-ink-500">Frete total</span>
          <span className="font-semibold text-ink-900">{formatBRL(grandTotal.delivery)}</span>
        </div>
        <Button size="lg" className="w-full" onClick={() => router.push("/checkout")}>
          Finalizar pedido · {formatBRL(grandTotal.total)}
        </Button>
      </div>
    </AppShell>
  );
}
