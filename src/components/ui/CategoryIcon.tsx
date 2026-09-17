import {
  Leaf,
  Carrot,
  Apple,
  Sprout,
  Wheat,
  Egg,
  Flower2,
  Cookie,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Leaf,
  Carrot,
  Apple,
  Sprout,
  Wheat,
  Egg,
  Flower2,
  Cookie,
};

export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = CATEGORY_ICONS[icon] ?? Leaf;
  return <Icon className={className} />;
}
