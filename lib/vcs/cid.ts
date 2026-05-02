/**
 * 7greens local Visual Context System — minimal, package-free.
 *
 * Why local: per operator direction, 7greens does not depend on
 * @gad/visual-context or gad-visual-context. We roll a thin
 * cid system here that satisfies the VCS mandate (deterministic IDs
 * + dev-mode inspector) without any external package dependency.
 *
 * cid() returns a stable, debuggable identifier for a section /
 * component. It's a string — apply it as `data-cid={cid("home.hero")}`
 * on the outermost element of the surface. The DevPanel reads
 * data-cid attributes to surface a searchable inventory.
 *
 * Naming convention: `<route-or-area>.<section>.<sub>` — kebab/dot.
 * Examples: "home.hero", "home.diff.cold-chain", "boxes.card.starter".
 */

const REGISTRY = new Set<string>();

export function cid(id: string): string {
  if (process.env.NODE_ENV !== "production") {
    REGISTRY.add(id);
  }
  return id;
}

export function listRegisteredCids(): string[] {
  return Array.from(REGISTRY).sort();
}
