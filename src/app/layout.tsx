import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";

// Usamos a pilha de fontes do sistema (ver globals.css) em vez de next/font/google:
// o protótipo assim funciona 100% offline e não depende de acesso à internet no build.

export const metadata: Metadata = {
  title: "Rede Rio doce — Marketplace de Produtores do Rio doce",
  description:
    "Compre direto de produtores de assentamentos rurais da sua região. Fresco, justo e sem atravessador.",
  applicationName: "Rede Rio doce",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Rede Rio doce",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0d2118",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        <link rel="dns-prefetch" href="https://d8j0ntlcm91z4.cloudfront.net" />
        <link rel="preconnect" href="https://d8j0ntlcm91z4.cloudfront.net" crossOrigin="" />
      </head>
      <body className="min-h-full flex flex-col bg-cream-100 text-ink-900">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
