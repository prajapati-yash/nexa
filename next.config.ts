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
      {
        protocol: "https",
        hostname: "*.ipfs.dweb.link", // IPFS dweb gateway
      },
      {
        protocol: "https",
        hostname: "dweb.link", // IPFS dweb gateway base
      },
      {
        protocol: "https",
        hostname: "*.ipfs.cf-ipfs.com", // Cloudflare IPFS gateway
      },
      {
        protocol: "https",
        hostname: "cloudflare-ipfs.com", // Cloudflare IPFS gateway base
      },
    ],
  },
};

export default nextConfig;
