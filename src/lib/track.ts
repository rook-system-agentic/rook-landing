import { isTrackingEnabled } from "./tracking";
import { pushTrackingEvent, TRACKING_EVENTS } from "./tracking-events.mjs";

/**
 * Única porta de entrada de evento para os componentes.
 *
 * O portão de ambiente vive em tracking.ts e é consultado aqui, num lugar só.
 * O módulo puro (tracking-events.mjs) não pode importar TypeScript, então
 * recebe a decisão pronta em vez de reimplementar a regra.
 */
export function track(name: string, payload: Record<string, string> = {}): boolean {
  return pushTrackingEvent(name, payload, { enabled: isTrackingEnabled() });
}

export { TRACKING_EVENTS };
