/**
 * Image tag manifest — visual categorization for 7G Greens landing photos.
 *
 * Phase 272-08 goal: vision-categorize the 32 landing images, store tags
 * in gad media, wire into landing section copy so Hero/BoxesPreview
 * can pull the right image for each content context.
 *
 * Categorization status:
 *   - Static tags below = seed / hand-curated based on filenames + context
 *   - Full vision categorization requires ANTHROPIC_API_KEY (or OPENAI_API_KEY)
 *   - Run `scripts/categorize-images.mjs` to update with AI vision
 *
 * Categories used in the landing UI:
 *   "produce"       — raw vegetables, greens, harvest
 *   "farm"          — fields, fabric containers, growing operations
 *   "cold-chain"    — refrigerated truck, cooler, packaging, transport
 *   "field-to-family" — delivery, handoff, family/community
 *   "brand"         — logos, signage, farm branding
 *   "founder"       — Uncle Paul, team members
 *
 * Task: UPAEC-T-272-08
 */

export interface ImageTag {
  /** Relative path from /public */
  src: string;
  /** Alt text describing the image */
  alt: string;
  /** Primary category */
  category: "produce" | "farm" | "cold-chain" | "field-to-family" | "brand" | "founder";
  /** Secondary tags for more specific filtering */
  tags: string[];
  /** Whether this image is suitable for hero/featured use */
  featured: boolean;
  /**
   * Vision-categorization status:
   *   "static" = hand-curated seed (no AI)
   *   "vision" = categorized by AI vision API
   */
  source: "static" | "vision";
}

/**
 * Static seed tags — hand-curated based on available context.
 * Update with `npm run categorize-images` after setting ANTHROPIC_API_KEY.
 */
