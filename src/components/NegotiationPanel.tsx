"use client";

import { useMemo, useState } from "react";
import { HandCoins } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { useProposalsStore } from "@/lib/store/useProposalsStore";
import { useNotificationsStore } from "@/lib/store/useNotificationsStore";
import { useToastStore } from "@/lib/store/useToastStore";
import type { Product } from "@/lib/types";
import { formatBRL } from "@/lib/utils";
import { unitLabel } from "@/lib/units";

export function NegotiationPanel({
  product,
  qty,
}: {
  product: Product;
  qty: number;
}) {
  const buyerName = useSessionStore((s) => s.buyerName);
  const buyerContact = useSessionStore((s) => s.buyerContactName);
  const buyerAvatarSeed = useSessionStore((s) => s.buyerAvatarSeed);
  const submit = useProposalsStore((s) => s.submit);
  const proposals = useProposalsStore((s) => s.proposals);
  const active = useMemo(() => {
    const mine = proposals.filter(
      (p) => p.productId === product.id && p.buyerBusinessName === buyerName
    );
    return mine.find((p) => p.status === "pendente") ?? mine.find((p) => p.status === "aceita");
  }, [proposals, product.id, buyerName]);
  const notify = useNotificationsStore((s) => s.add);
  const show = useToastStore((s) => s.show);

  const [proposed, setProposed] = useState(
    () => String(Math.max(1, Math.round(product.pricePerUnit * 0.92)))
  );
  const [note, setNote] = useState("");

  const canNegotiate = qty >= product.minQtyForProposal;
  const minHint = product.minQtyForProposal;

  const savings = useMemo(() => {
    const p = Number(proposed);
    if (!Number.isFinite(p) || p <= 0) return 0;
    return Math.max(0, (product.pricePerUnit - p) * qty);
  }, [proposed, product.pricePerUnit, qty]);

  if (!canNegotiate) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-ink-300/50 bg-cream-50 px-4 py-3 text-xs text-ink-500">
        Negocie preço a partir de{" "}
        <strong className="text-ink-700">
          {minHint} {unitLabel(product.unit, minHint > 1)}
        </strong>
        . Você selecionou {qty} {unitLabel(product.unit, qty > 1)}.
      </div>
    );
  }

  if (active?.status === "pendente") {
    return (
      <div className="mt-4 rounded-2xl bg-gold/10 px-4 py-4">
        <Badge variant="gold" className="mb-2">
          Proposta enviada
        </Badge>
        <p className="text-sm font-semibold text-ink-900">
          Aguardando resposta do produtor
        </p>
        <p className="mt-1 text-xs text-ink-500">
          {formatBRL(active.proposedPricePerUnit)}/{unitLabel(product.unit)} · {active.qty}{" "}
          {unitLabel(product.unit, active.qty > 1)}
        </p>
      </div>
    );
  }

  if (active?.status === "aceita") {
    return (
      <div className="mt-4 rounded-2xl bg-lime-500/15 px-4 py-4">
        <Badge variant="lime" className="mb-2">
          Preço acordado
        </Badge>
        <p className="text-sm font-bold text-forest-900">
          {formatBRL(active.proposedPricePerUnit)}/{unitLabel(product.unit)} confirmado pelo produtor
        </p>
        <p className="mt-1 text-xs text-ink-500">Use “Adicionar ao carrinho” para comprar com esse valor.</p>
      </div>
    );
  }

  function sendProposal() {
    const price = Number(proposed.replace(",", "."));
    if (!Number.isFinite(price) || price <= 0) {
      show("Informe um valor válido na proposta.", "error");
      return;
    }
    if (price >= product.pricePerUnit) {
      show("A proposta precisa ser menor que o preço de tabela.", "default");
      return;
    }

    const proposal = submit({
      productId: product.id,
      productName: product.name,
      producerId: product.producerId,
      buyerBusinessName: buyerName,
      buyerContactName: buyerContact,
      buyerAvatarSeed,
      qty,
      unit: product.unit,
      listPricePerUnit: product.pricePerUnit,
      proposedPricePerUnit: price,
      note: note.trim() || undefined,
    });

    notify({
      scope: "produtor",
      type: "proposta",
      title: "Nova proposta de preço",
      body: `${buyerName} quer ${proposal.qty} ${unitLabel(product.unit, proposal.qty > 1)} de ${product.name} por ${formatBRL(price)}/${unitLabel(product.unit)}.`,
      link: `/painel/propostas?proposta=${proposal.id}`,
      producerId: product.producerId,
      proposalId: proposal.id,
    });

    show("Proposta enviada! O produtor foi notificado.", "success");
  }

  return (
    <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink-900/5">
      <div className="flex items-center gap-2 text-sm font-bold text-ink-900">
        <HandCoins size={18} className="text-forest-800" />
        Negociar preço (atacado)
      </div>
      <p className="mt-1 text-xs text-ink-500">
        Tabela: {formatBRL(product.pricePerUnit)}/{unitLabel(product.unit)} · volume: {qty}{" "}
        {unitLabel(product.unit, qty > 1)}
      </p>

      <label className="mt-3 block">
        <span className="mb-1 block text-xs font-bold text-ink-700">Seu preço por {unitLabel(product.unit)} (R$)</span>
        <input
          type="number"
          inputMode="decimal"
          min={1}
          step={1}
          value={proposed}
          onChange={(e) => setProposed(e.target.value)}
          className="w-full rounded-xl border border-ink-900/10 bg-cream-50 px-4 py-3 text-sm font-bold text-ink-900 outline-none focus:border-forest-700"
        />
      </label>

      {savings > 0 && (
        <p className="mt-2 text-xs font-semibold text-forest-800">
          Economia estimada: {formatBRL(savings)} neste pedido
        </p>
      )}

      <label className="mt-3 block">
        <span className="mb-1 block text-xs font-bold text-ink-700">Observação (opcional)</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex.: retiro amanhã cedo, pagamento à vista"
          className="w-full rounded-xl border border-ink-900/10 bg-cream-50 px-4 py-2.5 text-sm text-ink-900 outline-none focus:border-forest-700"
        />
      </label>

      <Button className="mt-4 w-full" onClick={sendProposal}>
        Enviar proposta ao produtor
      </Button>
    </div>
  );
}
