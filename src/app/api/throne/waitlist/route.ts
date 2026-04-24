import { NextResponse } from "next/server";
import { addToWaitlist } from "../../../../lib/throne-store";

export const dynamic = "force-dynamic";

const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FEEDBACK_ENDPOINT;

export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email = (body.email || "").trim();
  if (!email) {
    return NextResponse.json(
      { ok: false, error: "missing_email" },
      { status: 400 }
    );
  }

  try {
    await addToWaitlist(email);
  } catch (err) {
    console.error("[throne/waitlist] add failed", err);
    return NextResponse.json({ ok: false, error: "add_failed" }, { status: 500 });
  }

  if (FORMSPREE_ENDPOINT) {
    try {
      await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          type: "throne-waitlist",
          email,
          submittedAt: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("[throne/waitlist] formspree relay failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
