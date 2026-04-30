/**
 * UPAEC / 7Greens canonical site constants — sourced from
 * .planning/research/copy/upaec-web-page-info.md and field-to-family.md.
 *
 * Keep this file as the single source of truth for contact data, nav,
 * tagline, and box pricing fallbacks. Square integration (Phase 04)
 * overrides the box pricing/items at runtime when SQUARE_ACCESS_TOKEN
 * is set; otherwise these placeholders ship.
 */

export const SITE = {
  brand: "7Greens",
  legalName: "Uncle Paul's Agritourism & Educational Corp",
  legalShort: "UPAEC",
  tagline: "Healthy Land. Healthy Greens. Healthy People.",
  founded: 2019,
  season: "June – September 2026",
  address: {
    street: "10105 County Road 21",
    city: "Tyler",
    state: "TX",
    zip: "75707",
    full: "10105 County Road 21, Tyler, TX 75707",
  },
  phones: ["817-501-0822", "469-631-8611"],
  serviceArea: "East Texas + Dallas–Fort Worth",
  email: null as string | null,
  social: {
    instagram: null as string | null,
    facebook: null as string | null,
  },
} as const;

export const NAV: ReadonlyArray<{ label: string; href: string; external?: boolean }> = [
  { label: "Our Story", href: "/#story" },
  { label: "Boxes", href: "/boxes" },
  { label: "How It Works", href: "/#cold-chain" },
  { label: "Contact", href: "/#contact" },
];

export const DIFFERENTIATORS = [
  {
    title: "Chemical-free",
    body: "Grown without synthetic pesticides, herbicides, or fertilizers. Non-GMO seeds, naturally fertile ground, fabric containers that replenish minerals.",
    icon: "Leaf" as const,
  },
  {
    title: "Cold-chain delivery",
    body: "Mobile walk-in cooler + refrigerated truck. From field to your door at temperature. PSA-certified packaging.",
    icon: "Snowflake" as const,
  },
  {
    title: "Order-as-needed",
    body: "No subscription. No commitment. Order only what you want, when you want it. Pickup at your zip-code point.",
    icon: "Package" as const,
  },
  {
    title: "Regenerative",
    body: "We work with the land, not against it. Soil that gives more each year. Stewardship over extraction.",
    icon: "Sprout" as const,
  },
] as const;

export const FOUNDER_NARRATIVE = {
  pullQuote:
    "We believed that the universe entrusted us to be good stewards of the world including the land.",
  body: [
    "UPAEC was founded in 2019 with the goal of delivering high-quality, nutritious fruits and vegetables to communities in Dallas-Fort Worth and East Texas.",
    "Our farm is named in honor of Paul — affectionately called Uncle Paul — who operated a fruit, vegetable, and chicken farm with agri-logistics. Gardening began as therapy and grew into a career.",
    "Through years of study we realized we can farm without chemicals by letting nature fertilize, protect, and grow with some assistance from us. Our promise is simple: if we wouldn't eat it, we won't sell it.",
  ],
} as const;

export const COLD_CHAIN = {
  headline: "Keeping it fresh, from field to family.",
  body: [
    "We invested in a mobile cold chain — a walk-in cooler and refrigerated delivery truck working together as one seamless system.",
    "From the moment our vegetables are picked, they move into a controlled, temperature-safe environment that locks in freshness, preserves nutrition, and ensures every product leaving our farm meets the highest safety standards.",
    "No warm gaps. No guesswork. Just clean, cold, consistent care from our fields to your door.",
  ],
  promise: "Our cold chain isn't just equipment, it's our promise.",
} as const;

/**
 * Box pricing fallbacks — used when Square is not connected.
 * When SQUARE_ACCESS_TOKEN is set, lib/square/catalog.ts overrides
 * these with live data from Square Catalog API.
 */
