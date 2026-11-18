export declare const META_ADS_PIXEL_ID: string;
export declare const META_GRAPH_API_VERSION: string;
export declare const META_CAPI_TIMEOUT_MS: number;
export declare const META_LEAD_EVENT_NAME: string;

export type MetaCapiConfig =
  | { enabled: false; reason: "no_token" | "invalid_token" | "invalid_test_code" | "test_code_required" }
  | { enabled: true; reason: "live" | "test_events"; pixelId: string; token: string; testEventCode: string | null };

export type MetaLeadEvent = {
  event_name: string;
  event_time: number;
  event_id: string;
  action_source: "website";
  event_source_url: string;
  user_data: {
    client_user_agent: string;
    client_ip_address?: string;
    fbp?: string;
    fbc?: string;
  };
};

export declare function isLeadEventId(value: unknown): value is string;
export declare function readMetaCapiConfig(
  env: Record<string, string | undefined> | undefined,
  environment: string | null | undefined,
): MetaCapiConfig;
export declare function shouldSendMetaLead(input: {
  config: MetaCapiConfig | null | undefined;
  adsConsent: unknown;
  result: unknown;
  eventId: unknown;
}): boolean;
export declare function sanitizeEventSourceUrl(referer: string | null | undefined, allowedOrigins: string[]): string | null;
export declare function resolveEventSourceUrl(input: {
  referer: string | null | undefined;
  allowedOrigins: string[];
  fallbackUrl: string;
}): string | null;
export declare function sanitizeFbCookie(value: string | null | undefined): string | null;
export declare function buildMetaLeadEvent(input: {
  eventId: unknown;
  eventTimeSeconds: number;
  sourceUrl: string | null;
  clientIp: string | null;
  userAgent: string | null | undefined;
  fbp: string | null | undefined;
  fbc: string | null | undefined;
}): MetaLeadEvent | null;
export declare function sendMetaEvent(input: {
  config: MetaCapiConfig;
  event: MetaLeadEvent | null;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}): Promise<string>;
