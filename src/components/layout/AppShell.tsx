"use client";

import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { CartBar } from "./CartBar";

export function AppShell({
  children,
  hideNav = false,
  bgClassName = "bg-cream-100",
}: {
  children: ReactNode;
  hideNav?: boolean;
  bgClassName?: string;
}) {
  return (
    <div className={`relative mx-auto flex min-h-dvh w-full max-w-md flex-col ${bgClassName}`}>
      <div className={hideNav ? "flex-1" : "flex-1 pb-24"}>{children}</div>
      {!hideNav && (
        <>
          <CartBar />
          <BottomNav />
        </>
      )}
    </div>
  );
}
