"use client";

import { usePathname } from "next/navigation";
import { useNavigate } from "@/hooks/useNavigate";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { PRODUCTS } from "@/lib/mockData";
import { formatBRL } from "@/lib/utils";

export function CartBar() {
  const pathname = usePathname();
  const { push } = useNavigate();
  const mode = useSessionStore((s) => s.mode);
  const items = useCartStore((s) => s.items);

  if (mode !== "comprador") return null;
  if (pathname === "/carrinho" || pathname === "/checkout") return null;
  if (items.length === 0) return null;

  const qty = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => {
    const p = PRODUCTS.find((p) => p.id === i.productId);
    return s + (p ? p.pricePerUnit * i.qty : 0);
  }, 0);

  return (
    <div className="w-full px-1">
      <button
        type="button"
        onClick={() => push("/carrinho")}
        className="flex w-full items-center justify-between rounded-2xl bg-forest-900 px-4 py-3.5 text-cream-100 shadow-lg active:scale-[0.98] transition-transform"
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lime-500 text-forest-900">
            <ShoppingCart size={14} />
          </span>
          {qty} {qty === 1 ? "item" : "itens"}
        </span>
        <span className="text-sm font-bold">
          Ver carrinho · {formatBRL(total)}
        </span>
      </button>
    </div>
  );
}
