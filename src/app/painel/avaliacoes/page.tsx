"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, Button, Divider, EmptyState, RatingStars } from "@/components/ui";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { useReviewsStore, producerRatingSummary } from "@/lib/store/useReviewsStore";
import { useToastStore } from "@/lib/store/useToastStore";
import { timeAgo } from "@/lib/utils";

export default function AvaliacoesPainelPage() {
  const router = useRouter();
  const producerId = useSessionStore((s) => s.producerId);
  const reviews = useReviewsStore((s) => s.reviews);
  const addReply = useReviewsStore((s) => s.addReply);
  const showToast = useToastStore((s) => s.show);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [openReplyFor, setOpenReplyFor] = useState<string | null>(null);

  const summary = useMemo(() => producerRatingSummary(reviews, producerId), [reviews, producerId]);

  function submitReply(reviewId: string) {
    const text = replyDraft[reviewId]?.trim();
    if (!text) return;
    addReply(reviewId, text);
    showToast("Resposta enviada!", "success");
    setOpenReplyFor(null);
  }

  return (
    <AppShell>
      <PageHeader title="Avaliações" onBack={() => router.push("/painel")} />

      <div className="flex flex-col gap-4 px-4 pt-4">
        {summary.count > 0 && (
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-ink-900">{summary.avg.toFixed(1)}</p>
              <RatingStars rating={summary.avg} size={13} />
              <p className="mt-0.5 text-[11px] text-ink-500">{summary.count} avaliações</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {summary.breakdown.map((b) => (
                <div key={b.star} className="flex items-center gap-2">
                  <span className="w-3 text-[10px] text-ink-500">{b.star}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-200">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${summary.count ? (b.count / summary.count) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-4 text-[10px] text-ink-400">{b.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {summary.list.length === 0 ? (
          <EmptyState icon={<Star size={24} />} title="Você ainda não recebeu avaliações" />
        ) : (
          summary.list.map((r) => (
            <div key={r.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar seed={r.buyerAvatarSeed ?? { emoji: "🙋", from: "#2f6b3f", to: "#8fc94a" }} size={32} />
                  <p className="truncate text-sm font-bold text-ink-900">{r.buyerName}</p>
                </div>
                <span className="shrink-0 text-[11px] text-ink-400">{timeAgo(r.createdAt)}</span>
              </div>
              <RatingStars rating={r.rating} size={13} />
              <p className="mt-1.5 text-sm text-ink-700">{r.comment}</p>

              {r.reply ? (
                <>
                  <Divider className="my-2.5" />
                  <p className="text-xs font-bold text-forest-800">Sua resposta</p>
                  <p className="mt-0.5 text-xs text-ink-600">{r.reply.text}</p>
                </>
              ) : openReplyFor === r.id ? (
                <div className="mt-3">
                  <textarea
                    value={replyDraft[r.id] ?? ""}
                    onChange={(e) => setReplyDraft((d) => ({ ...d, [r.id]: e.target.value }))}
                    rows={2}
                    placeholder="Agradeça ou responda ao comentário…"
                    className="w-full resize-none rounded-xl border border-ink-900/10 bg-cream-100 px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-forest-700"
                  />
                  <Button size="sm" className="mt-2" onClick={() => submitReply(r.id)}>
                    Enviar resposta
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setOpenReplyFor(r.id)}
                  className="mt-2.5 text-xs font-bold text-forest-700"
                >
                  Responder avaliação
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
