import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "../types";
import { PRODUCTS } from "../mockData";

interface CartState {
  items: CartItem[];
  addItem: (productId: string, producerId: string, qty: number) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  removeProducer: (producerId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId, producerId, qty) => {
        const existing = get().items.find((i) => i.productId === productId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === productId ? { ...i, qty: i.qty + qty } : i
            ),
          });
        } else {
          set({ items: [...get().items, { productId, producerId, qty }] });
        }
      },
      updateQty: (productId, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter((i) => i.productId !== productId) });
          return;
        }
        set({
          items: get().items.map((i) => (i.productId === productId ? { ...i, qty } : i)),
        });
      },
      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),
      removeProducer: (producerId) =>
        set({ items: get().items.filter((i) => i.producerId !== producerId) }),
      clear: () => set({ items: [] }),
    }),
    { name: "ceasa-cart", storage: createJSONStorage(() => localStorage) }
  )
);

export function cartItemsGroupedByProducer(items: CartItem[]) {
  const groups = new Map<string, CartItem[]>();
  for (const item of items) {
    const arr = groups.get(item.producerId) ?? [];
    arr.push(item);
    groups.set(item.producerId, arr);
  }
  return groups;
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const product = PRODUCTS.find((p) => p.id === item.productId);
    return sum + (product ? product.pricePerUnit * item.qty : 0);
  }, 0);
}
