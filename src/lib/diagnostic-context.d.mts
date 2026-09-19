import type { FinancialSuccess } from './financial-simulation.mjs';

export interface DiagnosticContext {
  sourceId: string;
  intent: 'cmv' | 'breakeven';
  answers: Record<string, string>;
  result: FinancialSuccess | null;
}

export const DIAGNOSTIC_CONTEXT_EVENT: string;
export function readDiagnosticContext(detail: unknown): DiagnosticContext | null;
