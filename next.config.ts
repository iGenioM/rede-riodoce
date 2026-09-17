import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Protótipo 100% client-side — sem otimização remota de imagens necessária */
  allowedDevOrigins: ["http://localhost:3000", '192.168.30.28'],
};

export default nextConfig;
