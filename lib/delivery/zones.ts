/**
 * Delivery zone data — static seed for ZIP-code service-area checks.
 *
 * When Supabase is configured and the `delivery_zones` table is seeded,
 * the app/api/zip-check route queries that. This file provides a
 * hard-coded fallback so the feature works with zero env keys.
 *
 * Data source: operator-provided East Texas + DFW service area.
 *
 * Task: UPAEC-T-272-03
 */

export interface DeliveryZone {
  /** 5-digit ZIP code */
  zip: string;
  /** Human-readable area name */
  area: string;
  /** Delivery day of week */
  deliveryDay: string;
  /** Order cutoff time (relative description) */
  cutoffTime: string;
  /** Whether the ZIP receives home delivery (vs. pickup-point only) */
  homeDelivery: boolean;
}

/**
 * Static delivery zones — East Texas + DFW pickup points.
 * These are approximate ranges; operator will refine with real data.
 */
export const STATIC_DELIVERY_ZONES: DeliveryZone[] = [
  // ── East Texas — Tyler / Smith County ──────────────────────────────────
  { zip: "75701", area: "Tyler, TX (central)", deliveryDay: "Saturday", cutoffTime: "Thursday noon", homeDelivery: true },
  { zip: "75702", area: "Tyler, TX (east)", deliveryDay: "Saturday", cutoffTime: "Thursday noon", homeDelivery: true },
  { zip: "75703", area: "Tyler, TX (south)", deliveryDay: "Saturday", cutoffTime: "Thursday noon", homeDelivery: true },
  { zip: "75704", area: "Tyler, TX (west)", deliveryDay: "Saturday", cutoffTime: "Thursday noon", homeDelivery: true },
  { zip: "75707", area: "Tyler, TX (farm area)", deliveryDay: "Saturday", cutoffTime: "Thursday noon", homeDelivery: true },
  { zip: "75708", area: "Tyler, TX (north)", deliveryDay: "Saturday", cutoffTime: "Thursday noon", homeDelivery: true },
  { zip: "75709", area: "Tyler, TX (northwest)", deliveryDay: "Saturday", cutoffTime: "Thursday noon", homeDelivery: true },

  // ── East Texas — Surrounding areas ─────────────────────────────────────
  { zip: "75751", area: "Athens, TX", deliveryDay: "Saturday", cutoffTime: "Thursday noon", homeDelivery: false },
  { zip: "75771", area: "Lindale, TX", deliveryDay: "Saturday", cutoffTime: "Thursday noon", homeDelivery: false },
  { zip: "75670", area: "Marshall, TX", deliveryDay: "Saturday", cutoffTime: "Thursday noon", homeDelivery: false },
  { zip: "75601", area: "Longview, TX", deliveryDay: "Saturday", cutoffTime: "Thursday noon", homeDelivery: false },
  { zip: "75604", area: "Longview (east), TX", deliveryDay: "Saturday", cutoffTime: "Thursday noon", homeDelivery: false },
  { zip: "75605", area: "Longview (north), TX", deliveryDay: "Saturday", cutoffTime: "Thursday noon", homeDelivery: false },
  { zip: "75789", area: "Rusk, TX", deliveryDay: "Saturday", cutoffTime: "Thursday noon", homeDelivery: false },
  { zip: "75760", area: "Cushing, TX", deliveryDay: "Saturday", cutoffTime: "Thursday noon", homeDelivery: false },

  // ── DFW Metroplex — pickup points ──────────────────────────────────────
  { zip: "75201", area: "Dallas, TX (downtown)", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "75204", area: "Dallas, TX (Uptown)", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "75206", area: "Dallas, TX (East)", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "75209", area: "Dallas, TX (Love Field)", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "75214", area: "Dallas, TX (Lakewood)", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "75218", area: "Dallas, TX (Lake Highlands)", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "75225", area: "Dallas, TX (Park Cities)", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "75230", area: "Dallas, TX (North)", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "75248", area: "Dallas, TX (Far North)", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "76010", area: "Arlington, TX", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "76011", area: "Arlington, TX (east)", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "76102", area: "Fort Worth, TX (downtown)", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "76103", area: "Fort Worth, TX (east)", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "75034", area: "Frisco, TX", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "75035", area: "Frisco, TX (east)", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "75024", area: "Plano, TX (north)", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "75023", area: "Plano, TX (central)", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "75043", area: "Garland, TX", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "75040", area: "Garland, TX (north)", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "75080", area: "Richardson, TX", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "75081", area: "Richardson, TX (east)", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "75149", area: "Mesquite, TX", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
  { zip: "75019", area: "Coppell, TX", deliveryDay: "Sunday", cutoffTime: "Friday noon", homeDelivery: false },
];

/** Lookup a ZIP in the static fallback table. Case-insensitive, trims. */
export function lookupZipStatic(zip: string): DeliveryZone | null {
  const normalized = zip.trim().replace(/\s+/g, "");
  return STATIC_DELIVERY_ZONES.find((z) => z.zip === normalized) ?? null;
}
