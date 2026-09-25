import type { FinancialInput, FinancialTool } from './financial-input.mjs';
import type { FinancialResponse } from './financial-simulation.mjs';
import type { FinancialChatResponse } from './financial-chat-tools.mjs';

export interface PublicFinancialSuccess {
  ok: true;
  tool: FinancialTool;
  inputs: Omit<FinancialInput, 'taxModelVersion'>;
  result: {
    status: 'valid' | 'no_reference' | 'non_positive_margin';
    assessment?: 'attention' | 'within_reference' | 'no_reference';
    comparisonCmvPercent?: number;
    estimatedTaxAmount?: number;
    estimatedNetRevenue?: number;
    breakEvenRevenue?: number | null;
  };
  summary: string;
  notice: string;
}
export type PublicFinancialResponse = PublicFinancialSuccess | { ok: false; errors: Record<string, string> };
export function publicFinancialInputs(inputs: FinancialInput): Omit<FinancialInput, 'taxModelVersion'>;
export function toPublicFinancialSimulation(calculation: FinancialResponse): PublicFinancialResponse;
export function toPublicFinancialChatResponse(response: FinancialChatResponse): Record<string, unknown>;
