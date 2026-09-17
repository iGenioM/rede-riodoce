"use client";

import { useMemo } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { MessageCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, EmptyState } from "@/components/ui";
import { useChatStore } from "@/lib/store/useChatStore";
import { useProducersStore } from "@/lib/store/useProducersStore";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { timeAgo } from "@/lib/utils";

export default function ChatListPage() {
  const { push, replace, back } = useNavigate();
  const mode = useSessionStore((s) => s.mode);
  const producerId = useSessionStore((s) => s.producerId);
  const conversations = useChatStore((s) => s.conversations);
  const producers = useProducersStore((s) => s.producers);

  const list = useMemo(() => {
    const filtered = mode === "produtor" ? conversations.filter((c) => c.producerId === producerId) : conversations;
    return [...filtered].sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }, [conversations, mode, producerId]);

  return (
    <AppShell>
      <PageHeader title="Mensagens" onBack={() => push(mode === "produtor" ? "/painel" : "/perfil")} />

      <div className="flex flex-col gap-1 px-2 pt-3">
        {list.length === 0 ? (
          <EmptyState icon={<MessageCircle size={24} />} title="Nenhuma conversa ainda" />
        ) : (
          list.map((conv) => {
            const producer = producers.find((p) => p.id === conv.producerId);
            const unread = mode === "produtor" ? conv.unreadForProducer : conv.unreadForBuyer;
            const title = mode === "produtor" ? "Comprador" : producer?.farmName ?? "Produtor";
            return (
              <button
                key={conv.id}
                onClick={() => push(`/chat/${conv.id}`)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-left active:bg-cream-200"
              >
                {producer ? (
                  <Avatar seed={producer.avatarSeed} size={48} />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-200 text-xl">🙋</div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-ink-900">{title}</p>
                    <span className="shrink-0 text-[10px] text-ink-400">{timeAgo(conv.lastMessageAt)}</span>
                  </div>
                  <p className="truncate text-xs text-ink-500">{conv.lastMessagePreview || "Diga olá 👋"}</p>
                </div>
                {unread > 0 && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-lime-500 px-1 text-[10px] font-bold text-forest-900">
                    {unread}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
