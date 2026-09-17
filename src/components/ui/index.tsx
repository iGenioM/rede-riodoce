"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}) {
  const variants: Record<string, string> = {
    primary: "bg-lime-500 text-forest-900 hover:bg-lime-400 active:bg-lime-600 shadow-sm",
    secondary: "bg-forest-900 text-cream-100 hover:bg-forest-800 active:bg-forest-950",
    outline: "border border-ink-300/60 text-ink-900 hover:bg-cream-200 bg-transparent",
    ghost: "text-ink-900 hover:bg-cream-200 bg-transparent",
    danger: "bg-tomato text-white hover:opacity-90",
  };
  const sizes: Record<string, string> = {
    sm: "h-8 px-3 text-xs rounded-lg",
    md: "h-11 px-4 text-sm rounded-xl",
    lg: "h-13 px-6 text-base rounded-2xl",
    icon: "h-10 w-10 rounded-full",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 font-semibold transition-colors disabled:opacity-40 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  variant = "default",
  children,
}: {
  className?: string;
  variant?: "default" | "lime" | "gold" | "sky" | "tomato" | "outline";
  children: ReactNode;
}) {
  const variants: Record<string, string> = {
    default: "bg-forest-900 text-cream-100",
    lime: "bg-lime-500 text-forest-900",
    gold: "bg-gold/20 text-gold border border-gold/30",
    sky: "bg-sky/15 text-sky",
    tomato: "bg-tomato/15 text-tomato",
    outline: "border border-ink-300/60 text-ink-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function RatingStars({
  rating,
  size = 14,
  showValue = false,
  count,
}: {
  rating: number;
  size?: number;
  showValue?: boolean;
  count?: number;
}) {
  return (
    <div className="inline-flex items-center gap-1">
      <div className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= Math.round(rating) ? "fill-gold text-gold" : "fill-ink-300/30 text-ink-300/30"}
          />
        ))}
      </div>
      {showValue && <span className="text-xs font-semibold text-ink-700">{rating.toFixed(1)}</span>}
      {typeof count === "number" && <span className="text-xs text-ink-500">({count})</span>}
    </div>
  );
}

export function Avatar({
  seed,
  size = 44,
}: {
  seed: { emoji: string; from: string; to: string; photoUrl?: string };
  size?: number;
}) {
  const [errored, setErrored] = useState(false);
  const showPhoto = Boolean(seed.photoUrl) && !errored;
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-full shrink-0 ring-2 ring-white shadow-sm"
      style={{
        width: size,
        height: size,
        backgroundImage: `linear-gradient(135deg, ${seed.from}, ${seed.to})`,
        fontSize: size * 0.5,
      }}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={seed.photoUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        seed.emoji
      )}
    </div>
  );
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
  className,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between px-4", className)}>
      <h2 className="text-base font-bold text-ink-900">{title}</h2>
      {actionLabel && (
        <button onClick={onAction} className="text-sm font-semibold text-forest-700 active:opacity-60">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-8 py-16 text-center">
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-200 text-ink-500">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="text-sm font-bold text-ink-900">{title}</p>
        {description && <p className="text-xs text-ink-500 max-w-[240px]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl bg-white border border-ink-900/5 shadow-[0_1px_3px_rgba(18,32,26,0.06)]", className)}
      {...props}
    />
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-ink-900/8", className)} />;
}

export function IconCircle({
  children,
  className,
  bg = "bg-cream-200",
}: {
  children: ReactNode;
  className?: string;
  bg?: string;
}) {
  return (
    <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", bg, className)}>
      {children}
    </div>
  );
}