export const IMAGE_TAGS: ImageTag[] = [
  // ── Produce photos ───────────────────────────────────────────────────────
  { src: "/photos/produce/web-photos-01.jpeg", alt: "Fresh leafy greens from the farm", category: "produce", tags: ["greens", "harvest", "fresh"], featured: true, source: "static" },
  { src: "/photos/produce/web-photos-02.jpeg", alt: "Vibrant farm produce, close up", category: "produce", tags: ["produce", "vegetables", "close-up"], featured: false, source: "static" },
  { src: "/photos/produce/web-photos-03.jpeg", alt: "Fresh hibiscus and curly mustard greens", category: "produce", tags: ["hibiscus", "mustard-greens", "colorful"], featured: true, source: "static" },
  { src: "/photos/produce/web-photos-04.jpeg", alt: "7G Greens vegetable variety", category: "produce", tags: ["vegetables", "variety", "greens"], featured: false, source: "static" },
  { src: "/photos/produce/web-photos-05.jpeg", alt: "Farm-fresh kale and leafy greens", category: "produce", tags: ["kale", "greens", "harvest"], featured: false, source: "static" },
  { src: "/photos/produce/web-photos-06.jpeg", alt: "Colorful vegetable mix from 7G Greens", category: "produce", tags: ["mix", "vegetables", "colorful"], featured: true, source: "static" },
  { src: "/photos/produce/web-photos-07.jpeg", alt: "Fresh collard greens and chard", category: "produce", tags: ["collards", "chard", "greens"], featured: false, source: "static" },
  { src: "/photos/produce/web-photos-08.jpeg", alt: "Farm harvest basket with greens", category: "produce", tags: ["basket", "harvest", "greens"], featured: false, source: "static" },
  { src: "/photos/produce/web-photos-09.jpeg", alt: "Packed produce box ready for delivery", category: "produce", tags: ["box", "packed", "delivery-ready"], featured: true, source: "static" },
  { src: "/photos/produce/web-photos-10.jpeg", alt: "Fresh herbs and microgreens", category: "produce", tags: ["herbs", "microgreens", "fresh"], featured: false, source: "static" },
  { src: "/photos/produce/web-photos-11.png", alt: "Variety of 7G Greens produce", category: "produce", tags: ["variety", "greens", "vegetables"], featured: false, source: "static" },
  { src: "/photos/produce/web-photos-12.jpeg", alt: "Root vegetables from the farm", category: "produce", tags: ["root-vegetables", "farm", "harvest"], featured: false, source: "static" },
  { src: "/photos/produce/web-photos-13.jpeg", alt: "Colorful peppers and produce", category: "produce", tags: ["peppers", "colorful", "vegetables"], featured: true, source: "static" },
  { src: "/photos/produce/web-photos-14.png", alt: "7G Greens vegetable display", category: "produce", tags: ["display", "vegetables", "fresh"], featured: false, source: "static" },
  { src: "/photos/produce/web-photos-15.jpeg", alt: "Freshly washed kale in containers", category: "farm", tags: ["kale", "washed", "containers"], featured: false, source: "static" },
  { src: "/photos/produce/web-photos-16.jpeg", alt: "Growing greens in fabric containers", category: "farm", tags: ["fabric-containers", "growing", "farm"], featured: true, source: "static" },
  { src: "/photos/produce/web-photos-17.jpeg", alt: "Farm field with produce rows", category: "farm", tags: ["field", "rows", "growing"], featured: false, source: "static" },
  { src: "/photos/produce/web-photos-18.png", alt: "Regenerative farming practices", category: "farm", tags: ["regenerative", "soil", "farming"], featured: false, source: "static" },
  { src: "/photos/produce/web-photos-19.jpeg", alt: "Harvest day at 7G Greens farm", category: "farm", tags: ["harvest", "farm", "outdoor"], featured: false, source: "static" },
  { src: "/photos/produce/web-photos-20.jpeg", alt: "Produce sorting and packing", category: "farm", tags: ["sorting", "packing", "operations"], featured: false, source: "static" },
  { src: "/photos/produce/web-photos-21.jpeg", alt: "Farm team at 7G Greens", category: "founder", tags: ["team", "people", "farm"], featured: false, source: "static" },
  { src: "/photos/produce/web-photos-22.jpeg", alt: "Uncle Paul with farm produce", category: "founder", tags: ["uncle-paul", "portrait", "produce"], featured: true, source: "static" },
  { src: "/photos/produce/web-photos-23.jpeg", alt: "Community pickup at 7G Greens", category: "field-to-family", tags: ["pickup", "community", "delivery"], featured: true, source: "static" },
  { src: "/photos/produce/web-photos-24.jpeg", alt: "Cold-chain transport vehicle", category: "cold-chain", tags: ["transport", "refrigerated", "delivery"], featured: true, source: "static" },
  { src: "/photos/produce/web-photos-25.jpeg", alt: "PSA-certified cold chain packaging", category: "cold-chain", tags: ["packaging", "PSA-certified", "cold-chain"], featured: false, source: "static" },

  // ── Brand / field-to-family photos ───────────────────────────────────────
  { src: "/photos/brand/field-to-family-01.jpeg", alt: "Field-to-family cold chain delivery", category: "field-to-family", tags: ["delivery", "cold-chain", "family"], featured: true, source: "static" },
  { src: "/photos/brand/field-to-family-02.png", alt: "7G Greens field to family brand", category: "brand", tags: ["brand", "field-to-family", "logo"], featured: false, source: "static" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Filter images by category */
export function getImagesByCategory(
  category: ImageTag["category"]
): ImageTag[] {
  return IMAGE_TAGS.filter((img) => img.category === category);
}

/** Get featured images, optionally filtered by category */
export function getFeaturedImages(category?: ImageTag["category"]): ImageTag[] {
  return IMAGE_TAGS.filter(
    (img) => img.featured && (!category || img.category === category)
  );
}

/** Find images by tag (partial match) */
export function getImagesByTag(tag: string): ImageTag[] {
  return IMAGE_TAGS.filter((img) =>
    img.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))
  );
}

/** Summary: how many images per category */
export function getCategoryBreakdown(): Record<ImageTag["category"], number> {
  const counts = {
    produce: 0, farm: 0, "cold-chain": 0,
    "field-to-family": 0, brand: 0, founder: 0,
  };
  for (const img of IMAGE_TAGS) {
    counts[img.category]++;
  }
  return counts;
}
