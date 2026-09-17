"use client";

import { useMemo, useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { ClipboardList } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, Badge, EmptyState } from "@/components/ui";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { useOrdersStore } from "@/lib/store/useOrdersStore";
import { STATUS_META } from "@/lib/orderStatus";
import { formatBRL, formatDateShort } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = "novos" | "andamento" | "concluidos";

const TAB_STATUSES: Record<Tab, OrderStatus[]> = {
  novos: ["pendente"],
  andamento: ["aceito", "preparando", "a_caminho"],
  concluidos: ["entregue", "recusado", "cancelado"],
};

export default function PedidosPainelPage() {
  const { push, replace, back } = useNavigate();
  const producerId = useSessionStore((s) => s.producerId);
  const allOrders = useOrdersStore((s) => s.orders);
  const [tab, setTab] = useState<Tab>("novos");

  const sorted = useMemo(
    () =>
      allOrders
        .filter((o) => o.producerId === producerId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [allOrders, producerId]
  );

  const filtered = sorted.filter((o) => TAB_STATUSES[tab].includes(o.status));
  const newCount = sorted.filter((o) => o.status === "pendente").length;

  return (
    <AppShell>
      <PageHeader title="Pedidos recebidos" onBack={() => push("/painel")} />

      <div className="px-4 pt-3">
        <div className="flex items-center gap-1 rounded-full bg-cream-200 p-1">
          {(
            [
              { key: "novos", label: "Novos" },
              { key: "andamento", label: "Em andamento" },
              { key: "concluidos", label: "Concluídos" },
            ] as { key: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "relative flex-1 rounded-full py-2 text-xs font-bold",
                tab === t.key ? "bg-white text-forest-900 shadow-sm" : "text-ink-500"
              )}
            >
              {t.label}
              {t.key === "novos" && newCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-tomato px-1 text-[9px] font-bold text-white">
                  {newCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2.5 px-4">
        {filtered.length === 0 ? (
          <EmptyState icon={<ClipboardList size={24} />} title="Nenhum pedido por aqui" />
        ) : (
          filtered.map((order) => {
            const meta = STATUS_META[order.status];
            return (
              <button
                key={order.id}
                onClick={() => push(`/painel/pedidos/${order.id}`)}
                className="flex flex-col gap-2 rounded-2xl bg-white p-4 text-left shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar seed={order.buyerAvatarSeed} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-900">{order.buyerName}</p>
                    <p className="truncate text-[10px] text-ink-500">CNPJ {order.buyerCnpj}</p>
                  </div>
                  <Badge variant={meta.badge}>{meta.emoji} {meta.short}</Badge>
                </div>
                <p className="truncate text-xs text-ink-500">{order.items.map((it) => it.name).join(", ")}</p>
                <div className="flex items-center justify-between text-xs text-ink-500">
                  <span>{formatDateShort(order.createdAt)} · {order.distanceKm} km</span>
                  <span className="text-sm font-extrabold text-ink-900">{formatBRL(order.total)}</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
