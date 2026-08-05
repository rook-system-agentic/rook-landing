export type CommercialInterest = "knight" | "rook" | "chess" | "general";

export type CommercialLead = {
  name: string;
  company: string | null;
  email: string;
  phone: string;
  cnpj: string;
  interest: CommercialInterest;
};

export const COMMERCIAL_INTERESTS: CommercialInterest[];

export function validateCommercialLeadInput(candidate: unknown):
  | { ok: false; errors: Record<string, string> }
  | { ok: true; honeypot: true; value: null }
  | { ok: true; honeypot: false; value: CommercialLead };
