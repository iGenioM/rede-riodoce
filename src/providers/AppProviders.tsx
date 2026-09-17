"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ToastHost } from "@/components/ui/ToastHost";
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-forest-900">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-500 text-3xl">
              🧺
            </div>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-lime-500" />
            </div>
          </div>
        </div>
      ) : (
        children
      )}
      <ToastHost />
    </>
  );
}
