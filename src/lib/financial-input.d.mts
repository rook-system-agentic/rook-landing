export type FinancialTool = 'cmv' | 'breakeven';
export interface FinancialInput {
  tool: FinancialTool;
  revenueBasis: 'net' | 'gross';
  revenue: number;
  referenceBasis?: 'last_month' | 'monthly_average_12m';
  period?: string;
  cmvPercent?: number;
  cmvAmount?: number;
  cmvInputMode?: 'amount' | 'gross_percent' | 'net_percent';
  taxState?: string;
  taxModelVersion?: string;
  segment?: string;
  fixedCosts?: number;
  taxPercent?: number;
  feesPercent?: number;
  otherVariablePercent?: number;
}

export function validateFinancialInput(candidate: unknown): { ok: true; inputs: FinancialInput } | { ok: false; errors: Record<string, string> };
