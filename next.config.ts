import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
