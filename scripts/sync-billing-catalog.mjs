import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  MAX_BILLING_SNAPSHOT_AGE_MS,
  parseBillingCatalogSnapshot,
  parsePublicBillingCatalog,
} from "../src/lib/public-billing-catalog.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const snapshotPath = resolve(
  projectRoot,
  "src/data/billing-catalog-v2.snapshot.json",
);
const sourceUrl =
  process.env.ROOK_BILLING_CATALOG_URL?.trim() ||
  "https://app.rook.com.br/api/billing/catalog";

async function readExistingSnapshot() {
  const content = await readFile(snapshotPath, "utf8");
  return parseBillingCatalogSnapshot(JSON.parse(content));
}

try {
  const response = await fetch(sourceUrl, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const catalog = parsePublicBillingCatalog(await response.json());
  const nextSnapshot = {
    generatedAt: new Date().toISOString(),
    sourceUrl,
    catalog,
  };

  await writeFile(snapshotPath, `${JSON.stringify(nextSnapshot, null, 2)}\n`);
  console.log(
    `[ROO-946] Snapshot ${catalog.release.key}-v${catalog.release.version} sincronizado.`,
  );
} catch (error) {
  try {
    const existing = await readExistingSnapshot();
    const snapshotAgeMs = Date.now() - Date.parse(existing.generatedAt);
    if (snapshotAgeMs < 0 || snapshotAgeMs > MAX_BILLING_SNAPSHOT_AGE_MS) {
      throw new Error("snapshot existente excedeu a validade máxima de 7 dias");
    }
    console.warn(
      `[ROO-946] Endpoint indisponível; build seguirá com snapshot validado ${existing.catalog.release.key}-v${existing.catalog.release.version}, gerado em ${existing.generatedAt}.`,
    );
  } catch (snapshotError) {
    console.error("[ROO-946] Sem catálogo público ou snapshot válido.", {
      endpointError: error instanceof Error ? error.message : error,
      snapshotError:
        snapshotError instanceof Error ? snapshotError.message : snapshotError,
    });
    process.exitCode = 1;
  }
}
