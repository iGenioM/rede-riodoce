import type { OrderStatus } from "./types";

export const STATUS_FLOW: OrderStatus[] = ["pendente", "aceito", "preparando", "a_caminho", "entregue"];

export const STATUS_META: Record<
  OrderStatus,
  { label: string; short: string; badge: "default" | "lime" | "gold" | "sky" | "tomato"; emoji: string }
> = {
  pendente: { label: "Aguardando confirmação", short: "Pendente", badge: "gold", emoji: "⏳" },
  aceito: { label: "Pedido aceito", short: "Aceito", badge: "sky", emoji: "✅" },
  preparando: { label: "Preparando seu pedido", short: "Preparando", badge: "sky", emoji: "📦" },
  a_caminho: { label: "Saiu para entrega", short: "A caminho", badge: "sky", emoji: "🚚" },
  entregue: { label: "Entregue", short: "Entregue", badge: "lime", emoji: "🎉" },
  recusado: { label: "Recusado pelo produtor", short: "Recusado", badge: "tomato", emoji: "✕" },
  cancelado: { label: "Cancelado", short: "Cancelado", badge: "tomato", emoji: "✕" },
};

export function isActiveStatus(status: OrderStatus): boolean {
  return STATUS_FLOW.includes(status) && status !== "entregue";
}

export function nextStatus(status: OrderStatus): OrderStatus | null {
  const idx = STATUS_FLOW.indexOf(status);
  if (idx === -1 || idx === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}
