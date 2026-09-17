"use client";

import { useMemo, useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { ClipboardList, Star } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, Badge, EmptyState, Button } from "@/components/ui";
import { useOrdersStore } from "@/lib/store/useOrdersStore";
import { useProducersStore } from "@/lib/store/useProducersStore";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { STATUS_META, isActiveStatus } from "@/lib/orderStatus";
import { formatBRL, formatDateShort } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Tab = "andamento" | "concluidos";

export default function PedidosPage() {
  const { push, replace, back } = useNavigate();
  const buyerId = useSessionStore((s) => s.buyerId);
  const allOrders = useOrdersStore((s) => s.orders);
  const producers = useProducersStore((s) => s.producers);
  const [tab, setTab] = useState<Tab>("andamento");

  const sorted = useMemo(
    () =>
      allOrders
        .filter((o) => o.buyerId === buyerId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [allOrders, buyerId]
  );

  const filtered = sorted.filter((o) => (tab === "andamento" ? isActiveStatus(o.status) : !isActiveStatus(o.status)));

  return (
    <AppShell>
      <PageHeader title="Meus pedidos" onBack={() => push("/home")} />

      <div className="px-4 pt-3">
        <div className="flex items-center gap-1 rounded-full bg-cream-200 p-1">
          {(["andamento", "concluidos"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-full py-2 text-xs font-bold",
                tab === t ? "bg-white text-forest-900 shadow-sm" : "text-ink-500"
              )}
            >
              {t === "andamento" ? "Em andamento" : "Concluídos"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2.5 px-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={24} />}
            title={tab === "andamento" ? "Nenhum pedido em andamento" : "Nenhum pedido concluído ainda"}
          />
        ) : (
          filtered.map((order) => {
            const producer = producers.find((p) => p.id === order.producerId);
            const meta = STATUS_META[order.status];
            return (
              <button
                key={order.id}
                onClick={() => push(`/pedidos/${order.id}`)}
                className="flex flex-col gap-2.5 rounded-2xl bg-white p-4 text-left shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  {producer && <Avatar seed={producer.avatarSeed} size={38} />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-900">{producer?.farmName ?? "Produtor"}</p>
                    <p className="text-[11px] text-ink-500">{formatDateShort(order.createdAt)} · #{order.id.slice(-5)}</p>
                  </div>
                  <Badge variant={meta.badge}>{meta.emoji} {meta.short}</Badge>
                </div>
                <p className="truncate text-xs text-ink-500">
                  {order.items.map((it) => it.name).join(", ")}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-ink-900">{formatBRL(order.total)}</span>
                  {order.status === "entregue" && !order.reviewed && (
                    <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-bold text-gold">
                      <Star size={11} /> Avaliar compra
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {tab === "andamento" && filtered.length === 0 && (
        <div className="mt-2 px-4">
          <Button variant="outline" className="w-full" onClick={() => push("/home")}>
            Explorar produtos
          </Button>
        </div>
      )}
    </AppShell>
  );
}
