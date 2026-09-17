"use client";

import { useMemo, useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import {
  MapPin,
  MessageCircle,
  Bell,
  ShoppingBasket,
  HandCoins,
  LogOut,
  ChevronRight,
  Star,
  Package,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, Button, Divider, RatingStars } from "@/components/ui";
import { BottomSheet } from "@/components/ui/Sheet";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { useProducersStore } from "@/lib/store/useProducersStore";
import { useChatStore } from "@/lib/store/useChatStore";
import { useProposalsStore } from "@/lib/store/useProposalsStore";
import { useToastStore } from "@/lib/store/useToastStore";

export default function PainelPerfilPage() {
  const { push, replace, back } = useNavigate();
  const producerId = useSessionStore((s) => s.producerId);
  const setMode = useSessionStore((s) => s.setMode);
  const logout = useSessionStore((s) => s.logout);
  const producer = useProducersStore((s) => s.producers.find((p) => p.id === producerId));
  const updateProfile = useProducersStore((s) => s.updateProfile);
  const allConversations = useChatStore((s) => s.conversations);
  const conversations = useMemo(
    () => allConversations.filter((c) => c.producerId === producerId),
    [allConversations, producerId]
  );
  const showToast = useToastStore((s) => s.show);
  const allProposals = useProposalsStore((s) => s.proposals);
  const pendingProposals = useMemo(
    () =>
      allProposals.filter(
        (p) => p.producerId === producerId && p.status === "pendente"
      ).length,
    [allProposals, producerId]
  );

  const [editOpen, setEditOpen] = useState(false);
  const [farmName, setFarmName] = useState(producer?.farmName ?? "");
  const [bio, setBio] = useState(producer?.bio ?? "");
  const [whatsapp, setWhatsapp] = useState(producer?.whatsapp ?? "");

  if (!producer) return null;

  const unread = conversations.reduce((s, c) => s + c.unreadForProducer, 0);

  function saveProfile() {
    updateProfile(producer!.id, { farmName, bio, whatsapp });
    showToast("Perfil atualizado", "success");
    setEditOpen(false);
  }

  return (
    <AppShell>
      <PageHeader title="Perfil do produtor" onBack={() => push("/painel")} />

      <div className="flex flex-col gap-5 px-4 pt-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <Avatar seed={producer.avatarSeed} size={56} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-extrabold text-ink-900">{producer.farmName}</p>
            <p className="text-xs text-ink-500">{producer.name} · {producer.city}/{producer.state}</p>
            <RatingStars rating={producer.rating} size={12} showValue count={producer.ratingCount} />
          </div>
        </div>

        <Button variant="outline" onClick={() => setEditOpen(true)}>
          Editar informações
        </Button>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <ProfileLink icon={MapPin} label="Área de atuação" sublabel={`${producer.radiusKm} km de raio`} onClick={() => push("/painel/area-atuacao")} />
          <Divider />
          <ProfileLink icon={Package} label="Meus produtos" onClick={() => push("/painel/produtos")} />
          <Divider />
          <ProfileLink
            icon={HandCoins}
            label="Propostas de preço"
            sublabel={pendingProposals > 0 ? `${pendingProposals} aguardando resposta` : "Negociações de atacado"}
            badge={pendingProposals > 0 ? pendingProposals : undefined}
            onClick={() => push("/painel/propostas")}
          />
          <Divider />
          <ProfileLink icon={Star} label="Avaliações" onClick={() => push("/painel/avaliacoes")} />
          <Divider />
          <ProfileLink
            icon={MessageCircle}
            label="Mensagens"
            badge={unread > 0 ? unread : undefined}
            onClick={() => push("/chat")}
          />
          <Divider />
          <ProfileLink icon={Bell} label="Notificações" onClick={() => push("/notificacoes")} />
        </div>

        <button
          onClick={() => {
            setMode("comprador");
            push("/home");
          }}
          className="flex items-center gap-3 rounded-2xl bg-forest-900 p-4 text-left text-cream-100 shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-500/20 text-lime-400">
            <ShoppingBasket size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Quero comprar também</p>
            <p className="text-xs text-cream-100/70">Alternar para o modo Comprador</p>
          </div>
          <ChevronRight size={16} className="text-cream-100/50" />
        </button>

        <Button
          variant="ghost"
          className="justify-start text-tomato"
          onClick={() => {
            logout();
            replace("/login");
          }}
        >
          <LogOut size={16} /> Sair
        </Button>
      </div>

      <BottomSheet open={editOpen} onClose={() => setEditOpen(false)} title="Editar informações">
        <div className="pb-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink-700">Nome da propriedade</span>
            <input
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="w-full rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-forest-700"
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-bold text-ink-700">Sobre a propriedade</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-forest-700"
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-bold text-ink-700">WhatsApp (com DDI/DDD)</span>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-forest-700"
            />
          </label>
          <Button className="mt-5 w-full" onClick={saveProfile}>
            Salvar alterações
          </Button>
        </div>
      </BottomSheet>
    </AppShell>
  );
}

function ProfileLink({
  icon: Icon,
  label,
  sublabel,
  onClick,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-200 text-forest-800">
        <Icon size={16} />
      </div>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-ink-900">{label}</span>
        {sublabel && <span className="block text-[11px] text-ink-500">{sublabel}</span>}
      </span>
      {badge && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-tomato px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
      <ChevronRight size={16} className="text-ink-300" />
    </button>
  );
}
