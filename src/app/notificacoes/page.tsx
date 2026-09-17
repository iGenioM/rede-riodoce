"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageCircle, Package, Star, Info } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui";
import { useNotificationsStore } from "@/lib/store/useNotificationsStore";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

const ICONS = { pedido: Package, chat: MessageCircle, avaliacao: Star, sistema: Info };

export default function NotificacoesPage() {
  const router = useRouter();
  const mode = useSessionStore((s) => s.mode);
  const notifications = useNotificationsStore((s) => s.notifications);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  const list = useMemo(
    () =>
      notifications
        .filter((n) => n.scope === mode)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notifications, mode]
  );

  useEffect(() => {
    markAllRead(mode);
  }, [mode, markAllRead]);

  return (
    <AppShell>
      <PageHeader title="Notificações" onBack={() => router.push(mode === "produtor" ? "/painel" : "/home")} />

      <div className="flex flex-col gap-2.5 px-4 pt-4">
        {list.length === 0 ? (
          <EmptyState icon={<Bell size={24} />} title="Sem notificações por aqui" />
        ) : (
          list.map((n) => {
            const Icon = ICONS[n.type];
            return (
              <button
                key={n.id}
                onClick={() => {
                  markRead(n.id);
                  if (n.link) router.push(n.link);
                }}
                className={cn(
                  "flex items-start gap-3 rounded-2xl p-4 text-left shadow-sm",
                  n.read ? "bg-white" : "bg-white ring-1 ring-lime-500/50"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    n.read ? "bg-cream-200 text-ink-500" : "bg-forest-900 text-lime-400"
                  )}
                >
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-ink-900">{n.title}</p>
                    <span className="shrink-0 text-[10px] text-ink-400">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-600">{n.body}</p>
                </div>
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-lime-500" />}
              </button>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
