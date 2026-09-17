"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { ProductImage } from "@/components/ui/ProductImage";
import { CATEGORIES } from "@/lib/mockData";
import type { Product, Unit } from "@/lib/types";
import { cn } from "@/lib/utils";

const UNITS: { key: Unit; label: string }[] = [
  { key: "kg", label: "kg" },
  { key: "unid", label: "unidade" },
  { key: "dz", label: "dúzia" },
  { key: "molho", label: "molho/maço" },
];

const EMOJI_OPTIONS = [
  "🥬", "🥦", "🥕", "🍅", "🫑", "🥒", "🌽", "🥔", "🍠", "🧅",
  "🍌", "🍍", "🥭", "🍋", "🍎", "🍇", "🍈", "🍓",
  "🫘", "🌾", "☕", "🥚", "🧀", "🧈", "🍯", "🍮", "🌿", "🧊",
];

export interface ProductFormValues {
  name: string;
  categoryId: string;
  description: string;
  pricePerUnit: number;
  unit: Unit;
  availableQty: number;
  organic: boolean;
  emoji: string;
}

export function ProductForm({
  initial,
  onSubmit,
  submitLabel = "Salvar produto",
}: {
  initial?: Product;
  onSubmit: (values: ProductFormValues) => void;
  submitLabel?: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? CATEGORIES[0].id);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [pricePerUnit, setPricePerUnit] = useState(initial?.pricePerUnit?.toString() ?? "");
  const [unit, setUnit] = useState<Unit>(initial?.unit ?? "kg");
  const [availableQty, setAvailableQty] = useState(initial?.availableQty?.toString() ?? "");
  const [organic, setOrganic] = useState(initial?.organic ?? false);
  const [emoji, setEmoji] = useState(initial?.imageSeed.emoji ?? "🥬");

  const category = CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[0];
  const valid = name.trim().length > 1 && Number(pricePerUnit) > 0 && Number(availableQty) >= 0;

  function handleSubmit() {
    if (!valid) return;
    onSubmit({
      name: name.trim(),
      categoryId,
      description: description.trim() || "Produto fresco, direto do produtor.",
      pricePerUnit: Number(pricePerUnit),
      unit,
      availableQty: Number(availableQty),
      organic,
      emoji,
    });
  }

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="flex flex-col items-center gap-3">
        <ProductImage
          seed={{ emoji, from: category.gradient[0], to: category.gradient[1] }}
          className="h-28 w-28"
          emojiClassName="text-6xl"
        />
        <div className="grid grid-cols-7 gap-2">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg text-lg",
                emoji === e ? "bg-forest-900" : "bg-cream-200"
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-ink-700">Nome do produto</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Alface Crespa"
          className="w-full rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-forest-700"
        />
      </label>

      <div>
        <span className="mb-1.5 block text-xs font-bold text-ink-700">Categoria</span>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold",
                categoryId === c.id ? "bg-forest-900 text-cream-100" : "bg-cream-200 text-ink-700"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-ink-700">Descrição</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Conte como é o cultivo, colheita, diferenciais…"
          className="w-full resize-none rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-forest-700"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-ink-700">Preço (R$)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.1}
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(e.target.value)}
            placeholder="0,00"
            className="w-full rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-forest-700"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-ink-700">Unidade</span>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            className="w-full rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-forest-700"
          >
            {UNITS.map((u) => (
              <option key={u.key} value={u.key}>
                {u.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-ink-700">Quantidade disponível</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          value={availableQty}
          onChange={(e) => setAvailableQty(e.target.value)}
          placeholder="0"
          className="w-full rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-forest-700"
        />
      </label>

      <label className="flex items-center justify-between rounded-xl bg-cream-200 px-4 py-3">
        <span className="text-sm font-semibold text-ink-900">Produto orgânico / agroecológico</span>
        <input
          type="checkbox"
          checked={organic}
          onChange={(e) => setOrganic(e.target.checked)}
          className="h-5 w-5 accent-forest-900"
        />
      </label>

      <Button size="lg" disabled={!valid} onClick={handleSubmit}>
        {submitLabel}
      </Button>
    </div>
  );
}
