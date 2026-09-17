import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AppNotification, ProfileMode } from "../types";
import { NOTIFICATIONS } from "../mockData";
import { uid } from "../utils";

interface NotificationsState {
  notifications: AppNotification[];
  add: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: (scope: ProfileMode) => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: NOTIFICATIONS,
      add: (n) =>
        set({
          notifications: [
            { ...n, id: uid("not"), createdAt: new Date().toISOString(), read: false },
            ...get().notifications,
          ],
        }),
      markRead: (id) =>
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }),
      markAllRead: (scope) => {
        const unread = get().notifications.some((n) => n.scope === scope && !n.read);
        if (!unread) return;
        set({
          notifications: get().notifications.map((n) =>
            n.scope === scope ? { ...n, read: true } : n
          ),
        });
      },
    }),
    { name: "ceasa-notifications", storage: createJSONStorage(() => localStorage) }
  )
);
