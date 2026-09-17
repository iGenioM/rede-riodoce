"use client";

import Link from "next/link";
import { Bell, ArrowLeftRight } from "lucide-react";
import { Avatar, Badge } from "@/components/ui";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { useNotificationsStore } from "@/lib/store/useNotificationsStore";
import { useProducersStore } from "@/lib/store/useProducersStore";

export function ProducerHomeHeader() {
  const producerId = useSessionStore((s) => s.producerId);
  const toggleMode = useSessionStore((s) => s.toggleMode);
  const producer = useProducersStore((s) => s.producers.find((p) => p.id === producerId));
  const unread = useNotificationsStore(
    (s) => s.notifications.filter((n) => n.scope === "produtor" && !n.read).length
  );

  if (!producer) return null;

  return (
    <header className="safe-top rounded-b-[28px] bg-forest-900 px-4 pb-5 pt-4 text-cream-100">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar seed={producer.avatarSeed} size={44} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Badge variant="lime" className="!px-2 !py-0.5">Modo Produtor</Badge>
            </div>
            <p className="truncate text-sm font-bold leading-tight mt-0.5">{producer.farmName}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/notificacoes"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 active:scale-90 transition-transform"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-lime-500 ring-2 ring-forest-900" />
            )}
          </Link>
        </div>
      </div>

      <button
        onClick={toggleMode}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 py-2.5 text-sm font-semibold active:scale-[0.98] transition-transform"
      >
        <ArrowLeftRight size={15} />
        Ver como comprador
      </button>
    </header>
  );
}
