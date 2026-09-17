"use client";

import { use, useMemo, useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { BadgeCheck, MessageCircle, Phone, Truck, MapPin, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, Badge, RatingStars, Button, EmptyState, Divider } from "@/components/ui";
import { ProductImage } from "@/components/ui/ProductImage";
import { OfferCard } from "@/components/OfferCard";
import { useProducersStore } from "@/lib/store/useProducersStore";
import { useProductsStore } from "@/lib/store/useProductsStore";
import { useReviewsStore, producerRatingSummary } from "@/lib/store/useReviewsStore";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { useChatStore } from "@/lib/store/useChatStore";
import { distanceKm, formatDistance } from "@/lib/geo";
import { cn, timeAgo } from "@/lib/utils";

export default function ProdutorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { push, replace, back } = useNavigate();
  const [tab, setTab] = useState<"produtos" | "avaliacoes">("produtos");

  const producer = useProducersStore((s) => s.producers.find((p) => p.id === id));
  const allProducts = useProductsStore((s) => s.products);
  const reviews = useReviewsStore((s) => s.reviews);
  const buyerLocation = useSessionStore((s) => s.buyerAddress.location);
  const getOrCreateConversation = useChatStore((s) => s.getOrCreateConversation);

  const products = useMemo(
    () => allProducts.filter((p) => p.producerId === id && p.active),
    [allProducts, id]
  );
  const summary = useMemo(
    () => (producer ? producerRatingSummary(reviews, producer.id) : null),
    [reviews, producer]
  );

  if (!producer) {
    return (
      <AppShell>
        <PageHeader title="Produtor" />
        <EmptyState title="Produtor não encontrado" />
      </AppShell>
    );
  }

  const dist = distanceKm(buyerLocation, producer.location);

  function openChat() {
    const convId = getOrCreateConversation(producer!.id);
    push(`/chat/${convId}`);
  }

  return (
    <AppShell>
      <div className="relative">
        <ProductImage
          seed={producer.coverSeed}
          className="h-40 w-full"
          rounded="rounded-none"
          emojiClassName="text-7xl"
          priority
          sizes="(max-width: 448px) 100vw, 448px"
        />
        <PageHeader title="" tone="overlay" onBack={() => back()} />
      </div>

      <div className="relative -mt-8 rounded-t-3xl bg-cream-100 px-4 pt-5">
        <div className="flex items-start gap-3">
          <div className="-mt-10">
            <Avatar seed={producer.avatarSeed} size={72} />
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex items-center gap-1.5">
              <h1 className="truncate text-lg font-extrabold text-ink-900">{producer.farmName}</h1>
              {producer.verified && <BadgeCheck size={16} className="shrink-0 text-sky" />}
            </div>
            <p className="text-xs text-ink-500">{producer.name} · {producer.city}/{producer.state}</p>
            <div className="mt-1">
              <RatingStars rating={producer.rating} showValue count={producer.ratingCount} />
            </div>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-ink-700">{producer.bio}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {producer.certifications.map((c) => (
            <Badge key={c} variant="outline">
              <ShieldCheck size={11} /> {c}
            </Badge>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-1 rounded-xl bg-white py-3 shadow-sm">
            <MapPin size={16} className="text-forest-700" />
            <span className="text-xs font-bold text-ink-900">{formatDistance(dist)}</span>
            <span className="text-[10px] text-ink-500">de você</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl bg-white py-3 shadow-sm">
            <Truck size={16} className="text-forest-700" />
            <span className="text-xs font-bold text-ink-900">
              {producer.deliveryEstimateDays[0]}–{producer.deliveryEstimateDays[1]}d
            </span>
            <span className="text-[10px] text-ink-500">entrega</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl bg-white py-3 shadow-sm">
            <MapPin size={16} className="text-forest-700" />
            <span className="text-xs font-bold text-ink-900">{producer.radiusKm} km</span>
            <span className="text-[10px] text-ink-500">de raio</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2.5">
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

        <div className="mt-5 flex items-center gap-1 rounded-full bg-cream-200 p-1">
          {(["produtos", "avaliacoes"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-full py-2 text-xs font-bold capitalize",
                tab === t ? "bg-white text-forest-900 shadow-sm" : "text-ink-500"
              )}
            >
              {t === "produtos" ? `Produtos (${products.length})` : `Avaliações (${summary?.count ?? 0})`}
            </button>
          ))}
        </div>

        <div className="py-4">
          {tab === "produtos" ? (
            products.length === 0 ? (
              <EmptyState title="Sem produtos ativos no momento" />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {products.map((p) => (
                  <OfferCard key={p.id} product={p} compact showProducer={false} />
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col gap-3">
              {summary && summary.count > 0 && (
                <div className="mb-1 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="text-center">
                    <p className="text-3xl font-extrabold text-ink-900">{summary.avg.toFixed(1)}</p>
                    <RatingStars rating={summary.avg} size={12} />
                    <p className="mt-0.5 text-[11px] text-ink-500">{summary.count} avaliações</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    {summary.breakdown.map((b) => (
                      <div key={b.star} className="flex items-center gap-2">
                        <span className="w-3 text-[10px] text-ink-500">{b.star}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-200">
                          <div
                            className="h-full rounded-full bg-gold"
                            style={{ width: `${summary.count ? (b.count / summary.count) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {summary?.list.length === 0 ? (
                <EmptyState title="Ainda sem avaliações" />
              ) : (
                summary?.list.map((r) => (
                  <div key={r.id} className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar seed={r.buyerAvatarSeed ?? { emoji: "🙋", from: "#2f6b3f", to: "#8fc94a" }} size={32} />
                        <p className="truncate text-sm font-bold text-ink-900">{r.buyerName}</p>
                      </div>
                      <span className="shrink-0 text-[11px] text-ink-400">{timeAgo(r.createdAt)}</span>
                    </div>
                    <RatingStars rating={r.rating} size={12} />
                    <p className="mt-1.5 text-sm text-ink-700">{r.comment}</p>
                    {r.reply && (
                      <>
                        <Divider className="my-2.5" />
                        <p className="text-xs font-bold text-forest-800">Resposta de {producer.farmName}</p>
                        <p className="mt-0.5 text-xs text-ink-600">{r.reply.text}</p>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
