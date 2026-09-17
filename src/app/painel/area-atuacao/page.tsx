"use client";

import { useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { MapPin } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui";
import { MapView } from "@/components/map/MapView";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { useProducersStore } from "@/lib/store/useProducersStore";
import { useToastStore } from "@/lib/store/useToastStore";

export default function AreaAtuacaoPage() {
  const { push, replace, back } = useNavigate();
  const producerId = useSessionStore((s) => s.producerId);
  const producer = useProducersStore((s) => s.producers.find((p) => p.id === producerId));
  const updateRadius = useProducersStore((s) => s.updateRadius);
  const showToast = useToastStore((s) => s.show);
  const [radius, setRadius] = useState(producer?.radiusKm ?? 30);

  if (!producer) return null;

  function save() {
    updateRadius(producer!.id, radius);
    showToast("Área de atuação atualizada", "success");
  }

  return (
    <AppShell>
      <PageHeader title="Área de atuação" onBack={() => push("/painel/perfil")} />

      <div className="h-56 w-full">
        <MapView
          center={producer.location}
          zoom={9}
          markers={[]}
          showUserMarker={false}
          radiusCircle={{ center: producer.location, km: radius, color: "#0d2118" }}
          className="h-full w-full"
        />
      </div>

      <div className="flex flex-col gap-5 px-4 pt-5">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold text-ink-900">
              <MapPin size={15} className="text-forest-700" /> Raio de entrega
            </p>
            <span className="text-lg font-extrabold text-forest-800">{radius} km</span>
          </div>
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="mt-4 w-full accent-forest-900"
          />
          <div className="mt-1 flex justify-between text-[10px] font-semibold text-ink-400">
            <span>5 km</span>
            <span>100 km</span>
          </div>
        </div>

        <p className="text-xs text-ink-500">
          Compradores fora deste raio ainda podem ver seus produtos, mas o frete calculado pode ficar alto. Ajuste
          conforme sua capacidade real de entrega ou retirada combinada.
        </p>

        <Button size="lg" onClick={save}>
          Salvar área de atuação
        </Button>
      </div>
    </AppShell>
  );
}
