export interface AcquisitionCorsPolicy { allowed: boolean; headers: Record<string, string> }
export function acquisitionCorsPolicy(origin: string | null, requestOrigin: string): AcquisitionCorsPolicy;
export function acquisitionPreflightPolicy(origin: string | null, requestOrigin: string, method: string | null, requestedHeaders: string | null): AcquisitionCorsPolicy;
