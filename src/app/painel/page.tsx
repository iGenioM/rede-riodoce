"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, TrendingUp, Package, Star, Clock, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProducerHomeHeader } from "@/components/layout/ProducerHomeHeader";
import { SectionHeader, Badge, Avatar } from "@/components/ui";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { useOrdersStore } from "@/lib/store/useOrdersStore";
import { useProductsStore } from "@/lib/store/useProductsStore";
import { useProducersStore } from "@/lib/store/useProducersStore";
import { STATUS_META } from "@/lib/orderStatus";
import { formatBRL, formatDateShort } from "@/lib/utils";

export default function PainelPage() {
  const router = useRouter();
  const producerId = useSessionStore((s) => s.producerId);
  const allOrders = useOrdersStore((s) => s.orders);
  const allProducts = useProductsStore((s) => s.products);
  const producer = useProducersStore((s) => s.producers.find((p) => p.id === producerId));

  const orders = useMemo(
    () => allOrders.filter((o) => o.producerId === producerId),
    [allOrders, producerId]
  );
  const products = useMemo(
    () => allProducts.filter((p) => p.producerId === producerId),
    [allProducts, producerId]
  );

  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status === "pendente").length;
    const revenue30d = orders
      .filter((o) => o.status === "entregue")
      .reduce((s, o) => s + o.total, 0);
    const activeProducts = products.filter((p) => p.active).length;
    return { pending, revenue30d, activeProducts };
  }, [orders, products]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4),
    [orders]
  );

  const topProducts = useMemo(
    () => [...products].sort((a, b) => b.soldTotal - a.soldTotal).slice(0, 4),
    [products]
  );

  if (!producer) return null;

  return (
    <AppShell>
      <ProducerHomeHeader />

      <div className="flex flex-col gap-6 px-4 pt-5">
        <section className="grid grid-cols-3 gap-2.5">
          <StatCard icon={Clock} label="Pedidos pendentes" value={stats.pending.toString()} accent="gold" />
          <StatCard icon={Package} label="Produtos ativos" value={stats.activeProducts.toString()} accent="sky" />
          <StatCard icon={Star} label="Nota média" value={producer.rating.toFixed(1)} accent="lime" />
        </section>

        <section className="rounded-2xl bg-forest-900 p-4 text-cream-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-cream-100/70">Faturamento (pedidos entregues)</p>
              <p className="mt-1 text-2xl font-extrabold">{formatBRL(stats.revenue30d)}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lime-500/20 text-lime-400">
              <TrendingUp size={20} />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push("/painel/produtos/novo")}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-lime-500 py-5 text-forest-900 active:scale-[0.98] transition-transform"
          >
            <Plus size={20} />
            <span className="text-xs font-bold">Novo produto</span>
          </button>
          <button
            onClick={() => router.push("/painel/pedidos")}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white py-5 text-ink-900 shadow-sm active:scale-[0.98] transition-transform"
          >
            <Package size={20} />
            <span className="text-xs font-bold">Ver pedidos</span>
          </button>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader title="Pedidos recentes" actionLabel="Ver todos" onAction={() => router.push("/painel/pedidos")} />
          <div className="flex flex-col gap-2 px-4">
            {recentOrders.length === 0 && (
              <p className="rounded-xl bg-white p-4 text-center text-xs text-ink-500 shadow-sm">
                Nenhum pedido recebido ainda.
              </p>
            )}
            {recentOrders.map((order) => {
              const meta = STATUS_META[order.status];
              return (
                <button
                  key={order.id}
                  onClick={() => router.push(`/painel/pedidos/${order.id}`)}
                  className="flex items-center gap-3 rounded-2xl bg-white p-3.5 text-left shadow-sm"
                >
                  <Avatar seed={order.buyerAvatarSeed} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-900">{order.buyerName}</p>
                    <p className="text-[11px] text-ink-500">{formatDateShort(order.createdAt)} · {formatBRL(order.total)}</p>
                  </div>
                  <Badge variant={meta.badge}>{meta.short}</Badge>
                  <ChevronRight size={14} className="text-ink-300" />
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3 pb-4">
          <SectionHeader title="Produtos mais vendidos" actionLabel="Gerenciar" onAction={() => router.push("/painel/produtos")} />
          <div className="flex flex-col gap-2 px-4">
            {topProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink-900">{p.name}</p>
                  <p className="text-[11px] text-ink-500">{p.soldTotal} {p.unit} vendidos</p>
                </div>
                <span className="text-sm font-bold text-forest-800">{formatBRL(p.pricePerUnit)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: "gold" | "sky" | "lime";
}) {
  const colors = {
    gold: "bg-gold/15 text-gold",
    sky: "bg-sky/15 text-sky",
    lime: "bg-lime-500/20 text-lime-700",
  };
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-sm">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${colors[accent]}`}>
        <Icon size={15} />
      </div>
      <p className="text-lg font-extrabold text-ink-900">{value}</p>
      <p className="text-[10px] font-semibold leading-tight text-ink-500">{label}</p>
    </div>
  );
}
