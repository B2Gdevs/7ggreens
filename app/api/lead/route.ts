import { NextResponse } from "next/server";
import { createCustomer } from "@/lib/square/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  const { name, email, zip, newsletter } = (body || {}) as {
    name?: string;
    email?: string;
    zip?: string;
    newsletter?: boolean;
  };

  if (!email || typeof email !== "string" || !/.+@.+\..+/.test(email)) {
    return NextResponse.json(
      { ok: false, message: "A valid email is required." },
      { status: 400 }
    );
  }

  const result = await createCustomer({
    email,
    name: name?.trim() || undefined,
    zip: zip?.trim() || undefined,
    tags: ["lead", ...(newsletter ? ["newsletter"] : [])],
  });

  return NextResponse.json(
    {
      ok: result.ok,
      source: result.source,
      message:
        result.message ??
        (result.ok ? "You're on the list." : "Could not save your details. Please try again."),
    },
    { status: result.ok ? 200 : 502 }
  );
}
