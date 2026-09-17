"use client";

import Image from "next/image";
import { useState } from "react";
import type { ImageSeed } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "./Skeleton";

const CLOUDFRONT_HOST = "d8j0ntlcm91z4.cloudfront.net";

function canOptimize(url: string) {
  try {
    return new URL(url).hostname === CLOUDFRONT_HOST;
  } catch {
    return false;
  }
}

interface RemotePhotoProps {
  seed: ImageSeed;
  alt: string;
  className?: string;
  containerClassName?: string;
  emojiClassName?: string;
  rounded?: string;
  /** Hero / primeiro card na tela — carrega antes e com mais prioridade */
  priority?: boolean;
  sizes?: string;
}

/**
 * Foto remota com placeholder (gradiente + emoji), skeleton animado até carregar
 * e otimização via next/image quando a URL é do CloudFront do projeto.
 */
export function RemotePhoto({
  seed,
  alt,
  className = "absolute inset-0 h-full w-full object-cover",
  containerClassName,
  emojiClassName,
  rounded = "rounded-2xl",
  priority = false,
  sizes = "(max-width: 448px) 100vw, 448px",
}: RemotePhotoProps) {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const showPhoto = Boolean(seed.photoUrl) && !errored;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        rounded,
        containerClassName
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, ${seed.from}, ${seed.to})`,
      }}
    >
      {!loaded && showPhoto && (
        <Skeleton className="absolute inset-0 z-[1] rounded-none" rounded="rounded-none" />
      )}

      {showPhoto ? (
        canOptimize(seed.photoUrl!) ? (
          <Image
            src={seed.photoUrl!}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className={cn(
              className,
              "z-[2] transition-opacity duration-300",
              loaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={seed.photoUrl}
            alt={alt}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            loading={priority ? "eager" : "lazy"}
            className={cn(
              className,
              "z-[2] transition-opacity duration-300",
              loaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
          />
        )
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" />
          <span className={cn("relative z-[2] drop-shadow-sm", emojiClassName ?? "text-4xl")}>
            {seed.emoji}
          </span>
        </>
      )}
    </div>
  );
}