export const BOX_FALLBACKS = {
  starter: {
    id: "fallback-starter",
    name: "Starter Box",
    priceCents: 2500,
    priceDisplay: "$25",
    portion: "approx. 10 oz each",
    itemCount: 6,
    items: [
      "10 oz Kale",
      "10 oz Collards",
      "10 oz Mustard Greens",
      "10 oz Chard",
      "10 oz Southern Blend",
      "1 Beef Tomato",
      "1 Bell Pepper",
      "1 Large Onion",
      "2 Beets",
      "2 Potatoes",
      "1 Pint Okra",
    ],
  },
  family: {
    id: "fallback-family",
    name: "Family Box",
    priceCents: 3500,
    priceDisplay: "$35",
    portion: "approx. 1 lb each",
    itemCount: 9,
    items: [
      "1 lb Kale",
      "1 lb Collards",
      "1 lb Mustard Greens",
      "1 lb Chard",
      "1 lb Southern Blend",
      "2 Beef Tomatoes / 1 pint Cherry",
      "2 Bell Peppers",
      "2 Large Onions",
      "3 Beets",
      "4 Potatoes",
      "½ lb Okra",
    ],
  },
  extras: [
    { name: "5 lb Southern Blend (Kale/Mustard/Collards)", priceDisplay: "$5/lb" },
    { name: "5 lb Kale", priceDisplay: "$5/lb" },
    { name: "5 lb Collards", priceDisplay: "$5/lb" },
    { name: "5 lb Curly Mustard", priceDisplay: "$5/lb" },
    { name: "5 lb Red Mustard", priceDisplay: "$5/lb" },
    { name: "5 lb Giant Ford Hook Chard", priceDisplay: "$5/lb" },
    { name: "5 lb Okra", priceDisplay: "$5/lb" },
    { name: "5 lb Sweet Potato Leaves", priceDisplay: "$5/lb" },
    { name: "5 lb Egyptian Spinach", priceDisplay: "$5/lb" },
    { name: "5 lb Malabar Spinach", priceDisplay: "$5/lb" },
    { name: "2 lb Hibiscus / Sorelle", priceDisplay: "$5/lb" },
    { name: "5 lb Potatoes", priceDisplay: "$5/lb" },
    { name: "5 lb Onions", priceDisplay: "$5/lb" },
  ],
} as const;

export const PRODUCT_CATALOG_FALLBACK = [
  { sku: "KG10F", name: "Kale Greens, 10 oz Fresh" },
  { sku: "HPA1F", name: "Assorted Hot Peppers (Ghost / Scorpion)" },
  { sku: "HC1F", name: "Hibiscus / Sorelle, fresh" },
  { sku: "CMG1F", name: "Curly Mustard Greens" },
  { sku: "FSPL1FZ", name: "Sweet Potato Leaves, frozen" },
  { sku: "MS10F", name: "Malabar Spinach, 10 oz" },
  { sku: "FCO1FZ", name: "Cut Okra, frozen" },
  { sku: "RMG1F", name: "Red Giant Mustard Greens" },
  { sku: "SP1F", name: "Butter Cup Spinach" },
  { sku: "GFH1F", name: "Giant Ford Hook Chard" },
  { sku: "CG1F", name: "Collard Greens" },
  { sku: "FESL", name: "Egyptian Spinach / Jute" },
  { sku: "OKR1F", name: "Okra, fresh" },
  { sku: "OKA1F", name: "Assorted Okras" },
  { sku: "BP2F", name: "Bell Peppers" },
  { sku: "SP2L", name: "Sweet Potatoes" },
  { sku: "C2F", name: "Cucumber" },
  { sku: "TR2F", name: "Turnip" },
  { sku: "AO2F", name: "Onions, aggregate" },
  { sku: "ABT2F", name: "Beef Tomatoes" },
  { sku: "ACT1", name: "Cherry Tomatoes" },
  { sku: "AP2L", name: "Cooking Potatoes" },
  { sku: "ANP2LB", name: "New Potatoes" },
  { sku: "SQ1F", name: "Squash" },
] as const;
