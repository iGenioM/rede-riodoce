"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  onBack,
  right,
  tone = "light",
  subtitle,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
  tone?: "light" | "dark" | "overlay";
  subtitle?: string;
}) {
  const router = useRouter();
  const goBack = onBack ?? (() => router.back());

  if (tone === "overlay") {
    return (
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start px-3 pt-3 safe-top">
        <button
          type="button"
          onClick={goBack}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-900 shadow-[0_2px_12px_rgba(18,32,26,0.28)] transition-transform active:scale-90"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        {right && <div className="pointer-events-auto ml-auto">{right}</div>}
      </div>
    );
  }

  const dark = tone === "dark";
  return (
    <header
      className={cn(
        "safe-top sticky top-0 z-30 flex items-center gap-3 px-4 py-3.5",
        dark ? "bg-forest-900 text-cream-100" : "bg-cream-100/95 backdrop-blur text-ink-900 border-b border-ink-900/5"
      )}
    >
      <button
        onClick={goBack}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full active:scale-90 transition-transform",
          dark ? "bg-white/10 text-cream-100" : "bg-cream-200 text-ink-900"
        )}
        aria-label="Voltar"
      >
        <ArrowLeft size={18} />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-bold">{title}</h1>
        {subtitle && (
          <p className={cn("truncate text-xs", dark ? "text-cream-100/70" : "text-ink-500")}>{subtitle}</p>
        )}
      </div>
      {right}
    </header>
  );
}
