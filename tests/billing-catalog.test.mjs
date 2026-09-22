import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildBillingCatalogViewModel,
  parseBillingCatalogSnapshot,
  parsePublicBillingCatalog,
  resolvePublicBillingCatalog,
} from "../src/lib/public-billing-catalog.mjs";
import { buildDirectCheckoutHref } from "../src/lib/direct-checkout-link.mjs";
import { buildTrialDateEstimate } from "../src/lib/trial-date-estimate.mjs";
import snapshotCandidate from "../src/data/billing-catalog-v2.snapshot.json" with {
  type: "json",
};

test("snapshot público gera exatamente a oferta mensal exibida", () => {
  const snapshot = parseBillingCatalogSnapshot(snapshotCandidate);
  const view = buildBillingCatalogViewModel(snapshot.catalog);

  assert.equal(view.releaseId, "p0-monthly-v1");
  assert.deepEqual(
    view.basePlans.map((plan) => [plan.productCode, plan.formattedPrice]),
    [
      ["knight", "R$ 479,90"],
      ["rook", "R$ 779,90"],
    ],
  );
  assert.equal(view.chess.formattedPrice, "R$ 279,90");
  assert.equal(view.trialDays, 7);
  assert.equal(view.requiresPaymentMethod, true);
  assert.equal(view.threshold, "R$ 250.000,00");
  assert.equal("chessDiscount" in snapshot.catalog, false);
  assert.equal("chessDiscountTiers" in view, false);
});

test("estimativa do trial usa o dia corrente de São Paulo, não a data do build", () => {
  assert.deepEqual(
    buildTrialDateEstimate(7, new Date("2026-08-06T12:00:00.000Z")),
    {
      startDate: "06/08/2026",
      firstChargeDate: "13/08/2026",
    },
  );

  assert.deepEqual(
    buildTrialDateEstimate(7, new Date("2026-08-06T01:30:00.000Z")),
    {
      startDate: "05/08/2026",
      firstChargeDate: "12/08/2026",
    },
  );
});

test("checkout direto aceita somente as faixas Knight e Rook", () => {
  for (const revenueBand of ["knight", "rook"]) {
    const checkoutUrl = new URL(buildDirectCheckoutHref(revenueBand));

    assert.equal(checkoutUrl.origin, "https://app.rook.com.br");
    assert.equal(checkoutUrl.pathname, "/contratar");
    assert.deepEqual([...checkoutUrl.searchParams], [["revenue_band", revenueBand]]);
  }

  assert.throws(() => buildDirectCheckoutHref("chess"), /Faixa de faturamento inválida/);
  assert.throws(
    () => buildDirectCheckoutHref("rook&redirect=https://example.com"),
    /Faixa de faturamento inválida/,
  );
});

test("catálogo inválido usa o snapshot; ambos inválidos falham fechado", () => {
  // `now` fixo no instante do snapshot: sem isso o teste dependia do relógio
  // da máquina e ficava vermelho sozinho 7 dias depois do último commit.
  const fallback = resolvePublicBillingCatalog(
    { release: { key: "incompleto" } },
    snapshotCandidate,
    Date.parse(snapshotCandidate.generatedAt),
  );
  assert.equal(fallback.source, "snapshot");
  assert.equal(fallback.catalog?.release.key, "p0-monthly");

  const unavailable = resolvePublicBillingCatalog({}, {});
  assert.equal(unavailable.source, "unavailable");
  assert.equal(unavailable.catalog, null);
});

test("snapshot expira após sete dias e falha fechado", () => {
  const eightDaysLater =
    Date.parse(snapshotCandidate.generatedAt) + 8 * 24 * 60 * 60 * 1_000;
  const result = resolvePublicBillingCatalog(
    { release: { key: "incompleto" } },
    snapshotCandidate,
    eightDaysLater,
  );

  assert.equal(result.source, "unavailable");
  assert.equal(result.catalog, null);
});

test("DTO rejeita Pawn, anual e campos internos do provedor", () => {
  const catalog = structuredClone(snapshotCandidate.catalog);
  catalog.offers[0].productCode = "pawn";
  assert.throws(() => parsePublicBillingCatalog(catalog));

  const annual = structuredClone(snapshotCandidate.catalog);
  annual.offers[0].billingInterval = "year";
  assert.throws(() => parsePublicBillingCatalog(annual));

  const leaked = structuredClone(snapshotCandidate.catalog);
  leaked.offers[0].externalPriceId = "price_internal";
  assert.throws(() => parsePublicBillingCatalog(leaked));

  const internalDiscountLeak = structuredClone(snapshotCandidate.catalog);
  internalDiscountLeak.chessDiscount = {
    appliesTo: ["knight", "rook"],
    tiers: [{ minUnits: 1, maxUnits: null, discountBps: 500 }],
  };
  assert.throws(() => parsePublicBillingCatalog(internalDiscountLeak));
});

// Removido em 22/09/2026: o teste "página usa checkout direto em Knight/Rook e
// reserva o CRM para Chess" descrevia a /planos com preço público e checkout
// direto. Desde 885bdc11 (PR #133, produção em 16/09/2026) a /planos é a jornada
// comercial sem preço público (um <h1 sr-only> e a experiência comercial), e o PR
// #131 recolocou este arquivo no gate sem atualizar essa trava. As regras que
// seguem vivas — catálogo canônico, sem vazamento de price id interno, snapshot
// dentro da janela — continuam cobertas pelos testes acima.
