import { NextRequest, NextResponse } from "next/server";
import {
  dispatchCmvGuide,
  isCmvGuideDispatchAuthorized,
} from "@/lib/cmv-guide-delivery";
import { isCmvGuideDeliveryConfigured } from "@/lib/cmv-guide";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const headers = { "Cache-Control": "no-store" };
const COUNTERS = ["claimed", "accepted", "retried", "failed", "delivered", "bounced", "reconciled", "needsReconciliation"] as const;

type CounterName = (typeof COUNTERS)[number];

function sanitizedCounters(value: unknown) {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return Object.fromEntries(COUNTERS.map((name: CounterName) => [name, Math.max(0, Math.trunc(Number(source[name]) || 0))]));
}

async function handle(request: NextRequest) {
  if (!isCmvGuideDispatchAuthorized(request)) return NextResponse.json({ error: "Não autorizado." }, { status: 401, headers });
  if (!isCmvGuideDeliveryConfigured()) return NextResponse.json({ error: "Dispatch indisponível." }, { status: 503, headers });
  try {
    return NextResponse.json({ ok: true, ...sanitizedCounters(await dispatchCmvGuide()) }, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "Dispatch indisponível." }, { status: 503, headers });
  }
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
