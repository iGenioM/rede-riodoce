import type { CartItem, Product } from "./types";

export function lineUnitPrice(
  product: Product | undefined,
  item: CartItem,
  acceptedFromProposal?: number
): number {
  if (item.negotiatedPricePerUnit != null) return item.negotiatedPricePerUnit;
  if (acceptedFromProposal != null) return acceptedFromProposal;
  return product?.pricePerUnit ?? 0;
}

export function cartLineTotal(
  product: Product | undefined,
  item: CartItem,
  acceptedFromProposal?: number
): number {
  return lineUnitPrice(product, item, acceptedFromProposal) * item.qty;
}
