"use client";

import Link from "next/link";
import { LinkPendingHighlight } from "@/components/ui/LinkPendingHighlight";
import type { Category } from "@/lib/types";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { cn } from "@/lib/utils";

export function CategoryPill({ category, active = false }: { category: Category; active?: boolean }) {
  return (
    <Link
      href={`/busca?categoria=${category.id}`}
      prefetch
      className="relative flex w-16 shrink-0 flex-col items-center gap-1.5"
    >
      <LinkPendingHighlight className="rounded-2xl" />
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full shadow-sm transition-transform active:scale-90",
          active ? "ring-2 ring-lime-500 ring-offset-2" : ""
        )}
        style={{ backgroundImage: `linear-gradient(135deg, ${category.gradient[0]}, ${category.gradient[1]})` }}
      >
        <CategoryIcon icon={category.icon} className="h-6 w-6 text-white" />
      </div>
      <span className="text-center text-[11px] font-semibold leading-tight text-ink-700">{category.name}</span>
    </Link>
  );
}
