export declare const CANONICAL_HOST: "www.rook.com.br";
export declare const CANONICAL_ORIGIN: "https://www.rook.com.br";

export declare function normalizeOrigin(value: unknown, fallback?: string): string;
export declare function normalizeInternalCanonical(value: unknown, fallback: string): string;
export declare function normalizeInternalCanonical(value: unknown, fallback?: undefined): string | undefined;
export declare function isIndexableBuild(environment: unknown, deploymentEnvironment?: unknown): boolean;

export type IndexabilityReason = "build-not-production" | "host-not-canonical" | "official-production";
export type IndexabilityDecision = {
  indexable: boolean;
  reason: IndexabilityReason;
};

export declare function indexabilityDecision(input: {
  environment: unknown;
  host: unknown;
  deploymentEnvironment?: unknown;
}): IndexabilityDecision;
