/**
 * GET /api/zip-check?zip=75701
 *
 * Checks whether a ZIP code is in the 7G Greens service area.
 *
 * Resolution order:
 *   1. Supabase `delivery_zones` table (when configured)
 *   2. Static fallback zones in lib/delivery/zones.ts
 *
 * Response (200 always — graceful degradation):
 *   { served: true, area, deliveryDay, cutoffTime, homeDelivery, source }
 *   { served: false, source }
 *
 * source: "supabase" | "static" | "unrecognized"
 *
 * Task: UPAEC-T-272-03
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { lookupZipStatic } from "@/lib/delivery/zones";
import { buildSupabaseClient } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get("zip")?.trim() ?? "";

  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json(
      { served: false, error: "Invalid ZIP — must be 5 digits", source: "validation" },
      { status: 400 }
    );
  }

  // 1. Try Supabase delivery_zones table
  const client = buildSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("delivery_zones")
        .select("area, delivery_day, cutoff_time, home_delivery")
        .eq("zip", zip)
        .eq("service_available", true)
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({
          served: true,
          area: data.area,
          deliveryDay: data.delivery_day,
          cutoffTime: data.cutoff_time,
          homeDelivery: Boolean(data.home_delivery),
          source: "supabase",
        });
      }
      // If no row → unrecognized from Supabase
      if (!error && !data) {
        return NextResponse.json({ served: false, source: "supabase" });
      }
      // DB error — fall through to static
      console.warn("[zip-check] Supabase query error:", error?.message);
    } catch (err) {
      console.warn("[zip-check] Supabase threw:", err);
    }
  }

  // 2. Static fallback
  const zone = lookupZipStatic(zip);
  if (zone) {
    return NextResponse.json({
      served: true,
      area: zone.area,
      deliveryDay: zone.deliveryDay,
      cutoffTime: zone.cutoffTime,
      homeDelivery: zone.homeDelivery,
      source: "static",
    });
  }

  return NextResponse.json({ served: false, source: "unrecognized" });
}
