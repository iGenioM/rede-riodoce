"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, CreditCard, QrCode, MapPin, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, Button, Divider, EmptyState } from "@/components/ui";
import { useCartStore, cartItemsGroupedByProducer } from "@/lib/store/useCartStore";
import { useProductsStore } from "@/lib/store/useProductsStore";
import { useProducersStore } from "@/lib/store/useProducersStore";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { useOrdersStore } from "@/lib/store/useOrdersStore";
import { useNotificationsStore } from "@/lib/store/useNotificationsStore";
import { useToastStore } from "@/lib/store/useToastStore";
import { distanceKm } from "@/lib/geo";
import { formatBRL, uid } from "@/lib/utils";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";

type PaymentMethod = "pix" | "cartao" | "dinheiro";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const products = useProductsStore((s) => s.products);
  const decrementStock = useProductsStore((s) => s.decrementStock);
  const producers = useProducersStore((s) => s.producers);
  const buyerAddress = useSessionStore((s) => s.buyerAddress);
  const buyerId = useSessionStore((s) => s.buyerId);
  const buyerName = useSessionStore((s) => s.buyerName);
  const buyerCnpj = useSessionStore((s) => s.buyerCnpj);
  const buyerKind = useSessionStore((s) => s.buyerKind);
  const buyerContactName = useSessionStore((s) => s.buyerContactName);
  const buyerAvatarSeed = useSessionStore((s) => s.buyerAvatarSeed);
  const addOrders = useOrdersStore((s) => s.addOrders);
  const addNotification = useNotificationsStore((s) => s.add);
  const showToast = useToastStore((s) => s.show);

  const [payment, setPayment] = useState<PaymentMethod>("pix");
  const [placing, setPlacing] = useState(false);

  const groups = useMemo(() => cartItemsGroupedByProducer(items), [items]);

  const totals = useMemo(() => {
    let subtotal = 0;
    let delivery = 0;
    groups.forEach((groupItems, producerId) => {
      const producer = producers.find((p) => p.id === producerId);
      subtotal += groupItems.reduce((sum, it) => {
        const product = products.find((p) => p.id === it.productId);
        return sum + (product ? product.pricePerUnit * it.qty : 0);
      }, 0);
      if (producer) {
        const dist = distanceKm(buyerAddress.location, producer.location);
        delivery += Math.round((6 + dist * 0.35) * 100) / 100;
      }
    });
    return { subtotal, delivery, total: subtotal + delivery };
  }, [groups, products, producers, buyerAddress]);

  if (items.length === 0) {
    return (
      <AppShell>
        <PageHeader title="Finalizar pedido" />
        <EmptyState title="Seu carrinho está vazio" />
      </AppShell>
    );
  }

  function placeOrder() {
    setPlacing(true);
    const checkoutGroupId = uid("chk");
    const newOrders: Order[] = [];

    groups.forEach((groupItems, producerId) => {
      const producer = producers.find((p) => p.id === producerId);
      if (!producer) return;
      const dist = distanceKm(buyerAddress.location, producer.location);
      const deliveryFee = Math.round((6 + dist * 0.35) * 100) / 100;
      const orderItems = groupItems.map((it) => {
        const product = products.find((p) => p.id === it.productId)!;
        return {
          productId: product.id,
          name: product.name,
          qty: it.qty,
          unit: product.unit,
          pricePerUnit: product.pricePerUnit,
          imageSeed: product.imageSeed,
        };
      });
      const subtotal = orderItems.reduce((s, it) => s + it.qty * it.pricePerUnit, 0);
      const now = new Date().toISOString();

      const order: Order = {
        id: uid("ord"),
        checkoutGroupId,
        buyerId,
        buyerName,
        buyerCnpj,
        buyerKind,
        buyerContactName,
        buyerAvatarSeed,
        buyerAddress: `${buyerAddress.street}, ${buyerAddress.city}/${buyerAddress.state}`,
        buyerLocation: buyerAddress.location,
        producerId,
        items: orderItems,
        subtotal: Math.round(subtotal * 100) / 100,
        deliveryFee,
        total: Math.round((subtotal + deliveryFee) * 100) / 100,
        status: "pendente",
        createdAt: now,
        updatedAt: now,
        deliveryNote: undefined,
        statusHistory: [{ status: "pendente", at: now }],
        reviewed: false,
        distanceKm: Math.round(dist * 10) / 10,
      };
      newOrders.push(order);

      groupItems.forEach((it) => decrementStock(it.productId, it.qty));

      addNotification({
        scope: "produtor",
        title: "Novo pedido recebido",
        body: `${buyerName} fez um pedido de ${orderItems.map((o) => o.name).join(", ")}.`,
        type: "pedido",
        link: `/painel/pedidos/${order.id}`,
      });
    });

    addOrders(newOrders);
    clearCart();
    showToast("Pedido realizado com sucesso! 🎉", "success");
    setTimeout(() => router.push(`/pedidos/${newOrders[0].id}`), 300);
  }

  return (
    <AppShell hideNav>
      <div className="pb-40">
        <PageHeader title="Finalizar pedido" onBack={() => router.push("/carrinho")} />

        <div className="flex flex-col gap-4 px-4 pt-3">
          <button
            onClick={() => router.push("/perfil")}
            className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-900 text-lime-400">
              <MapPin size={17} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-500">Entregar em</p>
              <p className="truncate text-sm font-semibold text-ink-900">
                {buyerAddress.street} — {buyerAddress.city}/{buyerAddress.state}
              </p>
            </div>
            <ChevronRight size={16} className="text-ink-300" />
          </button>

          <div>
            <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-ink-500">
              Pedido ({groups.size} {groups.size === 1 ? "produtor" : "produtores"})
            </p>
            <div className="flex flex-col gap-2.5">
              {[...groups.entries()].map(([producerId, groupItems]) => {
                const producer = producers.find((p) => p.id === producerId);
                if (!producer) return null;
                const subtotal = groupItems.reduce((sum, it) => {
                  const product = products.find((p) => p.id === it.productId);
                  return sum + (product ? product.pricePerUnit * it.qty : 0);
                }, 0);
                return (
                  <div key={producerId} className="rounded-2xl bg-white p-3.5 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <Avatar seed={producer.avatarSeed} size={32} />
                      <p className="flex-1 truncate text-sm font-bold text-ink-900">{producer.farmName}</p>
                      <span className="text-sm font-bold text-ink-900">{formatBRL(subtotal)}</span>
                    </div>
                    <ul className="mt-2 space-y-0.5 pl-[42px] text-xs text-ink-500">
                      {groupItems.map((it) => {
                        const product = products.find((p) => p.id === it.productId);
                        return (
                          <li key={it.productId}>
                            {it.qty} {product?.unit} de {product?.name}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-ink-500">Forma de pagamento</p>
            <div className="flex flex-col gap-2">
              {[
                { key: "pix", label: "Pix", desc: "Aprovação imediata", icon: QrCode },
                { key: "cartao", label: "Cartão", desc: "Crédito na entrega (maquininha)", icon: CreditCard },
                { key: "dinheiro", label: "Dinheiro", desc: "Pagar direto ao produtor", icon: Banknote },
              ].map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setPayment(opt.key as PaymentMethod)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border-2 bg-white p-3.5 text-left transition-colors",
                      payment === opt.key ? "border-forest-900" : "border-transparent shadow-sm"
                    )}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-200 text-forest-800">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink-900">{opt.label}</p>
                      <p className="text-[11px] text-ink-500">{opt.desc}</p>
                    </div>
                    <div
                      className={cn(
                        "h-4.5 w-4.5 rounded-full border-2",
                        payment === opt.key ? "border-forest-900 bg-forest-900" : "border-ink-300"
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-ink-900/8 bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-3 shadow-[0_-4px_16px_rgba(18,32,26,0.08)]">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-ink-500">Subtotal</span>
          <span className="font-semibold text-ink-900">{formatBRL(totals.subtotal)}</span>
        </div>
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-ink-500">Frete</span>
          <span className="font-semibold text-ink-900">{formatBRL(totals.delivery)}</span>
        </div>
        <Divider className="mb-3" />
        <Button size="lg" className="w-full" onClick={placeOrder} disabled={placing}>
          {placing ? "Enviando pedido…" : `Confirmar pedido · ${formatBRL(totals.total)}`}
        </Button>
      </div>
    </AppShell>
  );
}
