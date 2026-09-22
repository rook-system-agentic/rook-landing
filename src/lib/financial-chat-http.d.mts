import type { FinancialChatToolName } from './financial-chat-tools.mjs';

export const MAX_FINANCIAL_CHAT_BODY_BYTES: 4096;
export function handleFinancialChatToolRequest(request: Request, toolName: FinancialChatToolName): Promise<Response>;
