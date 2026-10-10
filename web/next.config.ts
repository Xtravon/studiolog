import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // One lockfile lives here (web/); another sits at the repo root for neon.ts
  // tooling. Pin the workspace root so Turbopack never picks the wrong one.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
