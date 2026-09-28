import { NextRequest, NextResponse } from 'next/server';
import { validateFinancialAcquisition } from '@/lib/financial-acquisition.mjs';
import { createAsaflowAcquisition } from '@/lib/asaflow-acquisition.mjs';
import { AcquisitionPersistenceError, createAcquisitionLedger } from '@/lib/acquisition-ledger.mjs';
import { isSupabaseAdminConfigured, supabaseAdminRequest } from '@/lib/supabase-admin';
import {
  CommercialLeadAbuseProtectionError, consumeCommercialLeadAbuseGate,
  isCommercialLeadAbuseProtectionConfigured, issueCommercialLeadChallenge,
} from '@/lib/commercial-lead-abuse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store' };
const unavailable = () => NextResponse.json({ error: 'Não foi possível concluir sua solicitação agora. Seus dados continuam nesta página; tente novamente mais tarde.' }, { status: 503, headers });

function configured() {
  return process.env.ASAFLOW_ACQUISITION_ENABLED === 'true'
    && !!process.env.ASAFLOW_ACQUISITION_API_KEY
    && !!process.env.ASAFLOW_ACQUISITION_PIPELINE_ID
    && !!process.env.ASAFLOW_ACQUISITION_STAGE_ID
    && isCommercialLeadAbuseProtectionConfigured() && isSupabaseAdminConfigured();
}

export async function GET(request: NextRequest) {
  if (!configured()) return unavailable();
  try { return NextResponse.json(issueCommercialLeadChallenge(request.headers), { headers }); }
  catch { return unavailable(); }
}

// O cálculo completo permanece no servidor. A projeção pública só é devolvida
// depois da confirmação do contato/negócio no CRM, inclusive em reenvios.
export async function POST(request: NextRequest) {
  if (!configured()) return unavailable();
  if (Number(request.headers.get('content-length')) > 16384) return NextResponse.json({error:'Dados excedem o limite.'}, {status:413,headers});
  const raw = await request.text();
  if (Buffer.byteLength(raw, 'utf8') > 16384) return NextResponse.json({error:'Dados excedem o limite.'}, {status:413,headers});
  let candidate: Record<string, unknown>;
  try { candidate = JSON.parse(raw); }
  catch { return NextResponse.json({error:'Dados inválidos.'}, {status:400,headers}); }
  const parsed = validateFinancialAcquisition(candidate);
  if (!parsed.ok) return NextResponse.json({error:'Revise os campos.',fieldErrors:parsed.errors}, {status:422,headers});
  const challenge = candidate.antiBot as {token:string;solution:string} | null;
  try {
    const lead = parsed.value;
    const gate = await consumeCommercialLeadAbuseGate(request.headers, {
      name: lead.name, company: null, email: lead.email, phone: lead.phone,
      cnpj: lead.phone, interest: 'general',
    }, challenge);
    if (gate.reason === 'nonce_replayed') return NextResponse.json({error:'Esta verificação já foi utilizada. Tente enviar novamente.'}, {status:400,headers});
    if (!gate.allowed) return NextResponse.json({error:'Aguarde alguns minutos e tente novamente.'}, {
      status:429, headers:{...headers,'Retry-After':String(Math.max(1,gate.retryAfterSeconds))},
    });
    const client = createAsaflowAcquisition({
      apiKey: process.env.ASAFLOW_ACQUISITION_API_KEY!,
      pipelineId: process.env.ASAFLOW_ACQUISITION_PIPELINE_ID!,
      stageId: process.env.ASAFLOW_ACQUISITION_STAGE_ID!,
      environment: process.env.NEXT_PUBLIC_ENV,
    });
    const saved = await createAcquisitionLedger({ adminRequest: supabaseAdminRequest, crm: client }).persist(lead, {
      capturePath: candidate.capturePath, recordKind: process.env.NEXT_PUBLIC_ENV === 'homolog' ? 'test' : 'live',
    });
    if (!saved.publicSimulation?.ok || saved.publicSimulation.tool !== lead.intent) throw new Error('invalid_persisted_simulation');
    return NextResponse.json({success:true,simulation:saved.publicSimulation}, {status:201,headers});
  } catch (error) {
    if (error instanceof AcquisitionPersistenceError && error.code === 'conflict') return NextResponse.json({error:'Esta solicitação já foi registrada com outros dados. Retome os dados originais para tentar novamente.'}, {status:409,headers});
    if (error instanceof AcquisitionPersistenceError && error.code === 'busy') return NextResponse.json({error:'Sua solicitação ainda está sendo confirmada. Aguarde um momento e tente novamente.'}, {status:503,headers:{...headers,'Retry-After':String(error.retryAfterSeconds)}});
    if (error instanceof AcquisitionPersistenceError && error.code === 'needs_reconciliation') return NextResponse.json({error:'Seus dados foram registrados, mas a confirmação precisa ser conferida pela equipe. O resultado ainda não está disponível.'}, {status:503,headers});
    if (error instanceof CommercialLeadAbuseProtectionError && error.code === 'invalid_challenge') {
      return NextResponse.json({error:'A verificação expirou. Tente novamente.'}, {status:400,headers});
    }
    console.error('[financial-simulations] Integração indisponível.');
    return unavailable();
  }
}
