"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useNavigationStore } from "@/lib/store/useNavigationStore";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

const MIN_VISIBLE_MS = 320;

export function NavigationFeedback() {
  const pathname = usePathname();
  const isNavigating = useNavigationStore((s) => s.isNavigating);
  const startedAt = useNavigationStore((s) => s.startedAt);
  const finish = useNavigationStore((s) => s.finish);

  useEffect(() => {
    if (!isNavigating) return;
    const elapsed = Date.now() - startedAt;
    const delay = Math.max(0, MIN_VISIBLE_MS - elapsed);
    const t = window.setTimeout(() => finish(), delay);
    return () => window.clearTimeout(t);
  }, [pathname, isNavigating, startedAt, finish]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      const anchor = el?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;
      if (anchor.target === "_blank") return;
      useNavigationStore.getState().start();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <>
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-[90] h-1 overflow-hidden transition-opacity duration-200",
          isNavigating ? "opacity-100" : "opacity-0"
        )}
        aria-hidden
      >
        <div className="h-full w-full bg-lime-500/25">
          <div className="nav-progress-indeterminate h-full w-2/5 rounded-r-full bg-lime-500 shadow-[0_0_12px_rgba(168,224,95,0.6)]" />
        </div>
      </div>

      {isNavigating && (
        <div
          className="pointer-events-none fixed inset-x-0 top-2 z-[91] mx-auto flex max-w-md justify-center px-4 pt-[env(safe-area-inset-top)]"
          role="status"
          aria-live="polite"
        >
          <span className="animate-toast-in flex items-center gap-2 rounded-full bg-forest-900/92 px-4 py-2.5 text-xs font-semibold text-cream-100 shadow-lg backdrop-blur-sm">
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-lime-400 border-t-transparent" />
            Carregando página…
          </span>
        </div>
      )}

      {isNavigating && (
        <div
          className="pointer-events-none fixed inset-0 z-[88] mx-auto max-w-md animate-nav-fade-in bg-cream-100/80 backdrop-blur-[3px]"
          aria-hidden
        >
          <div className="safe-top space-y-4 px-4 pt-16">
            <Skeleton className="h-7 w-3/5" />
            <Skeleton className="h-44 w-full rounded-2xl" />
            <div className="flex gap-3">
              <Skeleton className="h-36 w-[152px] shrink-0 rounded-2xl" />
              <Skeleton className="h-36 w-[152px] shrink-0 rounded-2xl" />
              <Skeleton className="h-36 w-[152px] shrink-0 rounded-2xl" />
            </div>
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        </div>
      )}
    </>
  );
}
