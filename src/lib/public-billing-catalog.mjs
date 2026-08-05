const OFFER_CODES = ["knight", "rook", "chess"];
const PRODUCT_KINDS = {
  knight: "base_plan",
  rook: "base_plan",
  chess: "organization_add_on",
};

export const MAX_BILLING_SNAPSHOT_AGE_MS = 7 * 24 * 60 * 60 * 1_000;

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assert(condition, message) {
  if (!condition) {
    throw new TypeError(`Catálogo comercial inválido: ${message}`);
  }
}

function assertExactKeys(value, expectedKeys, path) {
  const actualKeys = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  assert(
    actualKeys.length === expected.length &&
      actualKeys.every((key, index) => key === expected[index]),
    `${path} contém campos inesperados`,
  );
}

function parseRelease(value) {
  assert(isRecord(value), "release ausente");
  assertExactKeys(value, ["key", "version", "effectiveFrom"], "release");
  assert(typeof value.key === "string" && value.key.length > 0, "release.key");
  assert(Number.isInteger(value.version) && value.version > 0, "release.version");
  assert(
    typeof value.effectiveFrom === "string" &&
      !Number.isNaN(Date.parse(value.effectiveFrom)),
    "release.effectiveFrom",
  );

  return {
    key: value.key,
    version: value.version,
    effectiveFrom: value.effectiveFrom,
  };
}

function parseOffer(value, index) {
  assert(isRecord(value), `offers[${index}]`);
  assertExactKeys(
    value,
    [
      "productCode",
      "displayName",
      "description",
      "productKind",
      "billingInterval",
      "currency",
      "unitAmountCents",
      "publicFeatures",
    ],
    `offers[${index}]`,
  );
  assert(OFFER_CODES.includes(value.productCode), `offers[${index}].productCode`);
  assert(
    value.productKind === PRODUCT_KINDS[value.productCode],
    `offers[${index}].productKind`,
  );
  assert(value.billingInterval === "month", `offers[${index}].billingInterval`);
  assert(value.currency === "BRL", `offers[${index}].currency`);
  assert(
    Number.isInteger(value.unitAmountCents) && value.unitAmountCents > 0,
    `offers[${index}].unitAmountCents`,
  );
  assert(
    typeof value.displayName === "string" && value.displayName.length > 0,
    `offers[${index}].displayName`,
  );
  assert(
    typeof value.description === "string" && value.description.length > 0,
    `offers[${index}].description`,
  );
  assert(
    Array.isArray(value.publicFeatures) &&
      value.publicFeatures.every(
        (feature) => typeof feature === "string" && feature.length > 0,
      ),
    `offers[${index}].publicFeatures`,
  );

  return {
    productCode: value.productCode,
    displayName: value.displayName,
    description: value.description,
    productKind: value.productKind,
    billingInterval: value.billingInterval,
    currency: value.currency,
    unitAmountCents: value.unitAmountCents,
    publicFeatures: [...value.publicFeatures],
  };
}

function parseTrial(value) {
  assert(isRecord(value), "trial ausente");
  assertExactKeys(
    value,
    ["durationDays", "requiresPaymentMethod", "maxUsesPerOrganizationCnpj"],
    "trial",
  );
  assert(value.durationDays === 7, "trial.durationDays");
  assert(value.requiresPaymentMethod === true, "trial.requiresPaymentMethod");
  assert(value.maxUsesPerOrganizationCnpj === 1, "trial.maxUsesPerOrganizationCnpj");

  return {
    durationDays: value.durationDays,
    requiresPaymentMethod: value.requiresPaymentMethod,
    maxUsesPerOrganizationCnpj: value.maxUsesPerOrganizationCnpj,
  };
}

function parseChessDiscount(value) {
  assert(isRecord(value), "chessDiscount ausente");
  assertExactKeys(value, ["appliesTo", "tiers"], "chessDiscount");
  assert(
    Array.isArray(value.appliesTo) &&
      value.appliesTo.length === 2 &&
      value.appliesTo.includes("knight") &&
      value.appliesTo.includes("rook"),
    "chessDiscount.appliesTo",
  );
  assert(Array.isArray(value.tiers) && value.tiers.length > 0, "chessDiscount.tiers");

  let previousMax = 0;
  let previousDiscountBps = -1;
  const tiers = value.tiers.map((tier, index) => {
    assert(isRecord(tier), `chessDiscount.tiers[${index}]`);
    assertExactKeys(
      tier,
      ["minUnits", "maxUnits", "discountBps"],
      `chessDiscount.tiers[${index}]`,
    );
    assert(
      Number.isInteger(tier.minUnits) && tier.minUnits === previousMax + 1,
      `chessDiscount.tiers[${index}].minUnits`,
    );
    assert(
      tier.maxUnits === null ||
        (Number.isInteger(tier.maxUnits) && tier.maxUnits >= tier.minUnits),
      `chessDiscount.tiers[${index}].maxUnits`,
    );
    assert(
      Number.isInteger(tier.discountBps) &&
        tier.discountBps >= 0 &&
        tier.discountBps <= 10_000,
      `chessDiscount.tiers[${index}].discountBps`,
    );
    assert(
      tier.discountBps >= previousDiscountBps,
      `chessDiscount.tiers[${index}].discountBps deve ser progressivo`,
    );
    assert(
      index === value.tiers.length - 1 || tier.maxUnits !== null,
      "somente a última faixa pode ser aberta",
    );
    previousMax = tier.maxUnits ?? previousMax;
    previousDiscountBps = tier.discountBps;

    return {
      minUnits: tier.minUnits,
      maxUnits: tier.maxUnits,
      discountBps: tier.discountBps,
    };
  });
  assert(tiers.at(-1)?.maxUnits === null, "a última faixa deve ser aberta");

  return { appliesTo: ["knight", "rook"], tiers };
}

