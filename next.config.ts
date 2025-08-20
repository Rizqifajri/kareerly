import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "mammoth"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
