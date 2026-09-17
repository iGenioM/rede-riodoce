import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PriceProposal, ProposalStatus } from "../types";
import { uid } from "../utils";

interface ProposalsState {
  proposals: PriceProposal[];
  submit: (input: Omit<PriceProposal, "id" | "status" | "createdAt" | "updatedAt">) => PriceProposal;
  respond: (id: string, status: Exclude<ProposalStatus, "pendente">) => PriceProposal | undefined;
  pendingForProducer: (producerId: string) => PriceProposal[];
  activeForProduct: (productId: string, buyerBusinessName: string) => PriceProposal | undefined;
  acceptedPrice: (productId: string, buyerBusinessName: string) => number | undefined;
}

export const useProposalsStore = create<ProposalsState>()(
  persist(
    (set, get) => ({
      proposals: [],
      submit: (input) => {
        const existing = get().proposals.find(
          (p) =>
            p.productId === input.productId &&
            p.buyerBusinessName === input.buyerBusinessName &&
            p.status === "pendente"
        );
        if (existing) {
          const updated: PriceProposal = {
            ...existing,
            qty: input.qty,
            proposedPricePerUnit: input.proposedPricePerUnit,
            note: input.note,
            updatedAt: new Date().toISOString(),
          };
          set({
            proposals: get().proposals.map((p) => (p.id === existing.id ? updated : p)),
          });
          return updated;
        }
        const proposal: PriceProposal = {
          ...input,
          id: uid("prop"),
          status: "pendente",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ proposals: [proposal, ...get().proposals] });
        return proposal;
      },
      respond: (id, status) => {
        const current = get().proposals.find((p) => p.id === id);
        if (!current || current.status !== "pendente") return undefined;
        const updated: PriceProposal = {
          ...current,
          status,
          updatedAt: new Date().toISOString(),
        };
        set({
          proposals: get().proposals.map((p) => (p.id === id ? updated : p)),
        });
        return updated;
      },
      pendingForProducer: (producerId) =>
        get().proposals.filter((p) => p.producerId === producerId && p.status === "pendente"),
      activeForProduct: (productId, buyerBusinessName) => {
        const list = get().proposals.filter(
          (p) => p.productId === productId && p.buyerBusinessName === buyerBusinessName
        );
        return (
          list.find((p) => p.status === "pendente") ??
          list.find((p) => p.status === "aceita")
        );
      },
      acceptedPrice: (productId, buyerBusinessName) => {
        const accepted = get().proposals.find(
          (p) =>
            p.productId === productId &&
            p.buyerBusinessName === buyerBusinessName &&
            p.status === "aceita"
        );
        return accepted?.proposedPricePerUnit;
      },
    }),
    { name: "ceasa-proposals", storage: createJSONStorage(() => localStorage) }
  )
);
