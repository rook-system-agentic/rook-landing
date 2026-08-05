import type { CommercialLead } from "./commercial-lead-validation.mjs";

export type CommercialDealStage = "lead" | "proposta" | "fechado" | "perdido";

export type CommercialLeadResult = {
  id: string;
  created: boolean;
  stage: CommercialDealStage;
};

export type AdminRequest = <T>(
  pathWithQuery: string,
  options?: RequestInit & { allowEmpty?: boolean },
) => Promise<T>;

export function buildCommercialLeadSourceId(
  lead: Pick<CommercialLead, "cnpj" | "email" | "interest">,
): string;

export function createCommercialLeadPersistence(adminRequest: AdminRequest): {
  createOrUpdateCommercialLead(lead: CommercialLead): Promise<CommercialLeadResult>;
};
