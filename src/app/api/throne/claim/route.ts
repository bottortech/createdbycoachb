import { NextResponse } from "next/server";
import { claimThrone, type ThroneWinner } from "../../../../lib/throne-store";

export const dynamic = "force-dynamic";

const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FEEDBACK_ENDPOINT;

export async function POST(req: Request) {
  let body: Partial<ThroneWinner>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  if (!name || !email) {
    return NextResponse.json(
      { ok: false, error: "missing_fields" },
      { status: 400 }
    );
  }

  const social = (body.social || "").trim();
  const idea = (body.idea || "").trim();

  // Atomic claim — only one caller will ever see success=true.
  let result;
  try {
    result = await claimThrone({ name, email, social, idea });
  } catch (err) {
    console.error("[throne/claim] claim failed", err);
    return NextResponse.json({ ok: false, error: "claim_failed" }, { status: 500 });
  }

  if (!result.success) {
    return NextResponse.json(
      { ok: false, error: "already_claimed" },
      { status: 409 }
    );
  }

  // Relay to Formspree so the owner sees it in their inbox. Best-effort;
  // we still return success even if the relay fails, since the claim
  // itself is already persisted in KV.
  if (FORMSPREE_ENDPOINT) {
    try {
      await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          type: "throne-winner",
          name,
          email,
          social,
          idea,
          submittedAt: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("[throne/claim] formspree relay failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
