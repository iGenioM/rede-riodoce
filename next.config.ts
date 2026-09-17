import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://localhost:3000", "192.168.30.28"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d8j0ntlcm91z4.cloudfront.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
