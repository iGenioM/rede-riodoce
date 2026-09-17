"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { Button } from "@/components/ui";

export default function SplashPage() {
  const router = useRouter();
  const hasHydrated = useSessionStore((s) => s.hasHydrated);
  const loggedIn = useSessionStore((s) => s.loggedIn);
  const mode = useSessionStore((s) => s.mode);

  useEffect(() => {
    if (!hasHydrated) return;
    if (loggedIn) {
      router.replace(mode === "produtor" ? "/painel" : "/home");
    }
  }, [hasHydrated, loggedIn, mode, router]);

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-end overflow-hidden bg-forest-900 text-cream-100">
      <div className="absolute inset-0">
        <div className="absolute -left-10 top-16 h-56 w-56 rounded-full bg-lime-500/15 blur-2xl" />
        <div className="absolute right-[-40px] top-52 h-40 w-40 rounded-full bg-lime-400/10 blur-2xl" />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 px-8 pt-16">
        <div className="flex h-28 w-28 items-center justify-center rounded-[32px] bg-lime-500 text-6xl shadow-xl shadow-lime-900/30">
          🧺
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-wide text-lime-400">
            CEASA DIGITAL
          </span>
          <h1 className="text-2xl font-extrabold leading-tight">
            Do assentamento
            <br /> direto pra sua mesa
          </h1>
          <p className="max-w-[280px] text-sm text-cream-100/70">
            Compre fresco, direto do produtor rural da sua região — sem atravessador, com preço justo pros dois lados.
          </p>
        </div>
      </div>

      <div className="relative z-10 rounded-t-[32px] bg-cream-100 px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-7 text-ink-900">
        <div className="mb-5 flex items-center justify-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />
          <span className="h-1.5 w-5 rounded-full bg-lime-500" />
        </div>
        <h2 className="text-center text-lg font-extrabold">Feito pra quem planta e pra quem compra</h2>
        <p className="mt-1 text-center text-sm text-ink-500">
          Alterne entre comprar produtos frescos ou vender sua colheita — tudo na mesma conta.
        </p>
        <Button
          size="lg"
          className="mt-6 w-full"
          onClick={() => router.push("/login")}
        >
          Começar
          <ArrowRight size={18} />
        </Button>
      </div>
    </main>
  );
}
