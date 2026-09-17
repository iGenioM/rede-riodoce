import { create } from "zustand";
import { uid } from "../utils";

export interface Toast {
  id: string;
  message: string;
  variant: "default" | "success" | "error";
}

interface ToastState {
  toasts: Toast[];
  show: (message: string, variant?: Toast["variant"]) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  show: (message, variant = "default") => {
    const toast: Toast = { id: uid("toast"), message, variant };
    set({ toasts: [...get().toasts, toast] });
    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== toast.id) });
    }, 2600);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
