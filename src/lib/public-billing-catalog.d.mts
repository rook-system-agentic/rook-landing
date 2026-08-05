export type ProductCode = "knight" | "rook" | "chess";

export interface PublicBillingOffer {
  productCode: ProductCode;
  displayName: string;
  description: string;
  productKind: "base_plan" | "organization_add_on";
  billingInterval: "month";
  currency: "BRL";
  unitAmountCents: number;
  publicFeatures: string[];
}

export interface PublicBillingCatalog {
  release: { key: string; version: number; effectiveFrom: string };
  offers: PublicBillingOffer[];
  trial: {
    durationDays: 7;
    requiresPaymentMethod: true;
    maxUsesPerOrganizationCnpj: 1;
  };
  classification: {
    metric: "monthly_revenue_cents";
    currency: "BRL";
    knightMaxMonthlyRevenueCents: number;
  };
}

export interface BillingCatalogSnapshot {
  generatedAt: string;
  sourceUrl: string;
  catalog: PublicBillingCatalog;
}

export interface BillingCatalogViewModel {
  releaseId: string;
  effectiveFrom: string;
  trialDays: number;
  requiresPaymentMethod: boolean;
  threshold: string;
  basePlans: Array<PublicBillingOffer & { formattedPrice: string }>;
  chess: PublicBillingOffer & { formattedPrice: string };
}

export const MAX_BILLING_SNAPSHOT_AGE_MS: number;

export function parsePublicBillingCatalog(value: unknown): PublicBillingCatalog;
export function parseBillingCatalogSnapshot(value: unknown): BillingCatalogSnapshot;
export function resolvePublicBillingCatalog(
  liveCandidate: unknown,
  snapshotCandidate: unknown,
  now?: number,
):
  | { catalog: PublicBillingCatalog; source: "live"; snapshotGeneratedAt?: never }
  | {
      catalog: PublicBillingCatalog;
      source: "snapshot";
      snapshotGeneratedAt: string;
    }
  | { catalog: null; source: "unavailable" };
export function formatPriceBRL(unitAmountCents: number): string;
export function buildBillingCatalogViewModel(
  catalog: unknown,
): BillingCatalogViewModel;
