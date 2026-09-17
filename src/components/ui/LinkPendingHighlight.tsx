"use client";

import { useLinkStatus } from "next/link";
import { cn } from "@/lib/utils";

/** Brilho sutil no link enquanto a navegação está pendente (filho direto de `<Link>`). */
export function LinkPendingHighlight({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span
      className={cn(
        "pointer-events-none absolute inset-0 z-10 rounded-[inherit] skeleton-shimmer opacity-60",
        className
      )}
      aria-hidden
    />
  );
}
