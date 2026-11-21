import type { NextConfig } from "next";

const NGROK_HOST = "nonpresidential-lukas-postaxial.ngrok-free.dev";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      allowedOrigins: [
        NGROK_HOST,
        "*.ngrok-free.dev",
        "*.ngrok.io",
        "*.ngrok.app",
      ],
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
