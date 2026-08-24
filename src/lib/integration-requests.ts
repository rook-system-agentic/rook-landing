import "server-only";

import { createIntegrationRequestPersistence } from "@/lib/integration-request-store.mjs";
import { supabaseAdminRequest } from "@/lib/supabase-admin";
import type { SolicitacaoIntegracao } from "@/lib/integration-request-validation.mjs";

/*
 * A cola entre a lógica pura (.mjs, testável sem build) e o efeito de rede,
 * como em `commercial-leads.ts`. Ver CLAUDE.md.
 */
const persistence = createIntegrationRequestPersistence(supabaseAdminRequest);

export function createOrUpdateIntegrationRequest(pedido: SolicitacaoIntegracao) {
  return persistence.createOrUpdateIntegrationRequest(pedido);
}
