/** @type {import('next').NextConfig} */
const nextConfig = {
  // 7greens has no workspace package deps — every dep is a real npm
  // package — so externalDir / outputFileTracingRoot are not needed.
  // Re-introduce them if a future phase imports from a sibling
  // workspace package (e.g. gad-visual-context once it ships on npm).
};

export default nextConfig;
