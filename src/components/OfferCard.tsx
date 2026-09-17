"use client";

import Link from "next/link";
import { LinkPendingHighlight } from "@/components/ui/LinkPendingHighlight";
import { Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductImage } from "@/components/ui/ProductImage";
import { formatBRL } from "@/lib/utils";
import { unitLabel } from "@/lib/units";
import { useCartStore } from "@/lib/store/useCartStore";
import { useToastStore } from "@/lib/store/useToastStore";
import { useProducersStore } from "@/lib/store/useProducersStore";

/** Card de UMA oferta específica (produto de UM produtor). Usado na vitrine
 * do produtor e na lista de ofertas de um tipo de produto. Para o card
 * agregado "tipo de produto" (que pode ter várias ofertas), veja ProductCard. */
export function OfferCard({
  product,
  compact = false,
  showProducer = true,
}: {
  product: Product;
  compact?: boolean;
  showProducer?: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const show = useToastStore((s) => s.show);
  const producer = useProducersStore((s) => s.producers.find((p) => p.id === product.producerId));

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id, product.producerId, 1);
    show(`${product.name} adicionado ao carrinho`, "success");
  }

  return (
    <Link
      href={`/oferta/${product.id}`}
      prefetch
      className="group relative flex w-[152px] shrink-0 flex-col gap-2 rounded-2xl bg-white p-2 shadow-[0_1px_3px_rgba(18,32,26,0.08)] active:scale-[0.98] transition-transform"
    >
      <LinkPendingHighlight className="rounded-2xl" />
      <div className="relative">
        <ProductImage seed={product.imageSeed} className="h-28 w-full" emojiClassName="text-5xl" sizes="152px" />
        {product.organic && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-forest-700">
            Orgânico
          </span>
        )}
        <button
          onClick={quickAdd}
          aria-label="Adicionar ao carrinho"
          className="absolute bottom-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-forest-900 text-lime-400 shadow-md active:scale-90 transition-transform"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>
      <div className="px-0.5 pb-1">
        <p className="truncate text-sm font-bold text-ink-900">{product.name}</p>
        {!compact && showProducer && producer && (
          <p className="truncate text-[11px] text-ink-500">{producer.farmName}</p>
        )}
        <p className="mt-0.5 text-sm font-bold text-forest-800">
          {formatBRL(product.pricePerUnit)}
          <span className="text-[11px] font-medium text-ink-500">/{unitLabel(product.unit)}</span>
        </p>
      </div>
    </Link>
  );
}
