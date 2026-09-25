import type { FinancialInput, FinancialTool } from './financial-input.mjs';

export interface DiagnosticContext {
  sourceId: string;
  intent: 'cmv' | 'breakeven';
  answers: Record<string, string>;
  result: { tool: FinancialTool; inputs: FinancialInput; summary: string } | null;
}

export const DIAGNOSTIC_CONTEXT_EVENT: string;
export function readDiagnosticContext(detail: unknown): DiagnosticContext | null;
