"use client";

import { use, useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { MessageCircle, Phone, MapPin, Star, Check } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, Badge, Button, Divider, EmptyState } from "@/components/ui";
import { ProductImage } from "@/components/ui/ProductImage";
import { useOrdersStore } from "@/lib/store/useOrdersStore";
import { useProducersStore } from "@/lib/store/useProducersStore";
import { useReviewsStore } from "@/lib/store/useReviewsStore";
import { useChatStore } from "@/lib/store/useChatStore";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { useToastStore } from "@/lib/store/useToastStore";
import { STATUS_FLOW, STATUS_META } from "@/lib/orderStatus";
import { formatBRL, formatDateFull, formatQty } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function PedidoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { push, replace, back } = useNavigate();

  const order = useOrdersStore((s) => s.orders.find((o) => o.id === id));
  const markReviewed = useOrdersStore((s) => s.markReviewed);
  const producer = useProducersStore((s) => s.producers.find((p) => p.id === order?.producerId));
  const reviews = useReviewsStore((s) => s.reviews);
  const addReview = useReviewsStore((s) => s.addReview);
  const getOrCreateConversation = useChatStore((s) => s.getOrCreateConversation);
  const buyerId = useSessionStore((s) => s.buyerId);
  const buyerName = useSessionStore((s) => s.buyerName);
  const buyerAvatarSeed = useSessionStore((s) => s.buyerAvatarSeed);
  const showToast = useToastStore((s) => s.show);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const existingReview = reviews.find((r) => r.orderId === id);

  if (!order || !producer) {
    return (
      <AppShell>
        <PageHeader title="Pedido" />
        <EmptyState title="Pedido não encontrado" />
      </AppShell>
    );
  }

  const meta = STATUS_META[order.status];
  const isTerminalNegative = order.status === "recusado" || order.status === "cancelado";
  const flowIndex = STATUS_FLOW.indexOf(order.status);

  function submitReview() {
    addReview({
      orderId: order!.id,
      producerId: order!.producerId,
      buyerId,
      buyerName,
      buyerAvatarSeed,
      rating,
      comment: comment.trim() || "Sem comentários.",
    });
    markReviewed(order!.id);
    showToast("Obrigado pela avaliação!", "success");
  }

  function openChat() {
    const convId = getOrCreateConversation(producer!.id);
    push(`/chat/${convId}`);
  }

  return (
    <AppShell>
      <PageHeader title={`Pedido #${order.id.slice(-5)}`} subtitle={formatDateFull(order.createdAt)} onBack={() => back()} />

      <div className="flex flex-col gap-4 px-4 pt-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <Badge variant={meta.badge}>{meta.emoji} {meta.label}</Badge>
            <span className="text-xs text-ink-500">#{order.id.slice(-5)}</span>
          </div>

          {!isTerminalNegative && (
            <div className="mt-4 flex items-center">
              {STATUS_FLOW.map((s, i) => (
                <div key={s} className="flex flex-1 items-center last:flex-none">
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      i <= flowIndex ? "bg-forest-900 text-lime-400" : "bg-cream-200 text-ink-300"
                    )}
                  >
                    {i < flowIndex ? <Check size={12} /> : i + 1}
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={cn("h-0.5 flex-1", i < flowIndex ? "bg-forest-900" : "bg-cream-200")} />
                  )}
                </div>
              ))}
            </div>
          )}
          {!isTerminalNegative && (
            <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-ink-500">
              <span>Pendente</span>
              <span>Aceito</span>
              <span>Preparando</span>
              <span>A caminho</span>
              <span>Entregue</span>
            </div>
          )}

          {order.deliveryNote && (
            <p className="mt-3 rounded-xl bg-cream-200 px-3 py-2 text-xs text-ink-700">
              💬 {order.deliveryNote}
            </p>
          )}
        </div>

        <button
          onClick={() => push(`/produtores/${producer.id}`)}
          className="flex items-center gap-3 rounded-2xl bg-white p-3.5 text-left shadow-sm"
        >
          <Avatar seed={producer.avatarSeed} size={44} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink-900">{producer.farmName}</p>
            <p className="truncate text-xs text-ink-500">{producer.city}/{producer.state}</p>
          </div>
        </button>

        <div className="flex gap-2.5">
          <Button variant="secondary" className="flex-1" onClick={openChat}>
            <MessageCircle size={16} /> Mensagem
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.open(`https://wa.me/${producer.whatsapp}`, "_blank")}
          >
            <Phone size={16} /> WhatsApp
          </Button>
        </div>

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
            <span className="flex items-center gap-1 text-ink-500">
              <MapPin size={12} /> Frete ({order.distanceKm} km)
            </span>
            <span className="font-semibold text-ink-900">{formatBRL(order.deliveryFee)}</span>
          </div>
          <Divider className="my-3" />
          <div className="flex items-center justify-between">
            <span className="font-bold text-ink-900">Total</span>
            <span className="text-lg font-extrabold text-forest-800">{formatBRL(order.total)}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-500">Endereço de entrega</p>
          <p className="text-sm text-ink-900">{order.buyerAddress}</p>
        </div>

        {order.status === "entregue" && (
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            {existingReview ? (
              <>
                <p className="mb-2 text-sm font-bold text-ink-900">Sua avaliação</p>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={18} className={i <= existingReview.rating ? "fill-gold text-gold" : "text-ink-300"} />
                  ))}
                </div>
                <p className="mt-2 text-sm text-ink-700">{existingReview.comment}</p>
                {existingReview.reply && (
                  <>
                    <Divider className="my-3" />
                    <p className="text-xs font-bold text-forest-800">Resposta de {producer.farmName}</p>
                    <p className="mt-0.5 text-xs text-ink-600">{existingReview.reply.text}</p>
                  </>
                )}
              </>
            ) : (
              <>
                <p className="mb-3 text-sm font-bold text-ink-900">Como foi sua experiência?</p>
                <div className="mb-3 flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button key={i} onClick={() => setRating(i)}>
                      <Star size={28} className={i <= rating ? "fill-gold text-gold" : "text-ink-300"} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte como foram os produtos e a entrega…"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-ink-900/10 bg-cream-100 px-3.5 py-3 text-sm text-ink-900 outline-none focus:border-forest-700"
                />
                <Button className="mt-3 w-full" onClick={submitReview}>
                  Enviar avaliação
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
