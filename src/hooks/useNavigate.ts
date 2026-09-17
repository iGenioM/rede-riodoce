"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useNavigationStore } from "@/lib/store/useNavigationStore";

/** Navegação com feedback visual (barra + skeleton) enquanto a rota carrega. */
export function useNavigate() {
  const router = useRouter();
  const start = useNavigationStore((s) => s.start);

  const push = useCallback(
    (href: string) => {
      start();
      router.push(href);
    },
    [router, start]
  );

  const replace = useCallback(
    (href: string) => {
      start();
      router.replace(href);
    },
    [router, start]
  );

  const back = useCallback(() => {
    start();
    router.back();
  }, [router, start]);

  return { push, replace, back, router };
}
