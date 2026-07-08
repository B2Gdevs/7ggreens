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
  // Turbopack (the default bundler for `next build`/`next dev --turbo` here)
  // needs its OWN alias map — a `webpack` config alone makes it hard-error
  // ("using Turbopack, with a webpack config and no turbopack config"). Mirror
  // the vcs-sheet source aliases so both bundlers resolve the workspace package.
  // Turbopack resolveAlias needs RELATIVE forward-slash paths (from the app
  // root) — absolute Windows paths fail with "windows imports are not
  // implemented yet". Points at the vcs-sheet source (workspace pkg, no dist/).
  turbopack: {
    resolveAlias: {
      "@experience/vcs-sheet/react": "../../packages/vcs-sheet/src/react.tsx",
      "@experience/vcs-sheet": "../../packages/vcs-sheet/src/index.ts",
    },
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
