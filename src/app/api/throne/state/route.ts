import { NextResponse } from "next/server";
import { getThroneStatus } from "../../../../lib/throne-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await getThroneStatus();
    return NextResponse.json(status, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    // Fail open — if the KV lookup bombs, let clients into the room without
    // the prize popup rather than blocking entry.
    console.error("[throne/state]", err);
    return NextResponse.json({ claimed: false, error: "lookup_failed" });
  }
}
