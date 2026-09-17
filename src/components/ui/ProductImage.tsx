"use client";

import { useState } from "react";
import type { ImageSeed } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  seed: ImageSeed;
  className?: string;
  emojiClassName?: string;
  rounded?: string;
}

/**
 * Imagem do produto: usa a foto profissional gerada (seed.photoUrl) quando
 * disponível. Se não houver URL, ou a foto falhar ao carregar (ex.: sem
 * conexão), cai de volta pro placeholder 100% CSS (gradiente + emoji) —
 * garantindo que o app continue funcionando offline mesmo com fotos reais.
 */
export function ProductImage({ seed, className, emojiClassName, rounded = "rounded-2xl" }: ProductImageProps) {
  const [errored, setErrored] = useState(false);
  const showPhoto = Boolean(seed.photoUrl) && !errored;

  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", rounded, className)}
      style={{
        backgroundImage: `linear-gradient(135deg, ${seed.from}, ${seed.to})`,
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
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" />
          <span className={cn("relative drop-shadow-sm", emojiClassName ?? "text-4xl")}>{seed.emoji}</span>
        </>
      )}
    </div>
  );
}
