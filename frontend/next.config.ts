import type { NextConfig } from "next";

declare const process: {
  env: Record<string, string | undefined>;
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
