"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Phone } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, EmptyState } from "@/components/ui";
import { useChatStore } from "@/lib/store/useChatStore";
import { useProducersStore } from "@/lib/store/useProducersStore";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { cn } from "@/lib/utils";

export default function ChatThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const mode = useSessionStore((s) => s.mode);
  const conversation = useChatStore((s) => s.conversations.find((c) => c.id === id));
  const allMessages = useChatStore((s) => s.messages);
  const messages = useMemo(
    () => allMessages.filter((m) => m.conversationId === id),
    [allMessages, id]
  );
  const sendMessage = useChatStore((s) => s.sendMessage);
  const markRead = useChatStore((s) => s.markRead);
  const producer = useProducersStore((s) => s.producers.find((p) => p.id === conversation?.producerId));
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markRead(id, mode);
  }, [id, mode, markRead]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const sorted = useMemo(
    () => [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [messages]
  );

  if (!conversation || !producer) {
    return (
      <AppShell>
        <PageHeader title="Conversa" />
        <EmptyState title="Conversa não encontrada" />
      </AppShell>
    );
  }

  function handleSend() {
    if (!draft.trim()) return;
    sendMessage(conversation!.id, mode, draft.trim());
    setDraft("");
  }

  const title = mode === "produtor" ? "Comprador" : producer.farmName;

  return (
    <AppShell hideNav>
      <div className="flex h-dvh flex-col">
        <PageHeader
          title={title}
          tone="dark"
          onBack={() => router.push("/chat")}
          right={
            mode === "comprador" ? (
              <button
                onClick={() => window.open(`https://wa.me/${producer.whatsapp}`, "_blank")}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
              >
                <Phone size={16} />
              </button>
            ) : undefined
          }
        />

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-4 flex flex-col items-center gap-2">
            <Avatar seed={producer.avatarSeed} size={56} />
            <p className="text-sm font-bold text-ink-900">{producer.farmName}</p>
            <p className="text-xs text-ink-500">Respostas costumam ser rápidas por aqui 🌱</p>
          </div>

          <div className="flex flex-col gap-2.5">
            {sorted.map((m) => {
              const mine = m.senderRole === mode;
              return (
                <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm",
                      mine ? "rounded-br-sm bg-forest-900 text-cream-100" : "rounded-bl-sm bg-white text-ink-900 shadow-sm"
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>
          <div ref={endRef} />
        </div>

        <div className="safe-bottom flex items-center gap-2 border-t border-ink-900/8 bg-cream-100 px-3 py-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escreva uma mensagem…"
            className="flex-1 rounded-full border border-ink-900/10 bg-white px-4 py-2.5 text-sm text-ink-900 outline-none focus:border-forest-700"
          />
          <button
            onClick={handleSend}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-500 text-forest-900 active:scale-90 transition-transform"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
