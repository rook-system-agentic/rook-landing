import { NextRequest, NextResponse } from 'next/server';
import { calculateFinancialSimulation } from '@/lib/financial-simulation.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store' };

// Endpoint sem efeitos externos: só recebe valores e retorna o cálculo.
export async function POST(request: NextRequest) {
  if (Number(request.headers.get('content-length')) > 4096) return NextResponse.json({error:'Dados excedem o limite.'}, {status:413,headers});
  const raw = await request.text();
  if (Buffer.byteLength(raw, 'utf8') > 4096) return NextResponse.json({error:'Dados excedem o limite.'}, {status:413,headers});
  let data: unknown;
  try { data = JSON.parse(raw); }
  catch { return NextResponse.json({error:'Dados inválidos.'}, {status:400,headers}); }
  const result = calculateFinancialSimulation(data);
  return NextResponse.json(result, {status:result.ok ? 200 : 422,headers});
}
