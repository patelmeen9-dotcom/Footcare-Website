import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Inventory ZIP uploads can be large (spreadsheet + product images).
  // Next.js defaults these buffers to 10MB and truncates anything bigger.
  serverActions: {
    bodySizeLimit: "100mb",
  },
  experimental: {
    proxyClientMaxBodySize: "100mb",
  },
};

export default nextConfig;
