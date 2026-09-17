import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { BuyerAddress, BuyerKind, ImageSeed, ProfileMode } from "../types";
import {
  BUYER_ID,
  BUYER_NAME,
  BUYER_CNPJ,
  BUYER_KIND,
  BUYER_CONTACT_NAME,
  BUYER_AVATAR_SEED,
  DEFAULT_BUYER_ADDRESS,
} from "../mockData";

// Para o protótipo, o mesmo usuário logado é dono do "Sítio Boa Esperança"
// quando alterna para o modo Produtor.
export const CURRENT_PRODUCER_ID = "prod_boaesperanca";

interface SessionState {
  hasHydrated: boolean;
  onboarded: boolean;
  loggedIn: boolean;
  mode: ProfileMode;
  buyerId: string;
  /** Razão social do estabelecimento comprador logado (CNPJ). */
  buyerName: string;
  buyerCnpj: string;
  buyerKind: BuyerKind;
  /** Pessoa de contato responsável pelas compras no estabelecimento. */
  buyerContactName: string;
  buyerAvatarSeed: ImageSeed;
  buyerAddress: BuyerAddress;
  producerId: string;
  setHasHydrated: (v: boolean) => void;
  completeOnboarding: () => void;
  login: (name?: string) => void;
  logout: () => void;
  setMode: (mode: ProfileMode) => void;
  toggleMode: () => void;
  setBuyerAddress: (address: BuyerAddress) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      onboarded: false,
      loggedIn: false,
      mode: "comprador",
      buyerId: BUYER_ID,
      buyerName: BUYER_NAME,
      buyerCnpj: BUYER_CNPJ,
      buyerKind: BUYER_KIND,
      buyerContactName: BUYER_CONTACT_NAME,
      buyerAvatarSeed: BUYER_AVATAR_SEED,
      buyerAddress: DEFAULT_BUYER_ADDRESS,
      producerId: CURRENT_PRODUCER_ID,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      completeOnboarding: () => set({ onboarded: true }),
      login: (name) => set({ loggedIn: true, buyerName: name || get().buyerName }),
      logout: () => set({ loggedIn: false, mode: "comprador" }),
      setMode: (mode) => set({ mode }),
      toggleMode: () =>
        set({ mode: get().mode === "comprador" ? "produtor" : "comprador" }),
      setBuyerAddress: (address) => set({ buyerAddress: address }),
    }),
    {
      name: "ceasa-session",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