function parseClassification(value) {
  assert(isRecord(value), "classification ausente");
  assertExactKeys(
    value,
    ["metric", "currency", "knightMaxMonthlyRevenueCents"],
    "classification",
  );
  assert(value.metric === "monthly_revenue_cents", "classification.metric");
  assert(value.currency === "BRL", "classification.currency");
  assert(
    Number.isInteger(value.knightMaxMonthlyRevenueCents) &&
      value.knightMaxMonthlyRevenueCents > 0,
    "classification.knightMaxMonthlyRevenueCents",
  );

  return {
    metric: value.metric,
    currency: value.currency,
    knightMaxMonthlyRevenueCents: value.knightMaxMonthlyRevenueCents,
  };
}

export function parsePublicBillingCatalog(value) {
  assert(isRecord(value), "objeto raiz ausente");
  assertExactKeys(
    value,
    ["release", "offers", "trial", "chessDiscount", "classification"],
    "catálogo",
  );
  assert(Array.isArray(value.offers) && value.offers.length === 3, "offers");

  const offers = value.offers.map(parseOffer);
  assert(
    OFFER_CODES.every(
      (productCode) =>
        offers.filter((offer) => offer.productCode === productCode).length === 1,
    ),
    "deve existir exatamente uma oferta Knight, Rook e Chess",
  );

  return {
    release: parseRelease(value.release),
    offers,
    trial: parseTrial(value.trial),
    chessDiscount: parseChessDiscount(value.chessDiscount),
    classification: parseClassification(value.classification),
  };
}

export function parseBillingCatalogSnapshot(value) {
  assert(isRecord(value), "snapshot ausente");
  assertExactKeys(value, ["generatedAt", "sourceUrl", "catalog"], "snapshot");
  assert(
    typeof value.generatedAt === "string" && !Number.isNaN(Date.parse(value.generatedAt)),
    "snapshot.generatedAt",
  );
  assert(
    typeof value.sourceUrl === "string" && value.sourceUrl.startsWith("https://"),
    "snapshot.sourceUrl",
  );

  return {
    generatedAt: value.generatedAt,
    sourceUrl: value.sourceUrl,
    catalog: parsePublicBillingCatalog(value.catalog),
  };
}

export function resolvePublicBillingCatalog(
  liveCandidate,
  snapshotCandidate,
  now = Date.now(),
) {
  try {
    return { catalog: parsePublicBillingCatalog(liveCandidate), source: "live" };
  } catch (liveError) {
    try {
      const snapshot = parseBillingCatalogSnapshot(snapshotCandidate);
      const snapshotAgeMs = now - Date.parse(snapshot.generatedAt);
      assert(snapshotAgeMs >= 0, "snapshot.generatedAt está no futuro");
      assert(
        snapshotAgeMs <= MAX_BILLING_SNAPSHOT_AGE_MS,
        "snapshot excedeu a validade máxima de 7 dias",
      );
      return {
        catalog: snapshot.catalog,
        source: "snapshot",
        snapshotGeneratedAt: snapshot.generatedAt,
        liveError,
      };
    } catch (snapshotError) {
      return { catalog: null, source: "unavailable", liveError, snapshotError };
    }
  }
}

export function formatPriceBRL(unitAmountCents) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(unitAmountCents / 100);
}

function formatUnitRange(minUnits, maxUnits) {
  if (maxUnits === null) return `${minUnits} ou mais`;
  if (minUnits === maxUnits) return `${minUnits}`;
  return `${minUnits}–${maxUnits}`;
}

export function buildBillingCatalogViewModel(catalog) {
  const parsed = parsePublicBillingCatalog(catalog);
  const offersByCode = Object.fromEntries(
    parsed.offers.map((offer) => [offer.productCode, offer]),
  );

  return {
    releaseId: `${parsed.release.key}-v${parsed.release.version}`,
    effectiveFrom: parsed.release.effectiveFrom,
    trialDays: parsed.trial.durationDays,
    requiresPaymentMethod: parsed.trial.requiresPaymentMethod,
    threshold: formatPriceBRL(
      parsed.classification.knightMaxMonthlyRevenueCents,
    ),
    basePlans: ["knight", "rook"].map((productCode) => ({
      ...offersByCode[productCode],
      formattedPrice: formatPriceBRL(offersByCode[productCode].unitAmountCents),
    })),
    chess: {
      ...offersByCode.chess,
      formattedPrice: formatPriceBRL(offersByCode.chess.unitAmountCents),
    },
    chessDiscountTiers: parsed.chessDiscount.tiers.map((tier) => ({
      ...tier,
      unitRangeLabel: formatUnitRange(tier.minUnits, tier.maxUnits),
      discountLabel:
        tier.discountBps === 0 ? "Sem desconto" : `${tier.discountBps / 100}%`,
    })),
  };
}
