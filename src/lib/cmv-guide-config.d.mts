export interface CmvGuideConfig {
  environment: "homolog" | "production" | string | undefined;
  publicReady: boolean;
  deliveryReady: boolean;
  databaseUrl: string | null;
  serviceRoleKey: string | null;
  abuseSecret: string | null;
  resendApiKey: string | null;
  from: string | null;
  replyTo: string | null;
  testEmail: string | null;
  errors: readonly string[];
}

export function readCmvGuideConfig(env?: Record<string, string | undefined>): CmvGuideConfig;
export function publicCmvGuideState(config: CmvGuideConfig): "ready" | "unavailable";
export function deliveryCmvGuideState(config: CmvGuideConfig): "ready" | "unavailable";
