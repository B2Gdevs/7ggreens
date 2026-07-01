import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, "..", "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // @experience/vcs-sheet package source lives outside this app's own
  // node_modules (workspace package, no dist/ build step) — Next needs
  // externalDir to resolve + bundle files from outside the app root.
  // Per packages/vcs-sheet/HOW-TO-MOUNT-THE-IDE-SHEET.md "Wiring in a Next app".
  experimental: {
    externalDir: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@experience/vcs-sheet/react": path.resolve(
        monorepoRoot,
        "packages/vcs-sheet/src/react.tsx",
      ),
      "@experience/vcs-sheet": path.resolve(
        monorepoRoot,
        "packages/vcs-sheet/src/index.ts",
      ),
    };
    return config;
  },
};

export default nextConfig;
