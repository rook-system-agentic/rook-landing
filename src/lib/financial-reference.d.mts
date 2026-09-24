export type FinancialReferenceBasis = 'last_month' | 'monthly_average_12m';
export type FinancialReference = { referenceBasis?: FinancialReferenceBasis; period?: string };
export const FINANCIAL_REFERENCE_BASES: readonly FinancialReferenceBasis[];
export function validateFinancialReference(candidate: unknown, options?: {required?: boolean}): {ok:true; value:FinancialReference} | {ok:false; errors:Record<string,string>};
export function financialReferenceLabel(candidate: unknown): string;
export function financialReferenceAssumptions(candidate: unknown): string[];
