import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Two-levels-up resolves to the parent monorepo root when 7greens
 * is mounted as a submodule under sites/7greens. When deployed
 * standalone (Vercel pulling from B2Gdevs/7ggreens directly), this
 * resolves above the project root, which Next.js handles fine.
 */
const repoRoot = path.resolve(__dirname, "..", "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
  },
  outputFileTracingRoot: repoRoot,
};

export default nextConfig;
