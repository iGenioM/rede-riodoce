import type { ImageSeed, Product, Unit } from "./types";

/** Resumo agregado de um "tipo de produto" (ex.: alface), reunindo todas as
 * ofertas de produtores diferentes que vendem a mesma coisa. */
export interface ProductTypeSummary {
  typeId: string;
  name: string;
  categoryId: string;
  imageSeed: ImageSeed;
  unit: Unit;
  minPrice: number;
  maxPrice: number;
  offerCount: number;
  organicAny: boolean;
  totalSold: number;
  latestHarvestedAt: string;
  offers: Product[];
}

export function groupProductsByType(products: Product[]): ProductTypeSummary[] {
  const map = new Map<string, Product[]>();
  for (const p of products) {
    const list = map.get(p.productTypeId);
    if (list) list.push(p);
    else map.set(p.productTypeId, [p]);
  }

  const summaries: ProductTypeSummary[] = [];
  for (const [typeId, offers] of map) {
    const sortedByPrice = [...offers].sort((a, b) => a.pricePerUnit - b.pricePerUnit);
    const cheapest = sortedByPrice[0];
    const latest = offers.reduce((max, o) => (o.harvestedAt > max ? o.harvestedAt : max), offers[0].harvestedAt);
    summaries.push({
      typeId,
      name: cheapest.name,
      categoryId: cheapest.categoryId,
      imageSeed: cheapest.imageSeed,
      unit: cheapest.unit,
      minPrice: sortedByPrice[0].pricePerUnit,
      maxPrice: sortedByPrice[sortedByPrice.length - 1].pricePerUnit,
      offerCount: offers.length,
      organicAny: offers.some((o) => o.organic),
      totalSold: offers.reduce((sum, o) => sum + o.soldTotal, 0),
      latestHarvestedAt: latest,
      offers,
    });
  }
  return summaries;
}

export function getProductTypeSummary(products: Product[], typeId: string): ProductTypeSummary | null {
  const offers = products.filter((p) => p.productTypeId === typeId);
  if (offers.length === 0) return null;
  return groupProductsByType(offers)[0];
}
