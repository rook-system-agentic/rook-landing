export type LpVariant = "direct" | "assisted";
export type LpAllocationSource = "desligado" | "forcada" | "cookie" | "sorteio";

export const LP_EXPERIMENT_ID: "lp_asaflow_v1";
export const LP_EXPERIMENT_COOKIE: "rook_lp_exp";
export const LP_EXPERIMENT_COOKIE_MAX_AGE: number;
export const LP_EXPERIMENT_FORCE_PARAM: "lp_exp";
export const LP_VARIANTS: readonly LpVariant[];

export function parseAssistedPercent(bruto: unknown): number;
export function serializeExperimentCookie(variant: LpVariant): string;
export function parseExperimentCookie(
  valor: unknown,
): { experimentId: string; variant: LpVariant } | null;
export function allocateVariant(opts: {
  existing: string | null | undefined;
  assistedPercent: number;
  random?: () => number;
  forced?: string | null;
}): { variant: LpVariant; source: LpAllocationSource };
export function lerVarianteDoCookie(cookies: string | null | undefined): LpVariant | null;
export function buildAsaflowFormUrl(
  baseUrl: string,
  opts: { currentHref: string; referrer: string; variant: LpVariant },
): string;
