import { isTrackingEnabled } from "./tracking";
import { pushTrackingEvent, TRACKING_EVENTS } from "./tracking-events.mjs";

/**
 * Única porta de entrada de evento para os componentes.
 *
 * O portão de ambiente vive em tracking.ts e é consultado aqui, num lugar só.
 * O módulo puro (tracking-events.mjs) não pode importar TypeScript, então
 * recebe a decisão pronta em vez de reimplementar a regra.
 *
 * pushTrackingEvent lança quando o evento ou um campo do payload não está na
 * allowlist — de propósito, para que dado pessoal nunca vá em silêncio para
 * o GA4/Meta (ver tracking-events.mjs). Mas track() é chamado no meio de
 * fluxos de formulário (lead, newsletter, diagnóstico): perder um evento de
 * medição é aceitável, perder o lead que o chamador ainda ia gravar não é.
 * Por isso a exceção é capturada aqui e só relançada fora de produção, para
 * continuar aparecendo alto em desenvolvimento e nos testes.
 */
export function track(name: string, payload: Record<string, string> = {}): boolean {
  try {
    return pushTrackingEvent(name, payload, { enabled: isTrackingEnabled() });
  } catch (error) {
    console.error(`track(): evento "${name}" rejeitado`, error);
    if (process.env.NODE_ENV !== "production") throw error;
    return false;
  }
}

export { TRACKING_EVENTS };
