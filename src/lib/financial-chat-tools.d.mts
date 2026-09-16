import type { FinancialInput, FinancialSuccess } from './financial-simulation.mjs';

export type FinancialChatToolName = 'analisar_cmv' | 'estimar_ponto_equilibrio';
export interface FinancialChatPropertySchema {
  type: 'string' | 'number' | 'boolean';
  description: string;
  const?: string | boolean;
  enum?: string[];
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
}
export interface FinancialChatToolDefinition {
  name: FinancialChatToolName;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, FinancialChatPropertySchema>;
    required: string[];
    additionalProperties: false;
  };
}
export interface FinancialChatContext {
  toolName: FinancialChatToolName;
  period: string;
  currency: 'BRL';
}
export type FinancialChatResponse =
  | { status: 'invalid_input'; errors: Record<string, string> }
  | { status: 'needs_information'; toolName: FinancialChatToolName; missingFields: string[] }
  | ({ status: 'needs_confirmation'; inputs: FinancialInput } & FinancialChatContext)
  | ({ status: 'success' } & FinancialChatContext & FinancialSuccess);

export const FINANCIAL_CHAT_TOOLS: readonly FinancialChatToolDefinition[];
export function executeFinancialChatTool(toolName: unknown, candidate: unknown): FinancialChatResponse;
