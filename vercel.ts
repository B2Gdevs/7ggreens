/**
 * 7greens — Vercel deployment config.
 *
 * Programmable replacement for vercel.json. Imports typed helpers from
 * `@gad/site-infra` (currently a relative-path module under
 * vendor/get-anything-done/lib/site-infra; will be a published package
 * in phase 138).
 *
 * vercel.json is preserved alongside this file for one release cycle as
 * a fallback in case Vercel's vercel.ts evaluation fails. Once we have
 * one confirmed production deploy from .ts, the .json gets deleted.
 *
 * See: .planning/notes/2026-05-05-site-infra-as-code.md
 */

import {
  defineConfig,
  secureHeaders,
  immutableAssetCache,
} from '../../vendor/get-anything-done/lib/site-infra';

export default defineConfig({
  framework: 'nextjs',
  buildCommand: 'next build',
  installCommand: 'npm install --legacy-peer-deps',
  headers: [
    immutableAssetCache('/photos/(.*)'),
    secureHeaders('/(.*)'),
  ],
});
