"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  ClipboardList,
  MessageCircle,
  Bell,
  Sprout,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, Button, Divider } from "@/components/ui";
import { BottomSheet } from "@/components/ui/Sheet";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { useChatStore } from "@/lib/store/useChatStore";
import { SUL_DE_MINAS_CITIES } from "@/lib/cities";
import { useToastStore } from "@/lib/store/useToastStore";
import { cn } from "@/lib/utils";

export default function PerfilPage() {
  const router = useRouter();
  const buyerName = useSessionStore((s) => s.buyerName);
  const buyerCnpj = useSessionStore((s) => s.buyerCnpj);
  const buyerContactName = useSessionStore((s) => s.buyerContactName);
  const buyerAvatarSeed = useSessionStore((s) => s.buyerAvatarSeed);
  const buyerAddress = useSessionStore((s) => s.buyerAddress);
  const setBuyerAddress = useSessionStore((s) => s.setBuyerAddress);
  const setMode = useSessionStore((s) => s.setMode);
  const logout = useSessionStore((s) => s.logout);
  const conversations = useChatStore((s) => s.conversations);
  const showToast = useToastStore((s) => s.show);

  const unreadChats = conversations.reduce((s, c) => s + c.unreadForBuyer, 0);

  const [addressOpen, setAddressOpen] = useState(false);
  const [street, setStreet] = useState(buyerAddress.street);
  const [city, setCity] = useState(buyerAddress.city);

  function saveAddress() {
    const cityData = SUL_DE_MINAS_CITIES.find((c) => c.name === city) ?? SUL_DE_MINAS_CITIES[0];
    setBuyerAddress({
      label: "Casa",
      street,
      city: cityData.name,
      state: "MG",
      location: cityData.location,
    });
    setAddressOpen(false);
    showToast("Endereço atualizado", "success");
  }

  return (
    <AppShell>
      <PageHeader title="Perfil" onBack={() => router.push("/home")} />

      <div className="flex flex-col gap-5 px-4 pt-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <Avatar seed={buyerAvatarSeed} size={56} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-extrabold text-ink-900">{buyerName}</p>
            <p className="truncate text-xs text-ink-500">CNPJ {buyerCnpj}</p>
            <p className="truncate text-xs text-ink-500">Contato: {buyerContactName}</p>
          </div>
        </div>

        <button
          onClick={() => setAddressOpen(true)}
          className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-200 text-forest-800">
            <MapPin size={17} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-500">Endereço de entrega</p>
            <p className="truncate text-sm font-semibold text-ink-900">
              {buyerAddress.street} — {buyerAddress.city}/{buyerAddress.state}
            </p>
          </div>
          <ChevronRight size={16} className="text-ink-300" />
        </button>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <ProfileLink icon={ClipboardList} label="Meus pedidos" onClick={() => router.push("/pedidos")} />
          <Divider />
          <ProfileLink
            icon={MessageCircle}
            label="Mensagens"
            badge={unreadChats > 0 ? unreadChats : undefined}
            onClick={() => router.push("/chat")}
          />
          <Divider />
          <ProfileLink icon={Bell} label="Notificações" onClick={() => router.push("/notificacoes")} />
        </div>

        <button
          onClick={() => {
            setMode("produtor");
            router.push("/painel");
          }}
          className="flex items-center gap-3 rounded-2xl bg-forest-900 p-4 text-left text-cream-100 shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-500/20 text-lime-400">
            <Sprout size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Sou produtor rural</p>
            <p className="text-xs text-cream-100/70">Alternar para o modo Produtor e vender meus produtos</p>
          </div>
          <ChevronRight size={16} className="text-cream-100/50" />
        </button>

        <div className="flex items-center gap-2 rounded-xl bg-sky/10 px-3.5 py-3 text-xs font-medium text-sky">
          <Smartphone size={16} className="shrink-0" />
          Instale o app na tela inicial para usar offline, mesmo sem internet no assentamento.
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-cream-200 px-3.5 py-3 text-xs text-ink-500">
          <ShieldCheck size={16} className="shrink-0" />
          Protótipo — todos os dados são fictícios e ficam salvos apenas neste dispositivo.
        </div>

        <Button
          variant="ghost"
          className="justify-start text-tomato"
          onClick={() => {
            logout();
            router.replace("/login");
          }}
        >
          <LogOut size={16} /> Sair
        </Button>
      </div>

      <BottomSheet open={addressOpen} onClose={() => setAddressOpen(false)} title="Endereço de entrega">
        <div className="pb-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink-700">Rua e número</span>
            <input
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-forest-700"
            />
          </label>

          <p className="mb-2 mt-4 text-xs font-bold text-ink-700">Cidade</p>
          <div className="flex flex-wrap gap-2">
            {SUL_DE_MINAS_CITIES.map((c) => (
              <button
                key={c.name}
                onClick={() => setCity(c.name)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-bold",
                  city === c.name ? "bg-forest-900 text-cream-100" : "bg-cream-200 text-ink-700"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>

          <Button className="mt-5 w-full" onClick={saveAddress}>
            Salvar endereço
          </Button>
        </div>
      </BottomSheet>
    </AppShell>
  );
}

function ProfileLink({
  icon: Icon,
  label,
  onClick,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-200 text-forest-800">
        <Icon size={16} />
      </div>
      <span className="flex-1 text-sm font-semibold text-ink-900">{label}</span>
      {badge && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-tomato px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
      <ChevronRight size={16} className="text-ink-300" />
    </button>
  );
}
