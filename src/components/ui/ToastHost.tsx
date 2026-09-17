"use client";

import { useToastStore } from "@/lib/store/useToastStore";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-[80] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "animate-toast-in pointer-events-auto flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg",
            t.variant === "success" && "bg-forest-900 text-cream-100",
            t.variant === "error" && "bg-tomato text-white",
            t.variant === "default" && "bg-ink-900 text-cream-100"
          )}
        >
          {t.variant === "success" && <CheckCircle2 size={18} className="shrink-0 text-lime-400" />}
          {t.variant === "error" && <XCircle size={18} className="shrink-0" />}
          {t.variant === "default" && <Info size={18} className="shrink-0" />}
          <span className="leading-snug">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
