import "server-only";

import snapshot from "@/data/billing-catalog-v2.snapshot.json";
import {
  resolvePublicBillingCatalog,
  type PublicBillingCatalog,
} from "@/lib/public-billing-catalog.mjs";

export const BILLING_CATALOG_REVALIDATE_SECONDS = 300;
const DEFAULT_CATALOG_URL = "https://app.rook.com.br/api/billing/catalog";

export interface LandingBillingCatalogResult {
  catalog: PublicBillingCatalog | null;
  source: "live" | "snapshot" | "unavailable";
  displayedRelease: string | null;
  snapshotGeneratedAt?: string;
}

export async function getLandingBillingCatalog(): Promise<LandingBillingCatalogResult> {
  const catalogUrl =
    process.env.ROOK_BILLING_CATALOG_URL?.trim() || DEFAULT_CATALOG_URL;
  let liveCandidate: unknown = null;

  try {
    const response = await fetch(catalogUrl, {
      headers: { Accept: "application/json" },
      next: { revalidate: BILLING_CATALOG_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      throw new Error(`Catálogo respondeu HTTP ${response.status}`);
    }

    liveCandidate = await response.json();
  } catch (error) {
    console.error("[ROO-946] Catálogo público indisponível; avaliando snapshot", {
      catalogUrl,
      error: error instanceof Error ? error.message : "erro desconhecido",
    });
  }

  const resolved = resolvePublicBillingCatalog(liveCandidate, snapshot);
  if (!resolved.catalog) {
    console.error("[ROO-946] Catálogo e snapshot inválidos; falha fechada");
    return {
      catalog: null,
      source: "unavailable",
      displayedRelease: null,
    };
  }

  const displayedRelease = `${resolved.catalog.release.key}-v${resolved.catalog.release.version}`;
  console.info("[ROO-946] Catálogo comercial exibido", {
    displayedRelease,
    source: resolved.source,
  });

  return {
    catalog: resolved.catalog,
    source: resolved.source,
    displayedRelease,
    snapshotGeneratedAt: resolved.snapshotGeneratedAt,
  };
}
