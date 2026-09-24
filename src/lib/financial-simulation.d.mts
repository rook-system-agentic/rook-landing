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
export interface FinancialSuccess {
  ok: true;
  tool: FinancialTool;
  formulaVersion: string;
  inputs: FinancialInput;
  result: { status: 'valid' | 'no_reference' | 'non_positive_margin'; [key: string]: string | number | null };
  assumptions: string[];
  summary: string;
}
export type FinancialResponse = FinancialSuccess | {ok: false; errors: Record<string,string>};
export const FORMULA_VERSION: string;
export function parseBrazilianNumber(value: unknown): number | null;
export function calculateFinancialSimulation(candidate: unknown): FinancialResponse;
