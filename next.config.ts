import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ipfs.io",
      },
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud", // optional extra gateway
      },
      {
        protocol: "https",
        hostname: "nftstorage.link", // optional extra gateway
      },
    ],
  },
};

export default nextConfig;
