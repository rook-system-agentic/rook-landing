import type { FinancialInput, FinancialTool } from './financial-input.mjs';
export type { FinancialInput, FinancialTool } from './financial-input.mjs';
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
