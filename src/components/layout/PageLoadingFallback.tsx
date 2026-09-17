import { Skeleton } from "@/components/ui/Skeleton";

/** Fallback de rota (loading.tsx) — skeleton alinhado ao layout mobile do app. */
export function PageLoadingFallback() {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-cream-100 px-4 pb-24 pt-[calc(env(safe-area-inset-top)+12px)]">
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="mb-4 h-11 w-full rounded-2xl" />
      <div className="mb-6 flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-16 shrink-0 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="mb-3 h-5 w-40" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-[152px] shrink-0 rounded-2xl" />
        ))}
      </div>
      <p className="mt-8 text-center text-xs font-medium text-ink-500">Carregando…</p>
    </div>
  );
}
