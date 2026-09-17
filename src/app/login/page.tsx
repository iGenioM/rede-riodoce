"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Sprout, ShoppingBasket } from "lucide-react";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { Button } from "@/components/ui";
import { BUYER_NAME } from "@/lib/mockData";

export default function LoginPage() {
  const router = useRouter();
  const login = useSessionStore((s) => s.login);
  const completeOnboarding = useSessionStore((s) => s.completeOnboarding);
  const setMode = useSessionStore((s) => s.setMode);
  const [name, setName] = useState(BUYER_NAME);
  const [phone, setPhone] = useState("(35) 99811-0022");

  function enter(startMode: "comprador" | "produtor") {
    login(name.trim() || BUYER_NAME);
    completeOnboarding();
    setMode(startMode);
    router.replace(startMode === "produtor" ? "/painel" : "/home");
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center bg-cream-100 px-6 py-10">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-forest-900 text-3xl">🧺</div>
        <h1 className="mt-2 text-xl font-extrabold text-ink-900">Entrar no CEASA Digital</h1>
        <p className="text-sm text-ink-500">Protótipo com dados fictícios — não é preciso senha real.</p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-ink-700">Nome do estabelecimento</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-forest-700"
            placeholder="Ex.: Hortifruti Sabor da Terra"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-ink-700">WhatsApp</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-forest-700"
            placeholder="(00) 00000-0000"
          />
        </label>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl bg-sky/10 px-3 py-2.5 text-xs font-medium text-sky">
        <ShieldCheck size={16} className="shrink-0" />
        Seus dados ficam salvos só neste dispositivo (localStorage).
      </div>

      <p className="mt-7 mb-2.5 text-xs font-bold uppercase tracking-wide text-ink-500">
        Entrar como
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => enter("comprador")}
          className="flex flex-col items-center gap-2 rounded-2xl border-2 border-forest-900 bg-forest-900 px-3 py-5 text-cream-100 active:scale-[0.98] transition-transform"
        >
          <ShoppingBasket size={22} className="text-lime-400" />
          <span className="text-sm font-bold">Comprador</span>
          <span className="text-center text-[11px] text-cream-100/70">Comprar produtos frescos</span>
        </button>
        <button
          onClick={() => enter("produtor")}
          className="flex flex-col items-center gap-2 rounded-2xl border-2 border-ink-900/10 bg-white px-3 py-5 text-ink-900 active:scale-[0.98] transition-transform"
        >
          <Sprout size={22} className="text-forest-700" />
          <span className="text-sm font-bold">Produtor</span>
          <span className="text-center text-[11px] text-ink-500">Vender minha colheita</span>
        </button>
      </div>

      <p className="mt-6 flex items-center justify-center gap-1 text-center text-xs text-ink-400">
        Você poderá alternar entre os dois modos a qualquer momento <ArrowRight size={12} />
      </p>
    </main>
  );
}
