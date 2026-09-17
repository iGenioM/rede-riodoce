"use client";

import Link from "next/link";
import { LinkPendingHighlight } from "@/components/ui/LinkPendingHighlight";
import { Plus } from "lucide-react";
import type { ProductTypeSummary } from "@/lib/offers";
import { ProductImage } from "@/components/ui/ProductImage";
import { formatBRL } from "@/lib/utils";
import { unitLabel } from "@/lib/units";
import { useCartStore } from "@/lib/store/useCartStore";
import { useToastStore } from "@/lib/store/useToastStore";

/** Card agregado de um TIPO de produto (ex.: "Alface"), que pode reunir
 * ofertas de vários produtores diferentes. Quando há mais de uma oferta,
 * mostra um selo "N ofertas" e leva pra tela de comparação de ofertas;
 * quando há só uma, vai direto pra oferta (comportamento de antes). */
export function ProductCard({ summary, compact = false }: { summary: ProductTypeSummary; compact?: boolean }) {
  const addItem = useCartStore((s) => s.addItem);
  const show = useToastStore((s) => s.show);
  const singleOffer = summary.offerCount === 1 ? summary.offers[0] : null;
  const href = singleOffer ? `/oferta/${singleOffer.id}` : `/produto/${summary.typeId}`;

  function quickAdd(e: React.MouseEvent) {
    if (!singleOffer) return;
    e.preventDefault();
    e.stopPropagation();
    addItem(singleOffer.id, singleOffer.producerId, 1);
    show(`${singleOffer.name} adicionado ao carrinho`, "success");
  }

  return (
    <Link
      href={href}
      prefetch
      className="group relative flex w-[152px] shrink-0 flex-col gap-2 rounded-2xl bg-white p-2 shadow-[0_1px_3px_rgba(18,32,26,0.08)] active:scale-[0.98] transition-transform"
    >
      <LinkPendingHighlight className="rounded-2xl" />
      <div className="relative">
        <ProductImage
          seed={summary.imageSeed}
          className="h-28 w-full"
          emojiClassName="text-5xl"
          sizes="152px"
        />
        {summary.organicAny && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-forest-700">
            Orgânico
          </span>
        )}
        {summary.offerCount > 1 ? (
          <span className="absolute bottom-1.5 right-1.5 rounded-full bg-forest-900 px-2.5 py-1 text-[10px] font-bold text-lime-400 shadow-md">
            {summary.offerCount} ofertas
          </span>
        ) : (
          <button
            onClick={quickAdd}
            aria-label="Adicionar ao carrinho"
            className="absolute bottom-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-forest-900 text-lime-400 shadow-md active:scale-90 transition-transform"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>
      <div className="px-0.5 pb-1">
        <p className="truncate text-sm font-bold text-ink-900">{summary.name}</p>
        {!compact && (
          <p className="truncate text-[11px] text-ink-500">
            {summary.offerCount > 1 ? `${summary.offerCount} produtores vendem` : "1 produtor vende"}
          </p>
        )}
        <p className="mt-0.5 text-sm font-bold text-forest-800">
          {summary.offerCount > 1 && <span className="text-[11px] font-medium text-ink-500">a partir de </span>}
          {formatBRL(summary.minPrice)}
          <span className="text-[11px] font-medium text-ink-500">/{unitLabel(summary.unit)}</span>
        </p>
      </div>
    </Link>
  );
}
