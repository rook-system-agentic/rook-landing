import { handleFinancialChatToolRequest } from '@/lib/financial-chat-http.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function POST(request: Request) {
  return handleFinancialChatToolRequest(request, 'estimar_ponto_equilibrio');
}
