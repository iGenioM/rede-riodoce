import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "../types";
import { PRODUCTS } from "../mockData";
import { uid, slugify } from "../utils";

interface ProductsState {
  products: Product[];
  addProduct: (p: Omit<Product, "id" | "soldTotal" | "productTypeId">) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  toggleActive: (id: string) => void;
  decrementStock: (id: string, qty: number) => void;
}

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      products: PRODUCTS,
      addProduct: (p) => {
        // productTypeId é derivado do nome — assim, se outro produtor já
        // vende algo com o mesmo nome, os dois viram "ofertas" do mesmo
        // produto automaticamente (ver src/lib/offers.ts).
        const product: Product = { ...p, id: uid("prod"), soldTotal: 0, productTypeId: `type_${slugify(p.name)}` };
        set({ products: [product, ...get().products] });
        return product;
      },
      updateProduct: (id, patch) =>
        set({
          products: get().products.map((p) =>
            p.id === id
              ? { ...p, ...patch, productTypeId: patch.name ? `type_${slugify(patch.name)}` : p.productTypeId }
              : p
          ),
        }),
      removeProduct: (id) =>
        set({ products: get().products.filter((p) => p.id !== id) }),
      toggleActive: (id) =>
        set({
          products: get().products.map((p) =>
            p.id === id ? { ...p, active: !p.active } : p
          ),
        }),
      decrementStock: (id, qty) =>
        set({
          products: get().products.map((p) =>
            p.id === id
              ? {
                  ...p,
                  availableQty: Math.max(0, p.availableQty - qty),
                  soldTotal: p.soldTotal + qty,
                }
              : p
          ),
        }),
    }),
    { name: "ceasa-products", storage: createJSONStorage(() => localStorage) }
  )
);
