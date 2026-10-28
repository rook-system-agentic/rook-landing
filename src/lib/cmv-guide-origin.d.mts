export interface CmvGuideCorsPolicy {
  allowed: boolean;
  headers: Record<string, string>;
}

export function cmvGuideCorsPolicy(origin: string | null, requestOrigin: string, siteOrigin: string, environment: string | undefined): CmvGuideCorsPolicy;
export function cmvGuidePreflightPolicy(origin: string | null, requestOrigin: string, siteOrigin: string, environment: string | undefined, method: string | null, requestedHeaders: string | null): CmvGuideCorsPolicy;
