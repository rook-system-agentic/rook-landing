import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { syncMetaLeads } from "@/lib/meta-lead-sync.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function constantTimeEqual(value: string, expected: string) {
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function authorized(request: NextRequest, secret: string) {
  return constantTimeEqual(request.headers.get("authorization") || "", `Bearer ${secret}`);
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET não configurado" }, { status: 503 });
  if (!authorized(request, secret)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const report = await syncMetaLeads({ env: process.env, fetchImpl: fetch, now: new Date() });
    return NextResponse.json(report, { status: 200 });
  } catch {
    // O log nunca recebe a exceção original: ela pode carregar dados pessoais ou segredo.
    console.error("[meta-leads] sync_unexpected");
    return NextResponse.json({ status: "error", code: "sync_unexpected" }, { status: 500 });
  }
}
