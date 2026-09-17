"use client";

import { useEffect, useState, type ReactNode } from "react";
import { NavigationFeedback } from "@/components/layout/NavigationFeedback";
import { ToastHost } from "@/components/ui/ToastHost";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSessionStore } from "@/lib/store/useSessionStore";

function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Em dev o SW cacheia os chunks do Next e o browser fica preso no JS antigo.
    if (process.env.NODE_ENV === "development") {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      void caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      return;
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* ambiente sem suporte a SW (ex.: preview em iframe) — ignora silenciosamente */
      });
    });
  }, []);
  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const hasHydrated = useSessionStore((s) => s.hasHydrated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <ServiceWorkerRegister />
      {mounted && !hasHydrated ? (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-forest-900 px-8">
          <div className="animate-splash-pulse flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-500 text-3xl shadow-lg">
            🧺
          </div>
          <div className="w-full max-w-xs space-y-3">
            <Skeleton className="h-4 w-3/4 mx-auto rounded-lg bg-white/10" />
            <Skeleton className="h-3 w-1/2 mx-auto rounded-lg bg-white/10" />
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
              <div className="nav-progress-indeterminate h-full w-1/3 rounded-full bg-lime-500" />
            </div>
          </div>
          <p className="text-xs font-medium text-cream-100/70">Preparando o app…</p>
        </div>
      ) : (
        children
      )}
      <NavigationFeedback />
      <ToastHost />
    </>
  );
}
