export const FINANCIAL_NUMBER_FIELDS: readonly string[];
export function readFinancialDraft(candidate: Record<string, unknown>, tool: string): {inputs: Record<string, unknown> | null; missingFields: string[]};
