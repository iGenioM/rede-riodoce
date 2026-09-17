"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { CartBar } from "./CartBar";
import { useCartStore } from "@/lib/store/useCartStore";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { cn } from "@/lib/utils";

function useShowCartBar() {
  const pathname = usePathname();
  const mode = useSessionStore((s) => s.mode);
  const items = useCartStore((s) => s.items);
  if (mode !== "comprador") return false;
  if (pathname === "/carrinho" || pathname === "/checkout") return false;
  return items.length > 0;
}

export function AppShell({
  children,
  hideNav = false,
  bgClassName = "bg-cream-100",
}: {
  children: ReactNode;
  hideNav?: boolean;
  bgClassName?: string;
}) {
  const showCartBar = useShowCartBar();

  return (
    <div className={`relative mx-auto flex min-h-dvh w-full max-w-md flex-col ${bgClassName}`}>
      <div
        className={cn(
          "flex-1",
          !hideNav &&
            (showCartBar
              ? "pb-[calc(10.75rem+env(safe-area-inset-bottom))]"
              : "pb-[calc(5.75rem+env(safe-area-inset-bottom))]")
        )}
      >
        {children}
      </div>
      {!hideNav && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-md flex-col gap-2 border-t border-ink-900/8 bg-white/95 px-2 pt-2 backdrop-blur pb-[env(safe-area-inset-bottom)]"
        >
          <CartBar />
          <BottomNav />
        </div>
      )}
    </div>
  );
}
