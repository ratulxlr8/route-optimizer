import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app is 100% client-side (no API routes, server actions, or ISR),
  // so it deploys as a static export — see README for why.
  output: "export",
};

export default nextConfig;
