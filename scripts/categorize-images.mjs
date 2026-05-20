#!/usr/bin/env node
/**
 * scripts/categorize-images.mjs
 *
 * Vision-categorizes all landing images in /public/photos using the
 * Anthropic API (claude-3-5-haiku — cheap + fast for image description).
 *
 * REQUIRES: ANTHROPIC_API_KEY environment variable.
 *
 * Output: writes updated tag entries to stdout (JSON array).
 * Operator reviews + merges into lib/media/image-tags.ts.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/categorize-images.mjs > /tmp/vision-tags.json
 *   # Review /tmp/vision-tags.json and update lib/media/image-tags.ts
 *
 * Graceful when ANTHROPIC_API_KEY absent:
 *   Prints a clear operator-blocked error and exits 1. Does NOT throw
 *   in a way that breaks the build.
 *
 * Task: UPAEC-T-272-08
 */

import { readdir } from "fs/promises";
import { join, extname, relative } from "path";
import { readFileSync } from "fs";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.error(
    "\n[OPERATOR-BLOCKED] Vision categorization requires ANTHROPIC_API_KEY.\n" +
    "Set the key and re-run:\n" +
    "  ANTHROPIC_API_KEY=sk-ant-... node scripts/categorize-images.mjs\n" +
    "\nFallback: lib/media/image-tags.ts contains static seed tags.\n"
  );
  process.exit(1);
}

const PHOTOS_DIR = join(process.cwd(), "public", "photos");
const VALID_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const CATEGORIES = ["produce", "farm", "cold-chain", "field-to-family", "brand", "founder"];

const SYSTEM_PROMPT = `You are a visual content classifier for a farm-to-table produce company (7G Greens, Tyler TX).
Classify each image into ONE of these categories:
  - produce: raw vegetables, greens, herbs, harvested food
  - farm: fields, fabric containers, growing operations, soil, equipment
  - cold-chain: refrigerated truck, cooler, packaging, transport, PSA-certified
  - field-to-family: delivery handoff, pickup point, customer/family receiving produce
  - brand: logos, signage, branded materials
  - founder: Uncle Paul or other identifiable people

Respond with valid JSON matching exactly this shape:
{
  "category": "<one of the 6 categories above>",
  "alt": "<concise descriptive alt text, 8-15 words>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"],
  "featured": <true if high-quality, visually striking, suitable for hero use>
}`;

async function getImagesInDir(dir) {
  const entries = [];
  try {
    const files = await readdir(dir, { withFileTypes: true });
    for (const f of files) {
      const fullPath = join(dir, f.name);
      if (f.isDirectory()) {
        entries.push(...await getImagesInDir(fullPath));
      } else if (VALID_EXTENSIONS.has(extname(f.name).toLowerCase())) {
        entries.push(fullPath);
      }
    }
  } catch {
    // dir doesn't exist
  }
  return entries;
}

async function classifyImage(imagePath) {
  const ext = extname(imagePath).toLowerCase();
  const mediaType = ext === ".png" ? "image/png" : "image/jpeg";

  let imageData;
  try {
    imageData = readFileSync(imagePath).toString("base64");
  } catch {
    console.error(`[skip] Could not read ${imagePath}`);
    return null;
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: imageData },
            },
            { type: "text", text: "Classify this image." },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`[error] API ${response.status} for ${imagePath}:`, err.slice(0, 200));
    return null;
  }

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "";

  try {
    // Extract JSON from the response (model may wrap in markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const parsed = JSON.parse(jsonMatch[0]);

    // Validate category
    if (!CATEGORIES.includes(parsed.category)) {
      parsed.category = "produce"; // fallback
    }

    return parsed;
  } catch {
    console.error(`[parse-error] Could not parse response for ${imagePath}:`, text.slice(0, 200));
    return null;
  }
}

async function main() {
  console.error("[info] Discovering images in", PHOTOS_DIR);
  const images = await getImagesInDir(PHOTOS_DIR);
  console.error(`[info] Found ${images.length} images`);

  const results = [];

  for (const imagePath of images) {
    const relativeSrc = "/" + relative(join(process.cwd(), "public"), imagePath).replace(/\\/g, "/");
    console.error(`[classify] ${relativeSrc}`);

    const classification = await classifyImage(imagePath);
    if (!classification) {
      results.push({
        src: relativeSrc,
        alt: "7G Greens farm photo",
        category: "produce",
        tags: [],
        featured: false,
        source: "static",
        error: "classification-failed",
      });
      continue;
    }

    results.push({
      src: relativeSrc,
      alt: classification.alt,
      category: classification.category,
      tags: classification.tags ?? [],
      featured: classification.featured ?? false,
      source: "vision",
    });

    // Small delay to respect rate limits
    await new Promise((r) => setTimeout(r, 500));
  }

  // Output JSON to stdout — operator reviews + pastes into image-tags.ts
  console.log(JSON.stringify(results, null, 2));
  console.error(`\n[done] Categorized ${results.length} images.`);
  console.error("[next] Review output and update lib/media/image-tags.ts");
}

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
