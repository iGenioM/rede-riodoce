import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  rounded = "rounded-xl",
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={cn("skeleton-shimmer bg-cream-200/80", rounded, className)}
      aria-hidden
    />
  );
}
