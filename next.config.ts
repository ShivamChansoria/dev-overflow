import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pino"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.vecteezy.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
