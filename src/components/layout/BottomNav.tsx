"use client";

import Link from "next/link";
import { LinkPendingHighlight } from "@/components/ui/LinkPendingHighlight";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Map as MapIcon,
  ClipboardList,
  UserRound,
  LayoutGrid,
  Package,
  Star,
  Store,
} from "lucide-react";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { cn } from "@/lib/utils";

const BUYER_TABS = [
  { href: "/home", label: "Início", icon: Home },
  { href: "/busca", label: "Buscar", icon: Search },
  { href: "/mapa", label: "Mapa", icon: MapIcon },
  { href: "/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/perfil", label: "Perfil", icon: UserRound },
];

const PRODUCER_TABS = [
  { href: "/painel", label: "Painel", icon: LayoutGrid },
  { href: "/painel/produtos", label: "Produtos", icon: Package },
  { href: "/painel/pedidos", label: "Pedidos", icon: Store },
  { href: "/painel/avaliacoes", label: "Avaliações", icon: Star },
  { href: "/painel/perfil", label: "Perfil", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();
  const mode = useSessionStore((s) => s.mode);
  const tabs = mode === "produtor" ? PRODUCER_TABS : BUYER_TABS;

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-md items-stretch justify-between border-t border-ink-900/8 bg-white/95 px-2 backdrop-blur">
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            prefetch
            className="relative flex flex-1 flex-col items-center gap-1 py-2.5"
          >
            <LinkPendingHighlight className="rounded-xl" />
            <Icon
              size={21}
              strokeWidth={active ? 2.4 : 1.9}
              className={cn(active ? "text-forest-900" : "text-ink-300")}
            />
            <span
              className={cn(
                "text-[10.5px] font-semibold",
                active ? "text-forest-900" : "text-ink-300"
              )}
            >
              {tab.label}
            </span>
            {active && <span className="h-1 w-1 rounded-full bg-lime-500" />}
          </Link>
        );
      })}
    </nav>
  );
}
