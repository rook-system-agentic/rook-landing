import { isTrackingEnabled } from "./tracking";
import { pushClarityEvent } from "./clarity-events.mjs";

/**
 * Evento do Clarity (ROO-1921): só nome fixo da lista de clarity-events.mjs,
 * sem parâmetro de valor. Mesmo portão de ambiente do track(): desligado em
 * homologação. Nunca lança.
 *
 * Fica fora de track.ts de propósito: os testes de conversão carregam
 * track.ts com lista fechada de dependências, e o Clarity não faz parte do
 * funil GA4/Meta que eles travam.
 */
export function trackClarity(name: string): boolean {
  return pushClarityEvent(name, { enabled: isTrackingEnabled() });
}
