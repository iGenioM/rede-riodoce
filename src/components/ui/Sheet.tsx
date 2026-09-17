"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <button
        aria-label="Fechar"
        className="absolute inset-0 bg-forest-950/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="animate-sheet-up relative w-full max-w-md rounded-t-3xl bg-white pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-2xl">
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-ink-300/40" />
        {title && (
          <div className="flex items-center justify-between px-5 pt-3">
            <h3 className="text-base font-bold text-ink-900">{title}</h3>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-200 text-ink-700"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="max-h-[75vh] overflow-y-auto px-5 pt-3">{children}</div>
      </div>
    </div>,
    document.body
  );
}
