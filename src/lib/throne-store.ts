/**
 * Throne store — persistent state for the "first person to solve the
 * scavenger hunt and claim the prize" competition. Atomic SETNX semantics
 * against Upstash Redis (REST API — no client SDK needed). Falls back to
 * in-memory when env vars are missing so the flow still works in local dev.
 *
 * To make the claim truly global, provision an Upstash Redis instance
 * (free tier works) and set:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 * in .env.local (dev) and on your hosting provider (prod).
 */

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const THRONE_KEY = "coachb:throne:claimed";
const WAITLIST_KEY = "coachb:throne:waitlist";

export type ThroneWinner = {
  name: string;
  email: string;
  social?: string;
  idea?: string;
};

// In-memory fallback (dev only) — not shared across serverless instances.
// A single Next.js dev server process is fine for local testing; do not rely
// on this in production.
const memoryStore: {
  claimed: { timestamp: number; winner: ThroneWinner } | null;
  waitlist: Array<{ email: string; timestamp: number }>;
} = {
  claimed: null,
  waitlist: [],
};

function hasUpstash(): boolean {
  return Boolean(UPSTASH_URL && UPSTASH_TOKEN);
}

async function upstashCmd<T = unknown>(cmd: (string | number)[]): Promise<T | null> {
  if (!hasUpstash()) return null;
  const res = await fetch(UPSTASH_URL as string, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Upstash error ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { result: T; error?: string };
  if (json.error) throw new Error(json.error);
  return json.result;
}

export async function getThroneStatus(): Promise<{
  claimed: boolean;
  claimedAt?: number;
}> {
  if (hasUpstash()) {
    const value = await upstashCmd<string | null>(["GET", THRONE_KEY]);
    if (!value) return { claimed: false };
    try {
      const parsed = JSON.parse(value);
      return { claimed: true, claimedAt: parsed.timestamp };
    } catch {
      return { claimed: true };
    }
  }
  if (!memoryStore.claimed) return { claimed: false };
  return { claimed: true, claimedAt: memoryStore.claimed.timestamp };
}

/**
 * Atomic claim. Returns { success: true } only if this call *actually*
 * wrote the winner record — no race conditions, no double-claims.
 */
export async function claimThrone(
  winner: ThroneWinner
): Promise<{ success: boolean; alreadyClaimed: boolean }> {
  if (hasUpstash()) {
    const value = JSON.stringify({ timestamp: Date.now(), winner });
    // SETNX = SET-IF-NOT-EXISTS. Returns 1 on set, 0 if key already exists.
    const result = await upstashCmd<number>(["SETNX", THRONE_KEY, value]);
    const wasSet = result === 1;
    return { success: wasSet, alreadyClaimed: !wasSet };
  }
  // In-memory fallback — also effectively atomic inside a single process.
  if (memoryStore.claimed) {
    return { success: false, alreadyClaimed: true };
  }
  memoryStore.claimed = { timestamp: Date.now(), winner };
  return { success: true, alreadyClaimed: false };
}

export async function addToWaitlist(email: string): Promise<void> {
  const entry = JSON.stringify({ email, timestamp: Date.now() });
  if (hasUpstash()) {
    await upstashCmd(["RPUSH", WAITLIST_KEY, entry]);
    return;
  }
  memoryStore.waitlist.push({ email, timestamp: Date.now() });
}
