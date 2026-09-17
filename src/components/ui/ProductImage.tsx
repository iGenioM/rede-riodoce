"use client";

import type { ImageSeed } from "@/lib/types";
import { RemotePhoto } from "./RemotePhoto";

interface ProductImageProps {
  seed: ImageSeed;
  className?: string;
  emojiClassName?: string;
  rounded?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Imagem do produto: foto remota quando disponível, com skeleton até carregar;
 * fallback em gradiente + emoji se falhar ou estiver offline.
 */
export function ProductImage({
  seed,
  className,
  emojiClassName,
  rounded = "rounded-2xl",
  priority = false,
  sizes,
}: ProductImageProps) {
  return (
    <RemotePhoto
      seed={seed}
      alt=""
      containerClassName={className}
      emojiClassName={emojiClassName}
      rounded={rounded}
      priority={priority}
      sizes={sizes}
    />
  );
}
