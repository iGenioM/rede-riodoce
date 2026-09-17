"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HandCoins, Check, X } from "lucide-react";
import { Avatar, Badge, Button, EmptyState } from "@/components/ui";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageLoadingFallback } from "@/components/layout/PageLoadingFallback";
import { useNavigate } from "@/hooks/useNavigate";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { useProposalsStore } from "@/lib/store/useProposalsStore";
import { useNotificationsStore } from "@/lib/store/useNotificationsStore";
import { useProducersStore } from "@/lib/store/useProducersStore";
import { useToastStore } from "@/lib/store/useToastStore";
import { formatBRL, formatDateShort } from "@/lib/utils";
import { unitLabel } from "@/lib/units";

function PainelPropostasContent() {
  const { push } = useNavigate();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("proposta");

  const producerId = useSessionStore((s) => s.producerId);
  const setMode = useSessionStore((s) => s.setMode);
  const proposals = useProposalsStore((s) => s.proposals);
  const respond = useProposalsStore((s) => s.respond);
  const producers = useProducersStore((s) => s.producers);
  const notify = useNotificationsStore((s) => s.add);
  const show = useToastStore((s) => s.show);
  const [filter, setFilter] = useState<"pendente" | "todas">("pendente");
  const [hydrated, setHydrated] = useState(
    () => useProposalsStore.persist.hasHydrated()
  );

  useEffect(() => {
    setMode("produtor");
    const unsub = useProposalsStore.persist.onFinishHydration(() => setHydrated(true));
    if (useProposalsStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, [setMode]);

  useEffect(() => {
    if (!highlightId) return;
    const target = proposals.find((p) => p.id === highlightId);
    if (target?.producerId) {
      useSessionStore.getState().setProducerId(target.producerId);
    }
  }, [highlightId, proposals]);

  const { list, showingAllProducers } = useMemo(() => {
    const forProducer = proposals.filter((p) => p.producerId === producerId);
    let base = forProducer.length > 0 ? forProducer : proposals;
    const showingAll = forProducer.length === 0 && proposals.length > 0;

    if (highlightId) {
      const highlighted = proposals.find((p) => p.id === highlightId);
      if (highlighted && !base.some((p) => p.id === highlighted.id)) {
        base = [highlighted, ...base];
      }
    }

    const filtered =
      filter === "pendente" ? base.filter((p) => p.status === "pendente") : base;

    return { list: filtered, showingAllProducers: showingAll };
  }, [proposals, producerId, filter, highlightId]);

  function accept(id: string) {
    const p = respond(id, "aceita");
    if (!p) return;
    notify({
      scope: "comprador",
      type: "proposta",
      title: "Proposta aceita!",
      body: `${p.productName}: ${formatBRL(p.proposedPricePerUnit)}/${unitLabel(p.unit)} para ${p.qty} ${unitLabel(p.unit, true)}.`,
      link: `/oferta/${p.productId}`,
    });
    show("Proposta aceita — o comprador foi avisado.", "success");
  }

  function reject(id: string) {
    const p = respond(id, "recusada");
    if (!p) return;
    notify({
      scope: "comprador",
      type: "proposta",
      title: "Proposta recusada",
      body: `O produtor manteve o preço de tabela em ${p.productName}.`,
      link: `/oferta/${p.productId}`,
    });
    show("Proposta recusada.", "default");
  }

  if (!hydrated) {
    return (
      <AppShell>
        <PageHeader title="Propostas de preço" onBack={() => push("/painel")} />
        <p className="px-4 pt-6 text-center text-sm font-medium text-ink-500">Carregando propostas…</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader title="Propostas de preço" onBack={() => push("/painel")} />

      <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
        <p className="text-xs leading-relaxed text-ink-500">
          Responda às negociações de atacado enviadas pelos estabelecimentos compradores.
        </p>

        {showingAllProducers && (
          <p className="rounded-xl bg-cream-200 px-3 py-2 text-xs font-medium text-ink-700">
            Exibindo propostas de todos os produtores do protótipo (sua conta de vendedor pode
            representar mais de uma propriedade).
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter("pendente")}
            className={`rounded-full px-4 py-2 text-xs font-bold ${filter === "pendente" ? "bg-forest-900 text-cream-100" : "bg-cream-200 text-ink-700"}`}
          >
            Pendentes
          </button>
          <button
            type="button"
            onClick={() => setFilter("todas")}
            className={`rounded-full px-4 py-2 text-xs font-bold ${filter === "todas" ? "bg-forest-900 text-cream-100" : "bg-cream-200 text-ink-700"}`}
          >
            Histórico
          </button>
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon={<HandCoins size={26} />}
            title="Nenhuma proposta por aqui"
            description={
              filter === "pendente"
                ? "Quando um comprador negociar volume acima do mínimo, a proposta aparece aqui. Envie uma proposta como comprador em uma oferta e volte ao modo produtor."
                : "Ainda não há propostas no histórico."
            }
          />
        ) : (
          list.map((p) => {
            const farm = producers.find((pr) => pr.id === p.producerId);
            const isHighlight = p.id === highlightId;
            return (
              <article
                key={p.id}
                className={`rounded-2xl bg-white p-4 shadow-sm ${isHighlight ? "ring-2 ring-lime-500" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <Avatar seed={p.buyerAvatarSeed} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-900">{p.buyerBusinessName}</p>
                    <p className="text-[11px] text-ink-500">{p.buyerContactName}</p>
                    <p className="mt-2 text-sm font-bold text-ink-900">{p.productName}</p>
                    {farm && (
                      <p className="text-[11px] text-ink-500">Produtor: {farm.farmName}</p>
                    )}
                    <p className="text-xs text-ink-500">
                      {p.qty} {unitLabel(p.unit, p.qty > 1)} · {formatDateShort(p.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      p.status === "pendente" ? "gold" : p.status === "aceita" ? "lime" : "outline"
                    }
                  >
                    {p.status === "pendente" ? "Nova" : p.status === "aceita" ? "Aceita" : "Recusada"}
                  </Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-cream-100 p-3 text-xs">
                  <div>
                    <p className="text-ink-500">Preço de tabela</p>
                    <p className="font-bold text-ink-900">
                      {formatBRL(p.listPricePerUnit)}/{unitLabel(p.unit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-ink-500">Proposta do comprador</p>
                    <p className="font-bold text-forest-800">
                      {formatBRL(p.proposedPricePerUnit)}/{unitLabel(p.unit)}
                    </p>
                  </div>
                </div>

                {p.note && <p className="mt-2 text-xs text-ink-600">“{p.note}”</p>}

                {p.status === "pendente" && (
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => reject(p.id)}>
                      <X size={16} />
                      Recusar
                    </Button>
                    <Button className="flex-1" onClick={() => accept(p.id)}>
                      <Check size={16} />
                      Aceitar
                    </Button>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </AppShell>
  );
}

export default function PainelPropostasPage() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <PainelPropostasContent />
    </Suspense>
  );
}
