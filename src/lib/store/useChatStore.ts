import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ChatMessage, Conversation, ProfileMode } from "../types";
import { CHAT_MESSAGES, CONVERSATIONS, BUYER_ID } from "../mockData";
import { uid } from "../utils";

interface ChatState {
  conversations: Conversation[];
  messages: ChatMessage[];
  getOrCreateConversation: (producerId: string) => string;
  sendMessage: (conversationId: string, sender: ProfileMode, text: string) => void;
  markRead: (conversationId: string, reader: ProfileMode) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: CONVERSATIONS,
      messages: CHAT_MESSAGES,
      getOrCreateConversation: (producerId) => {
        const found = get().conversations.find((c) => c.producerId === producerId);
        if (found) return found.id;
        const conv: Conversation = {
          id: uid("conv"),
          buyerId: BUYER_ID,
          producerId,
          lastMessageAt: new Date().toISOString(),
          lastMessagePreview: "",
          unreadForBuyer: 0,
          unreadForProducer: 0,
        };
        set({ conversations: [conv, ...get().conversations] });
        return conv.id;
      },
      sendMessage: (conversationId, sender, text) => {
        const msg: ChatMessage = {
          id: uid("msg"),
          conversationId,
          senderRole: sender,
          text,
          createdAt: new Date().toISOString(),
          read: false,
        };
        set({
          messages: [...get().messages, msg],
          conversations: get().conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessageAt: msg.createdAt,
                  lastMessagePreview: text,
                  unreadForBuyer:
                    sender === "produtor" ? c.unreadForBuyer + 1 : c.unreadForBuyer,
                  unreadForProducer:
                    sender === "comprador" ? c.unreadForProducer + 1 : c.unreadForProducer,
                }
              : c
          ),
        });
      },
      markRead: (conversationId, reader) => {
        const current = get().conversations.find((c) => c.id === conversationId);
        if (!current) return;
        if (reader === "comprador" && current.unreadForBuyer === 0) return;
        if (reader === "produtor" && current.unreadForProducer === 0) return;
        set({
          conversations: get().conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  unreadForBuyer: reader === "comprador" ? 0 : c.unreadForBuyer,
                  unreadForProducer: reader === "produtor" ? 0 : c.unreadForProducer,
                }
              : c
          ),
        });
      },
    }),
    { name: "ceasa-chat", storage: createJSONStorage(() => localStorage) }
  )
);
