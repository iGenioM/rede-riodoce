const prefetched = new Set<string>();

/** Dispara download antecipado de fotos (cache do navegador + service worker). */
export function prefetchImageUrls(urls: string[]) {
  if (typeof window === "undefined") return;

  for (const url of urls) {
    if (!url || prefetched.has(url)) continue;
    prefetched.add(url);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
  }
}
