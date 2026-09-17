"use client";

import Link from "next/link";
import { useNavigate } from "@/hooks/useNavigate";
import { Bell, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { useNotificationsStore } from "@/lib/store/useNotificationsStore";

export function BuyerHomeHeader() {
  const { push, replace, back } = useNavigate();
  const address = useSessionStore((s) => s.buyerAddress);
  const unread = useNotificationsStore(
    (s) => s.notifications.filter((n) => n.scope === "comprador" && !n.read).length
  );

  return (
    <header className="safe-top rounded-b-[28px] bg-forest-900 px-4 pb-5 pt-4 text-cream-100">
      <div className="flex items-center justify-between gap-3">
        <Link href="/perfil" className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lime-500/20 text-lime-400">
            <MapPin size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-lime-400">Endereço de entrega</p>
            <p className="truncate text-sm font-bold leading-tight">
              {address.street} — {address.city}/{address.state}
            </p>
          </div>
        </Link>
        <Link
          href="/notificacoes"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 active:scale-90 transition-transform"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-lime-500 ring-2 ring-forest-900" />
          )}
        </Link>
      </div>

      <button
        onClick={() => push("/busca")}
        className="mt-4 flex w-full items-center gap-2.5 rounded-2xl bg-white px-4 py-3 text-left shadow-sm"
      >
        <Search size={18} className="shrink-0 text-ink-500" />
        <span className="flex-1 text-sm text-ink-500">Buscar produto ou produtor</span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-lime-500 text-forest-900">
          <SlidersHorizontal size={15} />
        </span>
      </button>
    </header>
  );
}
