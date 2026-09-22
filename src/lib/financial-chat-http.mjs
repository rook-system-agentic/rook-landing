import { executeFinancialChatTool } from './financial-chat-tools.mjs';

export const MAX_FINANCIAL_CHAT_BODY_BYTES = 4096;

const responseHeaders = { 'Cache-Control': 'no-store' };
const invalidRequest = (message, status, headers = {}) => Response.json(
  { status: 'invalid_input', errors: { request: message } },
  { status, headers: { ...responseHeaders, ...headers } },
);

function cancelReader(reader) {
  // O retorno não depende de um produtor remoto concluir o cancelamento.
  void reader.cancel().catch(() => {});
}

/**
 * Transporte para uma ferramenta definida pela rota, sem CRM, armazenamento ou
 * acesso a dados privados. A IA recebe exatamente a resposta do adaptador.
 * O limite vale para os bytes lidos, mesmo sem Content-Length ou com valor falso.
 */
export async function handleFinancialChatToolRequest(request, toolName) {
  if (request.method !== 'POST') return invalidRequest('Use o método POST.', 405, { Allow: 'POST' });

  const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') return invalidRequest('Envie o cenário como application/json.', 415);
  if (Number(request.headers.get('content-length')) > MAX_FINANCIAL_CHAT_BODY_BYTES) {
    return invalidRequest('O cenário deve ter no máximo 4 KiB.', 413);
  }

  let text = '';
  const reader = request.body?.getReader();
  if (reader) {
    let length = 0;
    const chunks = [];
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > MAX_FINANCIAL_CHAT_BODY_BYTES) {
          cancelReader(reader);
          return invalidRequest('O cenário deve ter no máximo 4 KiB.', 413);
        }
        chunks.push(value);
      }
      const bytes = new Uint8Array(length);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      }
      text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      cancelReader(reader);
      return invalidRequest('Não foi possível ler um cenário JSON válido em UTF-8.', 400);
    } finally {
      reader.releaseLock();
    }
  }

  let candidate;
  try {
    candidate = JSON.parse(text);
  } catch {
    return invalidRequest('Envie um JSON válido com os campos do cenário.', 400);
  }
  const result = executeFinancialChatTool(toolName, candidate);
  return Response.json(result, {
    status: result.status === 'invalid_input' ? 422 : 200,
    headers: responseHeaders,
  });
}
