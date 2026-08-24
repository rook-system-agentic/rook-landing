import type { SolicitacaoIntegracao } from "./integration-request-validation.mjs";

export interface ResultadoGravacao {
  id: string | null;
  created: boolean;
  stage: string;
}

export declare function buildIntegrationRequestSourceId(pedido: SolicitacaoIntegracao): string;

export declare function createIntegrationRequestPersistence(
  adminRequest: <T>(pathWithQuery: string, options?: RequestInit & { allowEmpty?: boolean }) => Promise<T>,
): {
  createOrUpdateIntegrationRequest(pedido: SolicitacaoIntegracao): Promise<ResultadoGravacao>;
};
