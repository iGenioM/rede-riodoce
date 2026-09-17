"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, MapPin, Check, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, Badge, Button, Divider, EmptyState } from "@/components/ui";
import { ProductImage } from "@/components/ui/ProductImage";
import { BottomSheet } from "@/components/ui/Sheet";
import { useOrdersStore } from "@/lib/store/useOrdersStore";
import { useChatStore } from "@/lib/store/useChatStore";
import { useNotificationsStore } from "@/lib/store/useNotificationsStore";
import { useToastStore } from "@/lib/store/useToastStore";
import { STATUS_META, nextStatus } from "@/lib/orderStatus";
import { formatBRL, formatDateFull, formatQty } from "@/lib/utils";

export default function PedidoPainelDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === id));
  const updateStatus = useOrdersStore((s) => s.updateStatus);
  const setDeliveryEstimate = useOrdersStore((s) => s.setDeliveryEstimate);
  const getOrCreateConversation = useChatStore((s) => s.getOrCreateConversation);
  const addNotification = useNotificationsStore((s) => s.add);
  const showToast = useToastStore((s) => s.show);

  const [noteSheetOpen, setNoteSheetOpen] = useState(false);
  const [rejectSheetOpen, setRejectSheetOpen] = useState(false);
  const [note, setNote] = useState("Entrega prevista para amanhã pela manhã.");

  if (!order) {
    return (
      <AppShell>
        <PageHeader title="Pedido" />
        <EmptyState title="Pedido não encontrado" />
      </AppShell>
    );
  }

  const meta = STATUS_META[order.status];
  const next = nextStatus(order.status);

  function notifyBuyer(title: string, body: string) {
    addNotification({ scope: "comprador", title, body, type: "pedido", link: `/pedidos/${order!.id}` });
  }

  function accept() {
    updateStatus(order!.id, "aceito");
    notifyBuyer("Pedido aceito!", `Seu pedido em ${formatBRL(order!.total)} foi aceito pelo produtor.`);
    showToast("Pedido aceito", "success");
  }

  function reject(reason: string) {
    updateStatus(order!.id, "recusado", reason);
    notifyBuyer("Pedido recusado", reason || "O produtor não pôde atender seu pedido desta vez.");
    showToast("Pedido recusado", "default");
    setRejectSheetOpen(false);
  }

  function advance() {
    if (!next) return;
    updateStatus(order!.id, next);
    const labels: Record<string, string> = {
      preparando: "Seu pedido está sendo preparado.",
      a_caminho: "Seu pedido saiu para entrega!",
      entregue: "Seu pedido foi entregue. Bom apetite! 🎉",
    };
    notifyBuyer(STATUS_META[next].label, labels[next] ?? STATUS_META[next].label);
    showToast(`Status atualizado: ${STATUS_META[next].short}`, "success");
  }

  function saveNote() {
    setDeliveryEstimate(order!.id, new Date().toISOString(), note);
    notifyBuyer("Previsão de entrega atualizada", note);
    showToast("Previsão de entrega enviada ao comprador", "success");
    setNoteSheetOpen(false);
  }

  function openChat() {
    const convId = getOrCreateConversation(order!.producerId);
    router.push(`/chat/${convId}`);
  }

  return (
    <AppShell>
      <PageHeader title={`Pedido #${order.id.slice(-5)}`} subtitle={formatDateFull(order.createdAt)} onBack={() => router.back()} />

      <div className="flex flex-col gap-4 px-4 pt-4">
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Avatar seed={order.buyerAvatarSeed} size={40} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ink-500">Comprador</p>
              <p className="text-sm font-bold text-ink-900">{order.buyerName}</p>
              <p className="text-[11px] text-ink-500">CNPJ {order.buyerCnpj} · Contato: {order.buyerContactName}</p>
            </div>
          </div>
          <Badge variant={meta.badge}>{meta.emoji} {meta.label}</Badge>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-ink-500">
            <MapPin size={12} /> Endereço de entrega
          </p>
          <p className="text-sm text-ink-900">{order.buyerAddress}</p>
          <p className="mt-0.5 text-xs text-ink-500">{order.distanceKm} km de distância</p>
        </div>

        <Button variant="secondary" onClick={openChat}>
          <MessageCircle size={16} /> Falar com o comprador
        </Button>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-bold text-ink-900">Itens do pedido</p>
          <div className="flex flex-col gap-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <ProductImage seed={item.imageSeed} className="h-12 w-12 shrink-0" emojiClassName="text-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{item.name}</p>
                  <p className="text-xs text-ink-500">{formatQty(item.qty, item.unit)}</p>
                </div>
                <span className="text-sm font-semibold text-ink-900">{formatBRL(item.qty * item.pricePerUnit)}</span>
              </div>
            ))}
          </div>
          <Divider className="my-3" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-500">Subtotal</span>
            <span className="font-semibold text-ink-900">{formatBRL(order.subtotal)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-ink-500">Frete (repassado)</span>
            <span className="font-semibold text-ink-900">{formatBRL(order.deliveryFee)}</span>
          </div>
          <Divider className="my-3" />
          <div className="flex items-center justify-between">
            <span className="font-bold text-ink-900">Total</span>
            <span className="text-lg font-extrabold text-forest-800">{formatBRL(order.total)}</span>
          </div>
        </div>

        {order.deliveryNote && (
          <div className="rounded-2xl bg-cream-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-500">Previsão de entrega enviada</p>
            <p className="mt-1 text-sm text-ink-700">{order.deliveryNote}</p>
          </div>
        )}

        {order.status === "pendente" && (
          <div className="flex gap-2.5">
            <Button variant="outline" className="flex-1" onClick={() => setRejectSheetOpen(true)}>
              <X size={16} /> Recusar
            </Button>
            <Button className="flex-1" onClick={accept}>
              <Check size={16} /> Aceitar pedido
            </Button>
          </div>
        )}

        {order.status === "aceito" && (
          <div className="flex flex-col gap-2.5">
            <Button onClick={() => setNoteSheetOpen(true)}>Definir previsão de entrega</Button>
            <Button variant="secondary" onClick={advance}>
              Iniciar preparo do pedido
            </Button>
          </div>
        )}

        {order.status === "preparando" && (
          <Button onClick={advance}>Saiu para entrega 🚚</Button>
        )}

        {order.status === "a_caminho" && (
          <Button onClick={advance}>Marcar como entregue ✅</Button>
        )}
      </div>

      <BottomSheet open={noteSheetOpen} onClose={() => setNoteSheetOpen(false)} title="Previsão de entrega">
        <div className="pb-5">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-forest-700"
          />
          <Button className="mt-4 w-full" onClick={saveNote}>
            Enviar ao comprador
          </Button>
        </div>
      </BottomSheet>

      <BottomSheet open={rejectSheetOpen} onClose={() => setRejectSheetOpen(false)} title="Recusar pedido">
        <div className="pb-5">
          <p className="mb-3 text-sm text-ink-600">Escolha um motivo (o comprador será avisado):</p>
          <div className="flex flex-col gap-2">
            {["Estoque insuficiente no momento", "Fora da minha área de entrega hoje", "Vou estar ausente"].map((r) => (
              <button
                key={r}
                onClick={() => reject(r)}
                className="rounded-xl border border-ink-900/10 px-4 py-3 text-left text-sm font-semibold text-ink-700"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>
    </AppShell>
  );
}
