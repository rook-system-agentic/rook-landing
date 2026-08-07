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
  const fallback = resolvePublicBillingCatalog(
    { release: { key: "incompleto" } },
    snapshotCandidate,
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

test("página usa checkout direto em Knight/Rook e reserva o CRM para Chess", async () => {
  const [source, experience, trialDateEstimate] = await Promise.all([
    readFile(new URL("../src/app/planos/page.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../src/components/plans/PlansCommercialExperience.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../src/components/plans/TrialDateEstimate.tsx", import.meta.url),
      "utf8",
    ),
  ]);

  assert.match(source, /getLandingBillingCatalog/);
  assert.match(source, /https:\/\/www\.rook\.com\.br\/planos\//);
  assert.match(experience, /href=\{buildDirectCheckoutHref\(selected\.productCode\)\}/);
  assert.match(experience, />\s*Testar por 7 dias\s*<\/a>/);
  assert.doesNotMatch(experience, /interest=\{selected\.productCode/);
  assert.match(experience, /Seu negócio tem mais de uma unidade\?/);
  assert.match(experience, /Conhecer o Chess/);
  assert.match(experience, /href="#chess-details"/);
  assert.match(source, /id="chess-details"/);
  assert.match(experience, /api\/commercial-leads/);
  assert.equal(
    [...`${source}\n${experience}`.matchAll(/<CommercialLeadButton\b/g)].length,
    1,
  );
  assert.match(source, /<CommercialLeadButton\s+interest="chess"/);
  assert.doesNotMatch(source, /<CommercialLeadButton\s+interest="general"/);
  assert.doesNotMatch(source, /registro\?plan=/);
  assert.doesNotMatch(source, /\b(?:Pawn|anual|mais popular|Recomendado)\b/i);
  assert.doesNotMatch(source, /(?:479\.9|779\.9|279\.9)/);
  assert.doesNotMatch(`${source}\n${experience}`, /chessDiscount|discountBps|Desconto progressivo/);
  assert.doesNotMatch(source, /Oferta exibida:/);
  assert.match(source, /Conhecer as funcionalidades/);
  assert.match(source, /text-ocre/);
  assert.match(source, /TrialDateEstimate/);
  assert.doesNotMatch(source, /const today = new Date\(\)/);
  assert.match(trialDateEstimate, /useEffect/);
  assert.match(trialDateEstimate, /buildTrialDateEstimate/);
});
