import { create } from "zustand";

interface NavigationState {
  isNavigating: boolean;
  startedAt: number;
  start: () => void;
  finish: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  isNavigating: false,
  startedAt: 0,
  start: () => set({ isNavigating: true, startedAt: Date.now() }),
  finish: () => set({ isNavigating: false, startedAt: 0 }),
}));
