import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
