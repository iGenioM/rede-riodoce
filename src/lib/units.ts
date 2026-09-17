import type { Unit } from "./types";

/** Unidades típicas de hortifruti/grãos no atacado (CEASA / distribuidor). */
export const UNIT_OPTIONS: { key: Unit; label: string; hint: string }[] = [
  { key: "cx", label: "Caixa", hint: "Folhas, frutas e legumes embalados (ex.: 15–25 kg)" },
  { key: "saco", label: "Saco", hint: "Grãos e raízes a granel (ex.: 25 ou 60 kg)" },
  { key: "fardo", label: "Fardo", hint: "Milho verde, embalagens agrupadas" },
  { key: "engradado", label: "Engradado", hint: "Processados, potes ou garrafas no atacado" },
];

const LABELS: Record<Unit, string> = {
  cx: "caixa",
  saco: "saco",
  fardo: "fardo",
  engradado: "engradado",
};

export function unitLabel(unit: Unit, plural = false): string {
  const base = LABELS[unit] ?? unit;
  if (!plural) return base;
  if (base === "caixa") return "caixas";
  if (base === "saco") return "sacos";
  if (base === "fardo") return "fardos";
  if (base === "engradado") return "engradados";
  return base;
}

export function formatUnitPrice(unit: Unit): string {
  return `/${unitLabel(unit)}`;
}

/** Atacado: quantidades inteiras por embalagem. */
export function qtyStep(_unit: Unit): number {
  return 1;
}

/** A partir de quantas embalagens o comprador pode enviar proposta de preço. */
export function defaultMinQtyForProposal(unit: Unit): number {
  if (unit === "saco") return 3;
  if (unit === "fardo") return 4;
  return 5;
}

export function formatQtyWholesale(qty: number, unit: Unit): string {
  const n = Number.isInteger(qty) ? qty.toString() : qty.toFixed(0);
  return `${n} ${Number(qty) === 1 ? unitLabel(unit) : unitLabel(unit, true)}`;
}
