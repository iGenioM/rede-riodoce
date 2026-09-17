import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Order, OrderStatus } from "../types";
import { ORDERS } from "../mockData";

interface OrdersState {
  orders: Order[];
  addOrders: (orders: Order[]) => void;
  updateStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  setDeliveryEstimate: (orderId: string, iso: string, note?: string) => void;
  markReviewed: (orderId: string) => void;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: ORDERS,
      addOrders: (orders) => set({ orders: [...orders, ...get().orders] }),
      updateStatus: (orderId, status, note) =>
        set({
          orders: get().orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status,
                  updatedAt: new Date().toISOString(),
                  statusHistory: [
                    ...o.statusHistory,
                    { status, at: new Date().toISOString(), note },
                  ],
                }
              : o
          ),
        }),
      setDeliveryEstimate: (orderId, iso, note) =>
        set({
          orders: get().orders.map((o) =>
            o.id === orderId
              ? { ...o, estimatedDeliveryAt: iso, deliveryNote: note ?? o.deliveryNote }
              : o
          ),
        }),
      markReviewed: (orderId) =>
        set({
          orders: get().orders.map((o) =>
            o.id === orderId ? { ...o, reviewed: true } : o
          ),
        }),
    }),
    { name: "ceasa-orders", storage: createJSONStorage(() => localStorage) }
  )
);
